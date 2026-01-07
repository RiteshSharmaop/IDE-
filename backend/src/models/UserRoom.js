// src/models/UserRoom.js
const mongoose = require("mongoose");

const userRoomSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    roomName: {
      type: String,
      default: "Untitled Room",
    },
    description: {
      type: String,
      default: "",
    },
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
      },
    ],
    folderStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FolderStructure",
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for faster queries
userRoomSchema.index({ userId: 1, roomId: 1 }, { unique: true });
userRoomSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("UserRoom", userRoomSchema);
