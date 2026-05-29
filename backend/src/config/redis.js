// src/config/redis.js
const redis = require('redis');



let redisClient;

const createClientWithOptions = (opts = {}) => {
  return redis.createClient({
    socket: {
      host: opts.host || 'localhost',
      port: opts.port || 6379,
      connectTimeout: opts.connectTimeout || 5000,
      reconnectStrategy: (retries) => {
        if (retries > (opts.maxReconnectAttempts || 2)) {
          console.warn('⚠️  Redis reconnection attempts exhausted');
          return new Error('Redis reconnection failed');
        }
        return retries * 100;
      }
    },
    password: opts.password || undefined,
    username: opts.username || undefined,
  });
};

// connect to local redis server (localhost)
const connectRedisLocal = async () => {
  try {
    redisClient = createClientWithOptions({
      host: process.env.REDIS_LOCAL_HOST || '127.0.0.1',
      port: process.env.REDIS_LOCAL_PORT ? parseInt(process.env.REDIS_LOCAL_PORT) : 6379,
      connectTimeout: 3000,
      maxReconnectAttempts: 2,
    });

    // Event listeners
    redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err.message));
    redisClient.on('connect', () => console.log('🔗 Connecting to Redis (local)...'));
    redisClient.on('ready', () => console.log('✅ Redis (local) connected successfully'));
    redisClient.on('end', () => console.log('🔌 Redis (local) connection closed'));

    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis local connection timeout')), 3000))
    ]);

    return redisClient;
  } catch (error) {
    console.error('⚠️  Redis (local) connection failed:', error.message);
    redisClient = null;
    return null;
  }
};

// connect to redis using env vars (works for docker service, localhost, and cloud)
const connectRedisCloud = async () => {
  try {
    
    const host = process.env.REDIS_HOST || 'redis';
    const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
    const password = process.env.REDIS_PASSWORD || undefined;
    const username = process.env.REDIS_USERNAME || undefined;
    
    // When running locally, REDIS_HOST may be set to localhost.
    // When running under Docker Compose, REDIS_HOST should be the redis service name.
    console.log(`ℹ️  Connecting to Redis at ${host}:${port}...`);

    redisClient = createClientWithOptions({
      host,
      port,
      connectTimeout: 5000,
      password,
      username,
      maxReconnectAttempts: 3
    });

    // Event listeners
    redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err.message));
    redisClient.on('connect', () => console.log('🔗 Connecting to Redis...'));
    redisClient.on('ready', () => console.log('✅ Redis connected successfully'));
    redisClient.on('end', () => console.log('🔌 Redis connection closed'));

    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 5000))
    ]);

    // test ping
    try {
      const pong = await redisClient.ping();
      console.log('✅ Ping response from Redis:', pong);
    } catch (e) {
      console.warn('⚠️  Ping test failed:', e.message);
    }
    try {
      redisClient.set('redis_test_key', 'test_value', 'EX', 60); // set a test key with 60s TTL

      console.log('✅ set test key in Redis successfully');
    } catch (e) {
      console.warn('⚠️  Set test key failed:', e.message);
    }

    return redisClient;
  } catch (error) {
    console.error('⚠️  Redis connection failed:', error.message);
    redisClient = null;
    return null;
  }
};

// Backwards-compatible default: connectRedis will connect to local Redis
const connectRedis = connectRedisLocal;


/**
 * Get Redis client instance
 */
const getRedisClient = () => {
  if (!redisClient) {
    console.warn('⚠️  Redis client not available');
    return null;
  }
  if (!redisClient.isOpen) {
    console.warn('⚠️  Redis client not connected');
    return null;
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
    if (!client) return false;
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
    if (!client) return null;
    const key = `user:${userId}`;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Get cached user error:', error);
    return null;
  }
};

/**
 * Generic cache setter
 * @param {string} key
 * @param {any} value
 * @param {number} ttl - seconds
 */
const setCache = async (key, value, ttl = 86400) => {
  try {
    const client = getRedisClient();
    if (!client) return false;
    const payload = typeof value === 'string' ? value : JSON.stringify(value);
    await client.setEx(key, ttl, payload);
    return true;
  } catch (error) {
    console.error('Set cache error:', error);
    return false;
  }
};

/**
 * Generic cache getter
 * @param {string} key
 */
const getCache = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) return null;
    const data = await client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  } catch (error) {
    console.error('Get cache error:', error);
    return null;
  }
};

/**
 * Delete a cache key
 * @param {string} key
 */
const deleteCache = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) return false;
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Delete cache error:', error);
    return false;
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
    if (!client) return false;
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
    if (!client) return null;
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
    if (!client) return false;
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
    if (!client) return null;
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
    if (!client) return false;
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
    if (!client) return false;
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
    if (!client) return false;
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
    if (!client) {
      // If Redis unavailable, allow the request (fail open)
      return { allowed: true, remaining: limit, resetTime: Date.now() + windowMs };
    }
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
    if (!client) return false;
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
    if (!client) return false; // If Redis unavailable, token is not blacklisted
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
    if (!client) return false;
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
  connectRedisLocal,
  connectRedisCloud,
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
  getCache,
  setCache,
  deleteCache,
  getCacheStats,
  redisClient
};