// src/hooks/useNotifications.js
import { useState, useCallback, useEffect } from "react";
import {
  getRoomNotifications,
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../lib/notificationApi";
import { useSocket } from "../context/SocketContext";
import { useRoom } from "../context/RoomContext";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { socket } = useSocket();
  const { roomId } = useRoom();

  // Fetch room notifications
  const fetchRoomNotifications = useCallback(async () => {
    if (!roomId) return;

    setLoading(true);
    try {
      const data = await getRoomNotifications(roomId);
      setNotifications(data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching room notifications:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Fetch user notifications
  const fetchUserNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserNotifications();
      setNotifications(data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching user notifications:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.data?.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, []);

  // Mark as read
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        await markNotificationAsRead(notificationId);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
        );
        fetchUnreadCount();
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    },
    [fetchUnreadCount]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  }, []);

  // Delete notification
  const deleteNotif = useCallback(
    async (notificationId) => {
      try {
        await deleteNotification(notificationId);
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );
        fetchUnreadCount();
      } catch (err) {
        console.error("Error deleting notification:", err);
      }
    },
    [fetchUnreadCount]
  );

  // Listen for real-time notifications from socket
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleNewNotification = (data) => {
      if (data.roomId !== roomId) return;

      const newNotification = {
        _id: data.id,
        type: data.type,
        username: data.username,
        message: data.message,
        roomId: data.roomId,
        metadata: data.metadata || {},
        read: false,
        createdAt: data.createdAt,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      fetchUnreadCount();
    };

    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [socket, roomId, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchRoomNotifications,
    fetchUserNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotif,
  };
};
