// src/services/kafka/consumer.js

const { kafka, TOPICS, CONSUMER_GROUPS } = require("../../config/kafka");
const Notification = require("../../models/Notification");
const { updateIdempotencyRecord } = require("../../utils/idempotency");

let consumer = null;
let isRunning = false;

/**
 * Initialize Kafka consumer for async hard deletion
 */
async function initializeConsumer() {
  if (consumer) return consumer;

  consumer = kafka.consumer({
    groupId: CONSUMER_GROUPS.DELETE_CONSUMER,
    allowAutoTopicCreation: true,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
  });

  await consumer.connect();
  console.log("✅ Kafka Consumer initialized");
  return consumer;
}

/**
 * Start consuming deletion requests
 * Hard delete (remove from DB) after soft delete confirmation
 */
async function startDeletionConsumer() {
  if (isRunning) {
    console.log("⚠️ Consumer already running");
    return;
  }

  try {
    const cons = await initializeConsumer();

    await cons.subscribe({
      topic: TOPICS.NOTIFICATION_DELETE,
      fromBeginning: false,
    });

    isRunning = true;

    await cons.run({
      autoCommit: false, // Manual commit for safety
      eachMessage: async ({ topic, partition, message }) => {
        const startTime = Date.now();
        let idempotencyKey = null;

        try {
          const payload = JSON.parse(message.value.toString());
          idempotencyKey = payload.idempotencyKey;

          console.log(`📥 Processing deletion request:`, {
            idempotencyKey,
            notificationIds: payload.notificationIds,
            userId: payload.userId,
          });

          // Soft delete (mark as deleted in DB)
          const deletionRecord = await updateIdempotencyRecord(idempotencyKey, {
            status: "SOFT_DELETED",
            messageId: message.key.toString(),
            deletedAt: new Date(),
          });

          // Hard delete (remove from DB) with exponential backoff strategy
          const result = await performHardDeletion(
            payload.notificationIds,
            idempotencyKey
          );

          if (result.success) {
            await updateIdempotencyRecord(idempotencyKey, {
              status: "HARD_DELETED",
              hardDeletedAt: new Date(),
              retryCount: result.retryCount || 0,
            });

            console.log(`✅ Hard deletion completed:`, {
              idempotencyKey,
              deletedCount: result.deletedCount,
              duration: Date.now() - startTime,
            });

            // Commit after successful processing
            await cons.commitOffsets([
              {
                topic,
                partition,
                offset: (parseInt(message.offset) + 1).toString(),
              },
            ]);
          } else {
            // Hard deletion failed, will be retried or sent to DLQ
            throw new Error(`Hard deletion failed: ${result.error}`);
          }
        } catch (error) {
          console.error(`❌ Error processing deletion:`, {
            idempotencyKey,
            error: error.message,
            duration: Date.now() - startTime,
          });

          // Update record with error
          if (idempotencyKey) {
            await updateIdempotencyRecord(idempotencyKey, {
              status: "FAILED",
              lastError: error.message,
              retryCount: await getRetryCount(idempotencyKey),
            });
          }

          // Don't commit; message will be retried
          throw error; // Re-throw to trigger DLQ logic
        }
      },
    });

    console.log("🎯 Deletion consumer started");
  } catch (error) {
    console.error("❌ Error starting deletion consumer:", error);
    isRunning = false;
    throw error;
  }
}

/**
 * Perform hard deletion with retry logic
 * @param {string[]} notificationIds
 * @param {string} idempotencyKey
 * @param {number} retryCount
 * @returns {object}
 */
async function performHardDeletion(
  notificationIds,
  idempotencyKey,
  retryCount = 0
) {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  try {
    // Perform hard delete
    const result = await Notification.deleteMany({
      _id: { $in: notificationIds },
    });

    return {
      success: true,
      deletedCount: result.deletedCount,
      retryCount,
    };
  } catch (error) {
    console.error(`Hard deletion attempt ${retryCount + 1} failed:`, error);

    if (retryCount < maxRetries) {
      // Exponential backoff
      const delayMs = baseDelay * Math.pow(2, retryCount);
      console.log(`⏳ Retrying hard deletion in ${delayMs}ms...`);

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return performHardDeletion(
        notificationIds,
        idempotencyKey,
        retryCount + 1
      );
    }

    // All retries failed
    return {
      success: false,
      error: error.message,
      retryCount,
    };
  }
}

/**
 * Get current retry count for a deletion
 */
async function getRetryCount(idempotencyKey) {
  const record = await updateIdempotencyRecord(idempotencyKey, {
    $inc: { retryCount: 1 },
  });
  return record.retryCount;
}

/**
 * Stop consumer
 */
async function stopDeletionConsumer() {
  if (consumer && isRunning) {
    await consumer.disconnect();
    consumer = null;
    isRunning = false;
    console.log("🔌 Deletion consumer stopped");
  }
}

module.exports = {
  initializeConsumer,
  startDeletionConsumer,
  stopDeletionConsumer,
  performHardDeletion,
};
