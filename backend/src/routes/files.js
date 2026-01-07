// src/routes/fileRoutes.js
const express = require("express");
const router = express.Router();
const {
  createFile,
  getFiles,
  getFile,
  updateFile,
  deleteFile,
  saveFileToRoom,
  getRoomFiles,
} = require("../controllers/fileController");
const { protect } = require("../middleware/auth");

// @route   POST /api/files
// @desc    Create a new file
// @access  Private
router.post("/", protect, createFile);

// @route   GET /api/files
// @desc    Get all files for logged-in user (with pagination + search)
// @access  Private
router.get("/", protect, getFiles);

// @route   GET /api/files/:id
// @desc    Get a single file by ID
// @access  Private
router.get("/:id", protect, getFile);

// @route   PUT /api/files/:id
// @desc    Update a file (name/content)
// @access  Private
router.put("/:id", protect, updateFile);

// @route   DELETE /api/files/:id
// @desc    Soft delete a file
// @access  Private
router.delete("/:id", protect, deleteFile);

// @route   POST /api/files/:fileId/save-to-room/:roomId
// @desc    Save file to room
// @access  Private
router.post("/:fileId/save-to-room/:roomId", protect, saveFileToRoom);

// @route   GET /api/files/room/:roomId
// @desc    Get all files in a room
// @access  Private
router.get("/room/:roomId", protect, getRoomFiles);

module.exports = router;
