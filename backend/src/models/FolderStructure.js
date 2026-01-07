// src/models/FolderStructure.js
const mongoose = require("mongoose");

const folderStructureSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["folder", "file"],
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FolderStructure",
      default: null,
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      default: null,
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FolderStructure",
      },
    ],
    path: {
      type: String,
      default: "root",
    },
    isExpanded: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for hierarchical queries
folderStructureSchema.index({ userId: 1, roomId: 1, parentId: 1 });
folderStructureSchema.index({ userId: 1, roomId: 1, type: 1 });

module.exports = mongoose.model("FolderStructure", folderStructureSchema);
