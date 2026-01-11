// backend/src/services/notification-deletion-service.js
// Initialize and manage the notification deletion system

const { initializeProducer, disconnectProducer } = require("./kafka/producer");
const {
  initializeConsumer,
  startDeletionConsumer,
  stopDeletionConsumer,
} = require("./kafka/consumer");
const {
  initializeDLQHandling,
  startDLQConsumer,
  stopDLQConsumer,
} = require("./kafka/dlq-handler");

let isInitialized = false;

/**
 * Initialize the entire notification deletion system
 * Starts Kafka producer, consumer, and DLQ handler
 */
async function initializeNotificationDeletionSystem() {
  if (isInitialized) {
    console.log("⚠️ Notification deletion system already initialized");
    return;
  }

  try {
    console.log("🚀 Initializing Notification Deletion System...");

    // 1. Initialize Kafka producer (for publishing deletion requests)
    await initializeProducer();
    console.log("✅ Kafka Producer initialized");

    // 2. Initialize Kafka consumer (for async hard deletion)
    await initializeConsumer();
    console.log("✅ Kafka Consumer initialized");

    // 3. Start consuming deletion requests (async operation)
    await startDeletionConsumer();
    console.log("✅ Deletion Consumer started");

    // 4. Initialize DLQ handling
    await initializeDLQHandling();
    console.log("✅ DLQ Handler initialized");

    // 5. Start DLQ consumer (async operation)
    await startDLQConsumer();
    console.log("✅ DLQ Consumer started");

    isInitialized = true;
    console.log("🎉 Notification Deletion System fully initialized");
  } catch (error) {
    console.error(
      "❌ Failed to initialize Notification Deletion System:",
      error
    );
    throw error;
  }
}

/**
 * Gracefully shutdown the notification deletion system
 */
async function shutdownNotificationDeletionSystem() {
  try {
    console.log("🛑 Shutting down Notification Deletion System...");

    await stopDeletionConsumer();
    await stopDLQConsumer();
    await disconnectProducer();

    isInitialized = false;
    console.log("✅ Notification Deletion System shutdown complete");
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    throw error;
  }
}

/**
 * Get system status
 */
function getSystemStatus() {
  return {
    isInitialized,
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  initializeNotificationDeletionSystem,
  shutdownNotificationDeletionSystem,
  getSystemStatus,
};
