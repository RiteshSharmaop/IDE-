// src/services/notificationService.js
const Notification = require("../models/Notification");
const { getRedisClient } = require("../config/redis");

class NotificationService {
  /**
   * Create a notification
   * @param {string} roomId - Room ID
   * @param {string} userId - User ID
   * @param {string} type - Notification type (USER_JOINED, FILE_CREATED, etc.)
   * @param {string} username - Username
   * @param {string} message - Notification message
   * @param {object} metadata - Additional metadata
   * @returns {Promise<Object>} Created notification
   */
  static async createNotification(
    roomId,
    userId,
    type,
    username,
    message,
    metadata = {}
  ) {
    try {
      // Create notification in MongoDB
      const notification = await Notification.create({
        roomId,
        userId,
        type,
        username,
        message,
        metadata,
      });

      // Cache in Redis with a 24-hour expiration
      const cacheKey = `notification:${notification._id}`;
      await getRedisClient().setEx(
        cacheKey,
        86400, // 24 hours
        JSON.stringify(notification)
      );

      // Add to room notifications list in Redis
      const roomNotificationsKey = `room:${roomId}:notifications`;
      await getRedisClient().lPush(
        roomNotificationsKey,
        JSON.stringify(notification)
      );
      await getRedisClient().expire(roomNotificationsKey, 86400);

      // Add to user notifications list in Redis
      const userNotificationsKey = `user:${userId}:notifications`;
      await getRedisClient().lPush(
        userNotificationsKey,
        JSON.stringify(notification)
      );
      await getRedisClient().expire(userNotificationsKey, 86400);

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Get room notifications with Redis caching
   * @param {string} roomId - Room ID
   * @param {number} limit - Number of notifications to fetch
   * @returns {Promise<Array>} Notifications
   */
  static async getRoomNotifications(roomId, limit = 50) {
    try {
      const cacheKey = `room:${roomId}:notifications`;
      const redis = getRedisClient();

      try {
        // Try to get from Redis cache first (using lRange for Redis v4+)
        const cachedData = await redis.lRange(cacheKey, 0, limit - 1);
        if (cachedData && cachedData.length > 0) {
          console.log(`📦 Notifications cache HIT for room ${roomId}`);
          return cachedData.map((item) => JSON.parse(item));
        }
      } catch (redisError) {
        console.warn(
          `⚠️ Redis cache error for room ${roomId}:`,
          redisError.message
        );
        // Continue to fetch from MongoDB
      }

      // If not in cache, fetch from MongoDB
      console.log(
        `📥 Notifications cache MISS for room ${roomId}, fetching from DB`
      );
      const notifications = await Notification.find({ roomId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      // Try to cache the results (but don't fail if Redis is down)
      try {
        if (notifications.length > 0) {
          // Delete old cache first
          await redis.del(cacheKey);
          // Add all notifications to list
          for (const notif of notifications) {
            await redis.lPush(cacheKey, JSON.stringify(notif));
          }
          // Set expiry
          await redis.expire(cacheKey, 86400); // 24 hour expiry
        }
      } catch (cacheError) {
        console.warn(
          `⚠️ Redis caching failed for room ${roomId}:`,
          cacheError.message
        );
        // Continue without caching
      }

      return notifications;
    } catch (error) {
      console.error("Error fetching room notifications:", error);
      throw error;
    }
  }

  /**
   * Get user notifications with Redis caching
   * @param {string} userId - User ID
   * @param {number} limit - Number of notifications to fetch
   * @returns {Promise<Array>} Notifications
   */
  static async getUserNotifications(userId, limit = 50) {
    try {
      const cacheKey = `user:${userId}:notifications`;
      const redis = getRedisClient();

      try {
        // Try to get from Redis cache first (using lRange for Redis v4+)
        const cachedData = await redis.lRange(cacheKey, 0, limit - 1);
        if (cachedData && cachedData.length > 0) {
          console.log(`📦 Notifications cache HIT for user ${userId}`);
          return cachedData.map((item) => JSON.parse(item));
        }
      } catch (redisError) {
        console.warn(
          `⚠️ Redis cache error for user ${userId}:`,
          redisError.message
        );
        // Continue to fetch from MongoDB
      }

      // If not in cache, fetch from MongoDB
      console.log(
        `📥 Notifications cache MISS for user ${userId}, fetching from DB`
      );
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      // Try to cache the results (but don't fail if Redis is down)
      try {
        if (notifications.length > 0) {
          // Delete old cache first
          await redis.del(cacheKey);
          // Add all notifications to list
          for (const notif of notifications) {
            await redis.lPush(cacheKey, JSON.stringify(notif));
          }
          // Set expiry
          await redis.expire(cacheKey, 86400); // 24 hour expiry
        }
      } catch (cacheError) {
        console.warn(
          `⚠️ Redis caching failed for user ${userId}:`,
          cacheError.message
        );
        // Continue without caching
      }

      return notifications;
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      throw error;
    }
  }

  /**
   * Get unread notifications count with Redis caching
   * @param {string} userId - User ID
   * @returns {Promise<number>} Count of unread notifications
   */
  static async getUnreadCount(userId) {
    try {
      const cacheKey = `user:${userId}:unread_count`;
      const redis = getRedisClient();

      try {
        // Try to get from Redis cache first
        const cachedCount = await redis.get(cacheKey);
        if (cachedCount !== null) {
          console.log(`📦 Unread count cache HIT for user ${userId}`);
          return parseInt(cachedCount, 10);
        }
      } catch (redisError) {
        console.warn(
          `⚠️ Redis cache error for unread count ${userId}:`,
          redisError.message
        );
        // Continue to fetch from MongoDB
      }

      // If not in cache, fetch from MongoDB
      console.log(`📥 Unread count cache MISS for user ${userId}`);
      const count = await Notification.countDocuments({ userId, read: false });

      // Try to cache the result for 5 minutes (but don't fail if Redis is down)
      try {
        await redis.setEx(cacheKey, 300, count.toString());
      } catch (cacheError) {
        console.warn(
          `⚠️ Redis caching failed for unread count ${userId}:`,
          cacheError.message
        );
        // Continue without caching
      }

      return count;
    } catch (error) {
      console.error("Error counting unread notifications:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  static async markAsRead(notificationId) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
      );

      // Invalidate user notification and unread count caches
      if (notification && notification.userId) {
        try {
          const redis = getRedisClient();
          const userCacheKey = `user:${notification.userId}:notifications`;
          const unreadCountKey = `user:${notification.userId}:unread_count`;
          await redis.del(userCacheKey, unreadCountKey);
          console.log(
            `📑 Invalidated notification and unread count cache for user ${notification.userId}`
          );
        } catch (cacheError) {
          console.warn(
            `⚠️ Failed to invalidate cache for user ${notification.userId}:`,
            cacheError.message
          );
          // Continue without cache invalidation
        }
      }

      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  /**
   * Mark all notifications for user as read
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Update result
   */
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId, read: false },
        { read: true }
      );

      // Invalidate user notification and unread count caches
      try {
        const redis = getRedisClient();
        const userCacheKey = `user:${userId}:notifications`;
        const unreadCountKey = `user:${userId}:unread_count`;
        await redis.del(userCacheKey, unreadCountKey);
        console.log(
          `📑 Invalidated notification and unread count cache for user ${userId}`
        );
      } catch (cacheError) {
        console.warn(
          `⚠️ Failed to invalidate cache for user ${userId}:`,
          cacheError.message
        );
        // Continue without cache invalidation
      }

      return result;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  /**
   * Delete old notifications (older than 24 hours)
   */
  static async cleanupOldNotifications() {
    try {
      const oneDayAgo = new Date(Date.now() - 86400000);
      const result = await Notification.deleteMany({
        createdAt: { $lt: oneDayAgo },
      });
      console.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result;
    } catch (error) {
      console.error("Error cleaning up notifications:", error);
      throw error;
    }
  }

  /**
   * Create user join notification
   */
  static async notifyUserJoined(roomId, userId, username) {
    const message = `${username} joined the room`;
    return this.createNotification(
      roomId,
      userId,
      "USER_JOINED",
      username,
      message,
      { socketId: null }
    );
  }

  /**
   * Create user left notification
   */
  static async notifyUserLeft(roomId, userId, username) {
    const message = `${username} left the room`;
    return this.createNotification(
      roomId,
      userId,
      "USER_LEFT",
      username,
      message,
      { socketId: null }
    );
  }

  /**
   * Create file created notification
   */
  static async notifyFileCreated(roomId, userId, username, fileName, filePath) {
    const message = `${username} created file "${fileName}"`;
    return this.createNotification(
      roomId,
      userId,
      "FILE_CREATED",
      username,
      message,
      { fileName, filePath }
    );
  }

  /**
   * Create file deleted notification
   */
  static async notifyFileDeleted(roomId, userId, username, fileName) {
    const message = `${username} deleted file "${fileName}"`;
    return this.createNotification(
      roomId,
      userId,
      "FILE_DELETED",
      username,
      message,
      { fileName }
    );
  }

  /**
   * Create folder created notification
   */
  static async notifyFolderCreated(roomId, userId, username, folderName) {
    const message = `${username} created folder "${folderName}"`;
    return this.createNotification(
      roomId,
      userId,
      "FOLDER_CREATED",
      username,
      message,
      { folderName }
    );
  }

  /**
   * Create folder deleted notification
   */
  static async notifyFolderDeleted(roomId, userId, username, folderName) {
    const message = `${username} deleted folder "${folderName}"`;
    return this.createNotification(
      roomId,
      userId,
      "FOLDER_DELETED",
      username,
      message,
      { folderName }
    );
  }

  /**
   * Invalidate all caches for a room
   * @param {string} roomId - Room ID
   */
  static async invalidateRoomCache(roomId) {
    try {
      const cacheKey = `room:${roomId}:notifications`;
      await getRedisClient().del(cacheKey);
      console.log(`🗑️ Cleared notification cache for room ${roomId}`);
    } catch (error) {
      console.error("Error invalidating room cache:", error);
    }
  }

  /**
   * Invalidate all caches for a user
   * @param {string} userId - User ID
   */
  static async invalidateUserCaches(userId) {
    try {
      const redis = getRedisClient();
      const userNotifKey = `user:${userId}:notifications`;
      const unreadCountKey = `user:${userId}:unread_count`;
      await redis.del(userNotifKey, unreadCountKey);
      console.log(`🗑️ Cleared all caches for user ${userId}`);
    } catch (error) {
      console.error("Error invalidating user caches:", error);
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache stats
   */
  static async getCacheStats() {
    try {
      const redis = getRedisClient();
      const info = await redis.info("keyspace");
      const dbSize = await redis.dbSize();

      return {
        dbSize,
        info,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error getting cache stats:", error);
      return null;
    }
  }
}

module.exports = NotificationService;
