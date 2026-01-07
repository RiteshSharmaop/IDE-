// src/controllers/notificationController.js
const NotificationService = require("../services/notificationService");
const Notification = require("../models/Notification");

/**
 * @desc    Get room notifications
 * @route   GET /api/notifications/room/:roomId
 * @access  Private
 */
exports.getRoomNotifications = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50 } = req.query;
    console.log("Notification call came getRoomNotifications");

    const notifications = await NotificationService.getRoomNotifications(
      roomId,
      parseInt(limit)
    );

    // Prevent client-side 304 Not Modified responses for this endpoint
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Get room notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching room notifications",
      error: error.message,
    });
  }
};

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications/user
 * @access  Private
 */
exports.getUserNotifications = async (req, res) => {
  console.log("Notification call came getUserNotifications");
  try {
    const userId = req.user?.id || req.user?._id;
    const { limit = 50 } = req.query;

    const notifications = await NotificationService.getUserNotifications(
      userId,
      parseInt(limit)
    );

    // Prevent caching / 304 responses
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Get user notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user notifications",
      error: error.message,
    });
  }
};

/**
 * @desc    Get unread notifications count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const count = await NotificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching unread count",
      error: error.message,
    });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:notificationId/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await NotificationService.markAsRead(notificationId);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking notification as read",
      error: error.message,
    });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/mark-all-read
 * @access  Private
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const result = await NotificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: result,
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking all notifications as read",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:notificationId
 * @access  Private
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message,
    });
  }
};

/**
 * @desc    Cleanup old notifications
 * @route   POST /api/notifications/cleanup
 * @access  Private (Admin)
 */
exports.cleanupOldNotifications = async (req, res) => {
  try {
    const result = await NotificationService.cleanupOldNotifications();

    res.status(200).json({
      success: true,
      message: "Old notifications cleaned up",
      data: result,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    res.status(500).json({
      success: false,
      message: "Error cleaning up notifications",
      error: error.message,
    });
  }
};
