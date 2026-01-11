// src/services/kafka/producer.js

const { kafka, TOPICS } = require("../../config/kafka");

let producer = null;

/**
 * Initialize Kafka producer
 */
async function initializeProducer() {
  if (producer) return producer;

  producer = kafka.producer({
    allowAutoTopicCreation: true,
    transactionTimeout: 60000,
    idempotent: true, // Enable idempotent producer for exactly-once semantics
    maxInFlightRequests: 5,
  });

  await producer.connect();
  console.log("✅ Kafka Producer initialized");
  return producer;
}

/**
 * Publish deletion request to Kafka
 * @param {object} message - { idempotencyKey, userId, notificationIds, timestamp }
 * @returns {object} send result
 */
async function publishDeletionRequest(message) {
  try {
    const prod = await initializeProducer();

    const result = await prod.send({
      topic: TOPICS.NOTIFICATION_DELETE,
      messages: [
        {
          key: message.idempotencyKey, // Use idempotency key as partition key for ordering
          value: JSON.stringify({
            ...message,
            publishedAt: new Date().toISOString(),
          }),
          headers: {
            "content-type": "application/json",
            "correlation-id": message.idempotencyKey,
          },
        },
      ],
      timeout: 30000,
      compression: 1, // Gzip compression
    });

    console.log(`📤 Deletion request published:`, {
      idempotencyKey: message.idempotencyKey,
      partition: result[0].partition,
      offset: result[0].offset,
    });

    return result;
  } catch (error) {
    console.error("❌ Error publishing deletion request:", error);
    throw error;
  }
}

/**
 * Disconnect producer
 */
async function disconnectProducer() {
  if (producer) {
    await producer.disconnect();
    producer = null;
    console.log("🔌 Kafka Producer disconnected");
  }
}

module.exports = {
  initializeProducer,
  publishDeletionRequest,
  disconnectProducer,
};
