// src/services/kafka/ide-producer.js
// Kafka producer for IDE events (code execution, file operations, etc.)

const { kafka } = require("../../config/kafka");

let producer = null;

// IDE Event Topics
const IDE_TOPICS = {
  CODE_EXECUTION: "code-execution-events",
  FILE_OPERATIONS: "file-operation-events",
  IDE_METRICS: "ide-metrics",
};

/**
 * Initialize IDE Kafka producer
 */
async function initializeIDEProducer() {
  if (producer) return producer;

  try {
    producer = kafka.producer({
      allowAutoTopicCreation: true,
      idempotent: true,
      maxInFlightRequests: 5,
      transactionTimeout: 60000,
    });

    await producer.connect();
    console.log("✅ IDE Kafka Producer initialized");
    return producer;
  } catch (error) {
    console.error("❌ Failed to initialize IDE producer:", error);
    throw error;
  }
}

/**
 * Publish code execution event to Kafka
 * @param {object} data - { userId, username, roomId, fileName, language, executionTime, status, output, error }
 */
async function publishCodeExecution(data) {
  try {
    const prod = await initializeIDEProducer();

    const event = {
      eventId: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: "CODE_EXECUTION",
      userId: data.userId,
      username: data.username,
      roomId: data.roomId || "default",
      fileName: data.fileName,
      language: data.language,
      executionTime: data.executionTime,
      status: data.status, // 'success' or 'error'
      outputLength: data.output ? data.output.length : 0,
      hasError: !!data.error,
      timestamp: new Date().toISOString(),
    };

    const result = await prod.send({
      topic: IDE_TOPICS.CODE_EXECUTION,
      messages: [
        {
          key: `${data.userId}:${data.roomId}`, // Partition by user + room
          value: JSON.stringify(event),
          headers: {
            "content-type": "application/json",
            "event-type": "code-execution",
            "correlation-id": event.eventId,
          },
        },
      ],
      timeout: 10000,
    });

    console.log(`📤 Code execution event published:`, {
      eventId: event.eventId,
      user: data.username,
      language: data.language,
      partition: result[0].partition,
    });

    return event;
  } catch (error) {
    console.error("❌ Error publishing code execution event:", error);
    throw error;
  }
}

/**
 * Publish file operation event to Kafka
 * @param {object} data - { userId, username, roomId, operation, fileName, filePath, language }
 */
async function publishFileOperation(data) {
  try {
    const prod = await initializeIDEProducer();

    const event = {
      eventId: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: "FILE_OPERATION",
      userId: data.userId,
      username: data.username,
      roomId: data.roomId || "default",
      operation: data.operation, // 'create', 'delete', 'modify', 'save'
      fileName: data.fileName,
      filePath: data.filePath,
      language: data.language,
      timestamp: new Date().toISOString(),
    };

    const result = await prod.send({
      topic: IDE_TOPICS.FILE_OPERATIONS,
      messages: [
        {
          key: `${data.userId}:${data.roomId}`,
          value: JSON.stringify(event),
          headers: {
            "content-type": "application/json",
            "event-type": "file-operation",
            "correlation-id": event.eventId,
          },
        },
      ],
      timeout: 10000,
    });

    console.log(`📤 File operation event published:`, {
      eventId: event.eventId,
      operation: data.operation,
      file: data.fileName,
      partition: result[0].partition,
    });

    return event;
  } catch (error) {
    console.error("❌ Error publishing file operation event:", error);
    throw error;
  }
}

/**
 * Publish IDE metrics event to Kafka
 * @param {object} data - { userId, username, roomId, activeFiles, openFiles, theme }
 */
async function publishIDEMetrics(data) {
  try {
    const prod = await initializeIDEProducer();

    const event = {
      eventId: `metrics-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      eventType: "IDE_METRICS",
      userId: data.userId,
      username: data.username,
      roomId: data.roomId || "default",
      activeFiles: data.activeFiles,
      openFiles: data.openFiles,
      theme: data.theme,
      timestamp: new Date().toISOString(),
    };

    const result = await prod.send({
      topic: IDE_TOPICS.IDE_METRICS,
      messages: [
        {
          key: `${data.userId}:${data.roomId}`,
          value: JSON.stringify(event),
          headers: {
            "content-type": "application/json",
            "event-type": "ide-metrics",
            "correlation-id": event.eventId,
          },
        },
      ],
      timeout: 10000,
    });

    console.log(`📤 IDE metrics event published:`, {
      eventId: event.eventId,
      activeFiles: data.activeFiles,
      openFiles: data.openFiles,
    });

    return event;
  } catch (error) {
    console.error("❌ Error publishing IDE metrics:", error);
    // Don't throw for metrics - they're non-critical
  }
}

/**
 * Disconnect IDE producer
 */
async function disconnectIDEProducer() {
  if (producer) {
    await producer.disconnect();
    producer = null;
    console.log("🔌 IDE Kafka Producer disconnected");
  }
}

module.exports = {
  initializeIDEProducer,
  publishCodeExecution,
  publishFileOperation,
  publishIDEMetrics,
  disconnectIDEProducer,
  IDE_TOPICS,
};
