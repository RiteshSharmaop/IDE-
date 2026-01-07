// src/models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "USER_JOINED",
        "USER_LEFT",
        "FILE_CREATED",
        "FILE_DELETED",
        "FOLDER_CREATED",
        "FOLDER_DELETED",
      ],
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      fileName: String,
      folderName: String,
      filePath: String,
      socketId: String,
      totalUsers: Number,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
      expires: 86400, // Auto-delete after 24 hours
    },
  },
  { timestamps: true }
);

// Index for efficient queries
notificationSchema.index({ roomId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
