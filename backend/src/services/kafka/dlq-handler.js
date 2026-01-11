// src/services/kafka/dlq-handler.js

const { kafka, TOPICS, CONSUMER_GROUPS } = require("../../config/kafka");
const { updateIdempotencyRecord } = require("../../utils/idempotency");

let dlqConsumer = null;
let dlqProducer = null;
let isRunning = false;

/**
 * Initialize DLQ consumer and producer
 */
async function initializeDLQHandling() {
  dlqConsumer = kafka.consumer({
    groupId: CONSUMER_GROUPS.DLQ_CONSUMER,
    allowAutoTopicCreation: true,
  });

  dlqProducer = kafka.producer({
    idempotent: true,
  });

  await dlqConsumer.connect();
  await dlqProducer.connect();

  console.log("✅ DLQ Handler initialized");
}

/**
 * Start DLQ consumer for handling failed deletions
 */
async function startDLQConsumer() {
  if (isRunning) {
    console.log("⚠️ DLQ Consumer already running");
    return;
  }

  try {
    if (!dlqConsumer) await initializeDLQHandling();

    await dlqConsumer.subscribe({
      topic: TOPICS.NOTIFICATION_DELETE_DLQ,
      fromBeginning: false,
    });

    isRunning = true;

    await dlqConsumer.run({
      autoCommit: false,
      eachMessage: async ({ topic, partition, message }) => {
        const idempotencyKey = message.key.toString();

        try {
          const payload = JSON.parse(message.value.toString());

          console.warn(`⚠️ DLQ Message received:`, {
            idempotencyKey,
            attempt: payload.attempt || 1,
            originalError: payload.error,
          });

          // Update record to mark as failed after max retries
          const record = await updateIdempotencyRecord(idempotencyKey, {
            status: "FAILED",
            lastError: `Max retries exceeded: ${payload.error}`,
            retryCount: (payload.attempt || 1) + 1,
          });

          console.error(`🚨 Deletion permanently failed:`, {
            idempotencyKey,
            notificationIds: record.notificationIds,
            userId: record.userId,
          });

          // Send alert (optional: webhook, email, Slack, etc.)
          await sendAlertForFailedDeletion(record);

          // Commit offset only after successful processing
          await dlqConsumer.commitOffsets([
            {
              topic,
              partition,
              offset: (parseInt(message.offset) + 1).toString(),
            },
          ]);
        } catch (error) {
          console.error(`❌ Error processing DLQ message:`, error);
          // Don't commit; message will be retried
          throw error;
        }
      },
    });

    console.log("🎯 DLQ Consumer started");
  } catch (error) {
    console.error("❌ Error starting DLQ consumer:", error);
    isRunning = false;
    throw error;
  }
}

/**
 * Send alert for permanently failed deletions
 * Could integrate with Slack, PagerDuty, email, etc.
 */
async function sendAlertForFailedDeletion(record) {
  try {
    console.log("📧 Alert sent for failed deletion", {
      idempotencyKey: record.idempotencyKey,
      userId: record.userId,
      timestamp: new Date().toISOString(),
    });

    // TODO: Implement actual alerting mechanism
    // Example: Slack webhook
    // const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    // await fetch(slackWebhook, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     text: `🚨 Notification deletion failed`,
    //     blocks: [...]
    //   })
    // });
  } catch (error) {
    console.error("Error sending alert:", error);
  }
}

/**
 * Manually retry a failed deletion
 * Admin operation to manually retry messages from DLQ
 */
async function manuallyRetryDeletion(idempotencyKey, notificationIds) {
  if (!dlqProducer) await initializeDLQHandling();

  try {
    const result = await dlqProducer.send({
      topic: TOPICS.NOTIFICATION_DELETE,
      messages: [
        {
          key: idempotencyKey,
          value: JSON.stringify({
            idempotencyKey,
            notificationIds,
            attempt: 1,
            manualRetry: true,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });

    console.log(`♻️ Manual retry queued:`, {
      idempotencyKey,
      offset: result[0].offset,
    });

    return result;
  } catch (error) {
    console.error("Error queuing manual retry:", error);
    throw error;
  }
}

/**
 * Stop DLQ consumer
 */
async function stopDLQConsumer() {
  if (dlqConsumer && isRunning) {
    await dlqConsumer.disconnect();
    dlqConsumer = null;
    isRunning = false;
    console.log("🔌 DLQ Consumer stopped");
  }

  if (dlqProducer) {
    await dlqProducer.disconnect();
    dlqProducer = null;
  }
}

module.exports = {
  initializeDLQHandling,
  startDLQConsumer,
  stopDLQConsumer,
  manuallyRetryDeletion,
  sendAlertForFailedDeletion,
};
