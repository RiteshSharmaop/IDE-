// backend/examples/ide-analytics-consumer-example.js
// Example: How to consume and process IDE events for analytics

const { kafka, TOPICS } = require("../src/config/kafka");
const { IDE_TOPICS } = require("../src/services/kafka/ide-producer");

/**
 * This is an example of how to build an analytics consumer that:
 * 1. Listens to IDE events from Kafka
 * 2. Processes and aggregates the data
 * 3. Stores insights in a database
 * 4. Can be scaled horizontally
 *
 * To run this:
 * node backend/examples/ide-analytics-consumer-example.js
 */

class IDEAnalyticsConsumer {
  constructor() {
    this.consumer = null;
    this.executionStats = new Map(); // userId -> stats
    this.fileOperationStats = new Map(); // userId -> file operations
  }

  async start() {
    try {
      this.consumer = kafka.consumer({
        groupId: "ide-analytics-consumer-group",
        sessionTimeout: 30000,
        rebalanceTimeout: 60000,
      });

      await this.consumer.connect();
      console.log("✅ Analytics Consumer connected");

      await this.consumer.subscribe({
        topics: [
          IDE_TOPICS.CODE_EXECUTION,
          IDE_TOPICS.FILE_OPERATIONS,
          IDE_TOPICS.IDE_METRICS,
        ],
        fromBeginning: false,
      });

      await this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          try {
            const event = JSON.parse(message.value.toString());
            await this.processEvent(topic, event);
          } catch (error) {
            console.error("Error processing event:", error);
          }
        },
      });

      console.log("🚀 Analytics Consumer running...");
    } catch (error) {
      console.error("❌ Failed to start consumer:", error);
      throw error;
    }
  }

  async processEvent(topic, event) {
    switch (topic) {
      case IDE_TOPICS.CODE_EXECUTION:
        await this.analyzeExecution(event);
        break;
      case IDE_TOPICS.FILE_OPERATIONS:
        await this.analyzeFileOp(event);
        break;
      case IDE_TOPICS.IDE_METRICS:
        await this.analyzeMetrics(event);
        break;
    }
  }

  async analyzeExecution(event) {
    const userId = event.userId;

    // Initialize user stats if not exists
    if (!this.executionStats.has(userId)) {
      this.executionStats.set(userId, {
        userId,
        username: event.username,
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalExecutionTime: 0,
        averageExecutionTime: 0,
        languageStats: {},
        lastExecution: null,
      });
    }

    const stats = this.executionStats.get(userId);
    stats.totalExecutions++;
    stats.totalExecutionTime += event.executionTime;
    stats.averageExecutionTime = Math.round(
      stats.totalExecutionTime / stats.totalExecutions
    );
    stats.lastExecution = event.timestamp;

    if (event.status === "success") {
      stats.successfulExecutions++;
    } else {
      stats.failedExecutions++;
    }

    // Track by language
    if (!stats.languageStats[event.language]) {
      stats.languageStats[event.language] = {
        count: 0,
        totalTime: 0,
        averageTime: 0,
      };
    }
    const langStat = stats.languageStats[event.language];
    langStat.count++;
    langStat.totalTime += event.executionTime;
    langStat.averageTime = Math.round(langStat.totalTime / langStat.count);

    // Log interesting insights
    console.log(`⚡ [EXECUTION] ${event.username}@${event.roomId}`, {
      file: event.fileName,
      language: event.language,
      time: event.executionTime + "ms",
      status: event.status,
      userTotal: stats.totalExecutions,
      avgTime: stats.averageExecutionTime + "ms",
    });

    // TODO: Save to database
    // await CodeExecutionMetric.create(event);
    // await UserExecutionStats.updateOne(
    //   { userId },
    //   { $set: stats },
    //   { upsert: true }
    // );
  }

  async analyzeFileOp(event) {
    const userId = event.userId;

    // Initialize user stats if not exists
    if (!this.fileOperationStats.has(userId)) {
      this.fileOperationStats.set(userId, {
        userId,
        username: event.username,
        createdFiles: 0,
        deletedFiles: 0,
        modifiedFiles: 0,
        savedFiles: 0,
        languageDistribution: {},
      });
    }

    const stats = this.fileOperationStats.get(userId);

    // Count by operation
    switch (event.operation) {
      case "create":
        stats.createdFiles++;
        break;
      case "delete":
        stats.deletedFiles++;
        break;
      case "modify":
        stats.modifiedFiles++;
        break;
      case "save":
        stats.savedFiles++;
        break;
    }

    // Track language distribution
    if (event.language !== "folder") {
      if (!stats.languageDistribution[event.language]) {
        stats.languageDistribution[event.language] = 0;
      }
      stats.languageDistribution[event.language]++;
    }

    console.log(`📁 [FILE-OP] ${event.username}@${event.roomId}`, {
      operation: event.operation,
      file: event.fileName,
      language: event.language,
      userCreated: stats.createdFiles,
      userDeleted: stats.deletedFiles,
    });

    // TODO: Save to database
    // await FileOperationEvent.create(event);
    // await UserFileStats.updateOne(
    //   { userId },
    //   { $set: stats },
    //   { upsert: true }
    // );
  }

  async analyzeMetrics(event) {
    console.log(`📊 [METRICS] ${event.username}@${event.roomId}`, {
      activeFiles: event.activeFiles,
      openFiles: event.openFiles,
      theme: event.theme,
    });

    // TODO: Store metrics for visualization
    // await IDEMetric.create(event);
  }

  async stop() {
    if (this.consumer) {
      await this.consumer.disconnect();
      console.log("🔌 Analytics Consumer stopped");
    }
  }

  // Get current statistics (in-memory)
  getStats() {
    return {
      executionStats: Object.fromEntries(this.executionStats),
      fileOperationStats: Object.fromEntries(this.fileOperationStats),
    };
  }
}

// Example: Run the consumer
if (require.main === module) {
  const consumer = new IDEAnalyticsConsumer();

  consumer.start().catch(console.error);

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("Shutting down...");
    await consumer.stop();
    process.exit(0);
  });

  // Optional: Print stats every 10 seconds
  setInterval(() => {
    const stats = consumer.getStats();
    console.log("\n📈 CURRENT STATS:");
    console.log(JSON.stringify(stats, null, 2));
  }, 10000);
}

module.exports = IDEAnalyticsConsumer;
