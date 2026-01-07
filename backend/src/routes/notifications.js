// src/routes/notifications.js
const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getRoomNotifications,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  cleanupOldNotifications,
} = require("../controllers/notificationController");

const router = express.Router();

// Protect all routes
router.use(protect);

// Get room notifications
router.get("/room/:roomId", getRoomNotifications);

// Get user notifications
router.get("/user", getUserNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark notification as read
router.put("/:notificationId/read", markAsRead);

// Mark all as read
router.put("/mark-all-read", markAllAsRead);

// Delete notification
router.delete("/:notificationId", deleteNotification);

// Cleanup old notifications (admin only)
router.post("/cleanup", cleanupOldNotifications);

module.exports = router;
