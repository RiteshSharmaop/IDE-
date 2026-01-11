// src/routes/notificationDeletion.js

const express = require("express");
const { protect } = require("../middleware/auth");
const {
  batchDeleteNotifications,
  getDeletionStatus,
  deleteNotification,
} = require("../controllers/notificationDeletionController");

const router = express.Router();

/**
 * POST /api/notifications/batch-delete
 * Bulk delete notifications
 * Body: { notificationIds: string[] }
 * Returns: 202 Accepted
 */
router.post("/batch-delete", protect, batchDeleteNotifications);

/**
 * GET /api/notifications/deletion/:deletionId/status
 * Check deletion status
 */
router.get("/deletion/:deletionId/status", protect, getDeletionStatus);

/**
 * DELETE /api/notifications/:id
 * Single notification deletion (soft + async hard)
 */
router.delete("/:id", protect, deleteNotification);

module.exports = router;
