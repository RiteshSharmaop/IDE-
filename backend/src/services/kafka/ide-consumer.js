// src/services/kafka/ide-consumer.js
// Kafka consumer for IDE events - logs and processes IDE metrics

const { kafka, CONSUMER_GROUPS } = require("../../config/kafka");
const { IDE_TOPICS } = require("./ide-producer");
const NotificationService = require("../notificationService");

let consumer = null;
let isRunning = false;

/**
 * Initialize IDE Kafka consumer
 */
async function initializeIDEConsumer() {
  if (consumer) return consumer;

  try {
    consumer = kafka.consumer({
      groupId: "ide-events-consumer-group",
      sessionTimeout: 30000,
      rebalanceTimeout: 60000,
      heartbeatInterval: 3000,
    });

    await consumer.connect();
    console.log("✅ IDE Kafka Consumer initialized");
    return consumer;
  } catch (error) {
    console.error("❌ Failed to initialize IDE consumer:", error);
    throw error;
  }
}

/**
 * Start consuming IDE events
 */
async function startIDEConsumer() {
  try {
    const cons = await initializeIDEConsumer();

    await cons.subscribe({
      topics: [
        IDE_TOPICS.CODE_EXECUTION,
        IDE_TOPICS.FILE_OPERATIONS,
        IDE_TOPICS.IDE_METRICS,
      ],
      fromBeginning: false,
    });

    isRunning = true;

    await cons.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());

          console.log(`📨 [${topic}] Event received:`, {
            eventType: event.eventType,
            userId: event.userId,
            username: event.username,
            timestamp: event.timestamp,
          });

          // Process different event types
          switch (topic) {
            case IDE_TOPICS.CODE_EXECUTION:
              await processCodeExecution(event);
              break;
            case IDE_TOPICS.FILE_OPERATIONS:
              await processFileOperation(event);
              break;
            case IDE_TOPICS.IDE_METRICS:
              await processIDEMetrics(event);
              break;
          }
        } catch (error) {
          console.error("Error processing IDE event:", error);
        }
      },
    });

    console.log("🚀 IDE Consumer started, listening for events...");
  } catch (error) {
    console.error("❌ Error starting IDE consumer:", error);
    throw error;
  }
}

/**
 * Process code execution event
 */
async function processCodeExecution(event) {
  console.log("⚡ Processing Code Execution Event:", {
    file: event.fileName,
    language: event.language,
    time: event.executionTime,
    status: event.status,
    user: event.username,
  });

  try {
    // Create notification based on execution status
    if (event.status === "success") {
      await NotificationService.createNotification(
        event.roomId,
        event.userId,
        "CODE_EXECUTED",
        event.username,
        `${event.username} executed ${event.fileName} in ${event.executionTime}ms`,
        {
          fileId: event.fileName,
          language: event.language,
          executionTime: event.executionTime,
          status: event.status,
        }
      );
      console.log(`✅ Notification created for successful execution`);
    } else {
      // Create error notification for failed execution
      await NotificationService.createNotification(
        event.roomId,
        event.userId,
        "CODE_EXECUTION_ERROR",
        event.username,
        `${event.username}'s code execution failed: ${event.fileName}`,
        {
          fileId: event.fileName,
          language: event.language,
          executionTime: event.executionTime,
          status: event.status,
          error: event.error,
        }
      );
      console.log(`❌ Error notification created for failed execution`);
    }

    // TODO: Store metrics in database, update analytics dashboards, etc.
  } catch (error) {
    console.error("❌ Error processing code execution event:", error);
  }
}

/**
 * Process file operation event
 */
async function processFileOperation(event) {
  console.log("📁 Processing File Operation Event:", {
    operation: event.operation,
    file: event.fileName,
    path: event.filePath,
    user: event.username,
  });

  try {
    // Map operation types to notification types
    const notificationTypeMap = {
      create: "FILE_CREATED",
      delete: "FILE_DELETED",
      modify: "FILE_MODIFIED",
      save: "FILE_SAVED",
    };

    const notificationType =
      notificationTypeMap[event.operation] || "FILE_OPERATION";

    // Create notification for file operation
    await NotificationService.createNotification(
      event.roomId,
      event.userId,
      notificationType,
      event.username,
      `${event.username} ${event.operation} file "${event.fileName}"`,
      {
        fileName: event.fileName,
        filePath: event.filePath,
        language: event.language,
        operation: event.operation,
      }
    );

    console.log(
      `✅ File operation notification created: ${event.operation} ${event.fileName}`
    );

    // TODO: Track file operation history, update audit logs, etc.
  } catch (error) {
    console.error("❌ Error processing file operation event:", error);
  }
}

/**
 * Process IDE metrics event
 */
async function processIDEMetrics(event) {
  console.log("📊 Processing IDE Metrics Event:", {
    activeFiles: event.activeFiles,
    openFiles: event.openFiles,
    theme: event.theme,
    user: event.username,
  });

  try {
    // Could store metrics for analytics
    // Could trigger alerts if metrics exceed thresholds
    // Could update user profiles with preferences

    // Example: Store theme preference
    if (event.theme) {
      // Could update user profile or cache theme preference
      console.log(`📋 Theme preference: ${event.theme} for ${event.username}`);
    }

    // Example: Alert if too many files open
    if (event.openFiles > 20) {
      console.warn(
        `⚠️ User ${event.username} has ${event.openFiles} files open`
      );
    }

    // TODO: Store metrics in analytics database, update dashboards, etc.
  } catch (error) {
    console.error("❌ Error processing IDE metrics event:", error);
  }
}

/**
 * Stop IDE consumer
 */
async function stopIDEConsumer() {
  if (consumer && isRunning) {
    try {
      await consumer.disconnect();
      isRunning = false;
      consumer = null;
      console.log("🔌 IDE Consumer disconnected");
    } catch (error) {
      console.error("❌ Error stopping IDE consumer:", error);
      throw error;
    }
  }
}

module.exports = {
  initializeIDEConsumer,
  startIDEConsumer,
  stopIDEConsumer,
};
