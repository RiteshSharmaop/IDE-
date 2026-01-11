// src/models/NotificationDeletion.js
// Track deletion requests for idempotency and audit

const mongoose = require("mongoose");

const notificationDeletionSchema = new mongoose.Schema(
  {
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      // UUID or hash of (userId + notificationIds + timestamp)
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    notificationIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    status: {
      type: String,
      enum: ["PENDING", "SOFT_DELETED", "HARD_DELETED", "FAILED"],
      default: "PENDING",
      index: true,
    },
    messageId: {
      type: String, // Kafka message ID for tracking
      index: true,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    lastError: String,
    deletedAt: Date,
    hardDeletedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
      expires: 604800, // Auto-cleanup after 7 days
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
notificationDeletionSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model(
  "NotificationDeletion",
  notificationDeletionSchema
);
