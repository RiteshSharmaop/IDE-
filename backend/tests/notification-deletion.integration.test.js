// backend/tests/notification-deletion.integration.test.js
// Integration tests for notification deletion system

const mongoose = require("mongoose");
const { publishDeletionRequest } = require("../src/services/kafka/producer");
const Notification = require("../src/models/Notification");
const NotificationDeletion = require("../src/models/NotificationDeletion");
const {
  generateIdempotencyKey,
  checkIdempotency,
} = require("../src/utils/idempotency");

describe("Notification Deletion System", () => {
  let userId;
  let notificationIds = [];

  beforeAll(async () => {
    // Connect to test DB
    await mongoose.connect(process.env.MONGODB_TEST_URI);
    userId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test notifications
    const notifications = await Notification.insertMany([
      {
        roomId: "test-room",
        userId,
        type: "FILE_CREATED",
        username: "testuser",
        message: "test.js created",
      },
      {
        roomId: "test-room",
        userId,
        type: "FILE_CREATED",
        username: "testuser",
        message: "index.js created",
      },
    ]);
    notificationIds = notifications.map((n) => n._id);
  });

  afterEach(async () => {
    // Clean up
    await Notification.deleteMany({});
    await NotificationDeletion.deleteMany({});
  });

  describe("Idempotency", () => {
    test("should prevent duplicate deletions", async () => {
      const key = generateIdempotencyKey(
        userId.toString(),
        notificationIds.map((id) => id.toString())
      );

      // First request
      const result1 = await checkIdempotency(key);
      expect(result1).toBeNull();

      // Simulate first deletion
      const record1 = await NotificationDeletion.create({
        idempotencyKey: key,
        userId,
        notificationIds,
        status: "PENDING",
      });

      // Second request (duplicate)
      const result2 = await checkIdempotency(key);
      expect(result2).not.toBeNull();
      expect(result2.idempotencyKey).toBe(key);
      expect(result2.status).toBe("PENDING");
    });

    test("should generate consistent keys", () => {
      const key1 = generateIdempotencyKey(userId.toString(), [
        "id1",
        "id2",
        "id3",
      ]);
      const key2 = generateIdempotencyKey(
        userId.toString(),
        ["id3", "id1", "id2"] // Different order
      );

      expect(key1).toBe(key2); // Should be identical (sorted)
    });
  });

  describe("Soft Delete", () => {
    test("should soft delete notifications", async () => {
      const before = await Notification.find({ deletedAt: null });
      expect(before).toHaveLength(2);

      // Soft delete
      await Notification.updateMany(
        { _id: { $in: notificationIds } },
        { $set: { deletedAt: new Date(), deletedBy: userId } }
      );

      // After soft delete
      const after = await Notification.find({ deletedAt: null });
      expect(after).toHaveLength(0);

      // But documents still exist
      const all = await Notification.find({});
      expect(all).toHaveLength(2);
      expect(all[0].deletedAt).not.toBeNull();
    });

    test("should exclude soft-deleted from queries", async () => {
      // Soft delete one
      await Notification.updateOne(
        { _id: notificationIds[0] },
        { $set: { deletedAt: new Date() } }
      );

      // Query excluding deleted
      const active = await Notification.find({ deletedAt: null });
      expect(active).toHaveLength(1);
    });
  });

  describe("Kafka Publishing", () => {
    test("should publish deletion request to Kafka", async () => {
      const payload = {
        idempotencyKey: "test-key",
        userId: userId.toString(),
        notificationIds: notificationIds.map((id) => id.toString()),
        timestamp: new Date().toISOString(),
      };

      // This would fail if Kafka is not running
      // In CI/CD, use mock or test containers
      if (process.env.KAFKA_BROKERS) {
        const result = await publishDeletionRequest(payload);
        expect(result).toBeDefined();
        expect(result[0].topic).toBe("notification-delete-requests");
      }
    });
  });

  describe("Status Polling", () => {
    test("should track deletion status", async () => {
      // Create deletion record
      const record = await NotificationDeletion.create({
        idempotencyKey: "test-key",
        userId,
        notificationIds,
        status: "PENDING",
      });

      // Check initial status
      let status = await NotificationDeletion.findById(record._id);
      expect(status.status).toBe("PENDING");

      // Simulate soft delete
      await NotificationDeletion.updateOne(
        { _id: record._id },
        { $set: { status: "SOFT_DELETED", deletedAt: new Date() } }
      );

      status = await NotificationDeletion.findById(record._id);
      expect(status.status).toBe("SOFT_DELETED");

      // Simulate hard delete
      await NotificationDeletion.updateOne(
        { _id: record._id },
        { $set: { status: "HARD_DELETED", hardDeletedAt: new Date() } }
      );

      status = await NotificationDeletion.findById(record._id);
      expect(status.status).toBe("HARD_DELETED");
    });
  });

  describe("Retry Logic", () => {
    test("should increment retry count on failure", async () => {
      const record = await NotificationDeletion.create({
        idempotencyKey: "test-key",
        userId,
        notificationIds,
        status: "FAILED",
        retryCount: 0,
        lastError: "Network timeout",
      });

      // Simulate retry
      const updated = await NotificationDeletion.findByIdAndUpdate(
        record._id,
        { $inc: { retryCount: 1 }, $set: { lastError: null } },
        { new: true }
      );

      expect(updated.retryCount).toBe(1);
    });
  });
});
