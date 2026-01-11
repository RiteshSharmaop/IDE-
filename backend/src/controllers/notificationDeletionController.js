// src/controllers/notificationDeletionController.js

const Notification = require("../models/Notification");
const NotificationDeletion = require("../models/NotificationDeletion");
const {
  generateIdempotencyKey,
  checkIdempotency,
  createIdempotencyRecord,
  updateIdempotencyRecord,
} = require("../utils/idempotency");
const { publishDeletionRequest } = require("../services/kafka/producer");

/**
 * DELETE /api/notifications/batch
 * Bulk delete notifications with idempotency
 * Returns 202 Accepted with deletion request ID
 */
async function batchDeleteNotifications(req, res) {
  try {
    const { notificationIds } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        error: "notificationIds must be a non-empty array",
      });
    }

    // Generate idempotency key
    const idempotencyKey = generateIdempotencyKey(
      userId.toString(),
      notificationIds
    );

    // Check if already processed
    const existingRecord = await checkIdempotency(idempotencyKey);
    if (existingRecord) {
      console.log("♻️ Idempotent request (already processed):", idempotencyKey);
      return res.status(202).json({
        status: "ACCEPTED",
        idempotencyKey,
        message: "Deletion already in progress or completed",
        existingStatus: existingRecord.status,
      });
    }

    // Create idempotency record with PENDING status
    const deletionRecord = await createIdempotencyRecord({
      idempotencyKey,
      userId,
      notificationIds,
      status: "PENDING",
    });

    // Soft delete notifications immediately (optimistic)
    const softDeleteResult = await Notification.updateMany(
      { _id: { $in: notificationIds }, userId },
      {
        $set: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      }
    );

    console.log(
      `🔄 Soft deleted ${softDeleteResult.modifiedCount} notifications`
    );

    // Queue for async hard deletion
    try {
      await publishDeletionRequest({
        idempotencyKey,
        userId: userId.toString(),
        notificationIds: notificationIds,
        timestamp: new Date().toISOString(),
      });
    } catch (kafkaError) {
      console.error("❌ Failed to queue async deletion:", kafkaError);
      // Still return 202 - retry will happen via Kafka retry logic
      // In production, may want to use SQS with longer retention
    }

    // Return 202 Accepted
    return res.status(202).json({
      status: "ACCEPTED",
      idempotencyKey,
      message: "Deletion request accepted and queued for processing",
      deletionId: deletionRecord._id,
      softDeletedCount: softDeleteResult.modifiedCount,
      links: {
        status: `/api/notifications/deletion/${deletionRecord._id}/status`,
      },
    });
  } catch (error) {
    console.error("Error in batchDeleteNotifications:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}

/**
 * GET /api/notifications/deletion/:deletionId/status
 * Check status of a deletion request
 */
async function getDeletionStatus(req, res) {
  try {
    const { deletionId } = req.params;
    const userId = req.user?._id;

    const record = await NotificationDeletion.findById(deletionId);
    if (!record || record.userId.toString() !== userId.toString()) {
      return res.status(404).json({ error: "Deletion record not found" });
    }

    return res.json({
      deletionId: record._id,
      status: record.status,
      notificationIds: record.notificationIds,
      softDeletedAt: record.deletedAt,
      hardDeletedAt: record.hardDeletedAt,
      retryCount: record.retryCount,
      lastError: record.lastError,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  } catch (error) {
    console.error("Error in getDeletionStatus:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

/**
 * DELETE /api/notifications/:id
 * Single notification deletion (maintains backward compatibility)
 */
async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Soft delete
    const result = await Notification.updateOne(
      { _id: id, userId },
      {
        $set: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Queue for async hard deletion
    try {
      await publishDeletionRequest({
        idempotencyKey: `single-${id}`,
        userId: userId.toString(),
        notificationIds: [id],
        timestamp: new Date().toISOString(),
      });
    } catch (kafkaError) {
      console.error("⚠️ Failed to queue async deletion:", kafkaError);
      // Still return success - retry will happen
    }

    return res.json({
      status: "ACCEPTED",
      message: "Notification marked for deletion",
      notificationId: id,
    });
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

module.exports = {
  batchDeleteNotifications,
  getDeletionStatus,
  deleteNotification,
};
