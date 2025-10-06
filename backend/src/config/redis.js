// src/config/redis.js
const redis = require('redis');

let redisClient = null;

/**
 * Connect to Redis
 */
const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
      legacyMode: false,
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('🔗 Connecting to Redis...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis connected successfully');
    });

    redisClient.on('end', () => {
      console.log('🔌 Redis connection closed');
    });

    await redisClient.connect();
    await redisClient.set("ritesh" , "sharma" , 10);
    console.log("Value set in redis for testing : " , await redisClient.get("ritesh"));

    // Test the connection
    await redisClient.ping();
    
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    throw error;
  }
};

/**
 * Get Redis client instance
 */
const getRedisClient = () => {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error('Redis client not connected');
  }
  return redisClient;
};

/**
 * Close Redis connection
 */
const closeRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    console.log('✅ Redis connection closed gracefully');
  }
};

/**
 * Cache user data
 * @param {string} userId - User ID
 * @param {object} userData - User data to cache
 * @param {number} ttl - Time to live in seconds (default: 24 hours)
 */
const cacheUser = async (userId, userData, ttl = 86400) => {
  try {
    const client = getRedisClient();
    const key = `user:${userId}`;
    await client.setEx(key, ttl, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Cache user error:', error);
    return false;
  }
};

/**
 * Get cached user data
 * @param {string} userId - User ID
 */
const getCachedUser = async (userId) => {
  try {
    const client = getRedisClient();
    const key = `user:${userId}`;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Get cached user error:', error);
    return null;
  }
};

/**
 * Cache file data
 * @param {string} fileId - File ID
 * @param {object} fileData - File data to cache
 * @param {number} ttl - Time to live in seconds (default: 1 hour)
 */
const cacheFile = async (fileId, fileData, ttl = 3600) => {
  try {
    const client = getRedisClient();
    const key = `file:${fileId}`;
    await client.setEx(key, ttl, JSON.stringify(fileData));
    return true;
  } catch (error) {
    console.error('Cache file error:', error);
    return false;
  }
};

/**
 * Get cached file data
 * @param {string} fileId - File ID
 */
const getCachedFile = async (fileId) => {
  try {
    const client = getRedisClient();
    const key = `file:${fileId}`;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Get cached file error:', error);
    return null;
  }
};

/**
 * Cache user files list
 * @param {string} userId - User ID
 * @param {number} page - Page number
 * @param {string} search - Search query
 * @param {array} files - Files array
 * @param {number} ttl - Time to live in seconds (default: 5 minutes)
 */
const cacheFilesList = async (userId, page, search, files, ttl = 300) => {
  try {
    const client = getRedisClient();
    const key = `user:${userId}:files:${page}:${search || 'all'}`;
    await client.setEx(key, ttl, JSON.stringify(files));
    return true;
  } catch (error) {
    console.error('Cache files list error:', error);
    return false;
  }
};

/**
 * Get cached files list
 * @param {string} userId - User ID
 * @param {number} page - Page number
 * @param {string} search - Search query
 */
const getCachedFilesList = async (userId, page, search) => {
  try {
    const client = getRedisClient();
    const key = `user:${userId}:files:${page}:${search || 'all'}`;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Get cached files list error:', error);
    return null;
  }
};

/**
 * Invalidate user's files cache
 * @param {string} userId - User ID
 */
const invalidateUserFilesCache = async (userId) => {
  try {
    const client = getRedisClient();
    const pattern = `user:${userId}:files:*`;
    const keys = await client.keys(pattern);
    
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Invalidate user files cache error:', error);
    return false;
  }
};

/**
 * Invalidate specific file cache
 * @param {string} fileId - File ID
 */
const invalidateFileCache = async (fileId) => {
  try {
    const client = getRedisClient();
    const key = `file:${fileId}`;
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Invalidate file cache error:', error);
    return false;
  }
};

/**
 * Invalidate user cache
 * @param {string} userId - User ID
 */
const invalidateUserCache = async (userId) => {
  try {
    const client = getRedisClient();
    const key = `user:${userId}`;
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Invalidate user cache error:', error);
    return false;
  }
};

/**
 * Check and increment rate limit
 * @param {string} userId - User ID
 * @param {number} limit - Maximum allowed requests
 * @param {number} windowMs - Time window in milliseconds
 * @returns {object} { allowed: boolean, remaining: number, resetTime: number }
 */
const checkRateLimit = async (userId, limit = 50, windowMs = 3600000) => {
  try {
    const client = getRedisClient();
    const key = `ratelimit:execute:${userId}`;
    const ttl = Math.ceil(windowMs / 1000);
    
    const current = await client.get(key);
    
    if (!current) {
      // First request in window
      await client.setEx(key, ttl, '1');
      return { allowed: true, remaining: limit - 1, resetTime: Date.now() + windowMs };
    }
    
    const count = parseInt(current);
    
    if (count >= limit) {
      const remainingTtl = await client.ttl(key);
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: Date.now() + (remainingTtl * 1000) 
      };
    }
    
    await client.incr(key);
    const remainingTtl = await client.ttl(key);
    
    return { 
      allowed: true, 
      remaining: limit - count - 1, 
      resetTime: Date.now() + (remainingTtl * 1000) 
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the request (fail open)
    return { allowed: true, remaining: limit, resetTime: Date.now() + windowMs };
  }
};

/**
 * Store JWT token in blacklist (for logout)
 * @param {string} token - JWT token
 * @param {number} ttl - Time to live (seconds until token expires)
 */
const blacklistToken = async (token, ttl) => {
  try {
    const client = getRedisClient();
    const key = `blacklist:${token}`;
    await client.setEx(key, ttl, 'true');
    return true;
  } catch (error) {
    console.error('Blacklist token error:', error);
    return false;
  }
};

/**
 * Check if token is blacklisted
 * @param {string} token - JWT token
 */
const isTokenBlacklisted = async (token) => {
  try {
    const client = getRedisClient();
    const key = `blacklist:${token}`;
    const result = await client.get(key);
    return result !== null;
  } catch (error) {
    console.error('Check token blacklist error:', error);
    return false;
  }
};

/**
 * Clear all cache (use with caution)
 */
const clearAllCache = async () => {
  try {
    const client = getRedisClient();
    await client.flushDb();
    console.log('✅ All cache cleared');
    return true;
  } catch (error) {
    console.error('Clear cache error:', error);
    return false;
  }
};

/**
 * Get cache statistics
 */
const getCacheStats = async () => {
  try {
    const client = getRedisClient();
    const info = await client.info('stats');
    const dbSize = await client.dbSize();
    
    return {
      connected: client.isOpen,
      dbSize,
      info: info
    };
  } catch (error) {
    console.error('Get cache stats error:', error);
    return null;
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  closeRedis,
  cacheUser,
  getCachedUser,
  cacheFile,
  getCachedFile,
  cacheFilesList,
  getCachedFilesList,
  invalidateUserFilesCache,
  invalidateFileCache,
  invalidateUserCache,
  checkRateLimit,
  blacklistToken,
  isTokenBlacklisted,
  clearAllCache,
  getCacheStats
};