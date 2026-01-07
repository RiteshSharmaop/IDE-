// src/lib/notificationApi.js
import { getAuthToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Get room notifications
 */
export const getRoomNotifications = async (roomId, limit = 50) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/room/${roomId}?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch room notifications");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching room notifications:", error);
    throw error;
  }
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (limit = 50) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/user?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user notifications");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    throw error;
  }
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/unread-count`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch unread count");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/${notificationId}/read`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to mark notification as read");
    }

    return await response.json();
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/mark-all-read`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to mark all notifications as read");
    }

    return await response.json();
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/${notificationId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete notification");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

/**
 * Delete multiple notifications
 */
export const deleteMultipleNotifications = async (notificationIds) => {
  try {
    const promises = notificationIds.map((id) => deleteNotification(id));
    return await Promise.all(promises);
  } catch (error) {
    console.error("Error deleting multiple notifications:", error);
    throw error;
  }
};
