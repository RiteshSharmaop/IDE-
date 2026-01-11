// src/config/kafka.js

const { Kafka, logLevel } = require("kafkajs");

const kafka = new Kafka({
  clientId: "hexahub-api",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  logLevel: logLevel.INFO,
  retry: {
    initialRetryTime: 100,
    retries: 8,
    maxRetryTime: 30000,
    multiplier: 2,
  },
  connectionTimeout: 10000,
  requestTimeout: 30000,
});

// Topics
const TOPICS = {
  NOTIFICATION_DELETE: "notification-delete-requests",
  NOTIFICATION_DELETE_DLQ: "notification-delete-requests-dlq",
  NOTIFICATION_DELETE_RESULTS: "notification-delete-results",
};

// Consumer Groups
const CONSUMER_GROUPS = {
  DELETE_CONSUMER: "notification-delete-consumer-group",
  DLQ_CONSUMER: "notification-delete-dlq-consumer-group",
};

module.exports = {
  kafka,
  TOPICS,
  CONSUMER_GROUPS,
};
