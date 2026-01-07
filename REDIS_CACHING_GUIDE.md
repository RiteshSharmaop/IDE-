# Redis Caching Implementation for Notifications

## Overview

The notification system now uses Redis as a cache layer to improve performance and reduce database queries. The implementation follows a **cache-first strategy** with intelligent cache invalidation.

## Cache Layers

### 1. **Room Notifications Cache**

- **Key Pattern**: `room:{roomId}:notifications`
- **TTL**: 24 hours
- **Strategy**: Cache-first lookup
- **Invalidation**: Manual via `invalidateRoomCache()`

```javascript
// Usage
const notifications = await NotificationService.getRoomNotifications(roomId);
```

### 2. **User Notifications Cache**

- **Key Pattern**: `user:{userId}:notifications`
- **TTL**: 24 hours
- **Strategy**: Cache-first lookup
- **Invalidation**: On markAsRead, markAllAsRead, and manual

```javascript
// Usage
const notifications = await NotificationService.getUserNotifications(userId);
```

### 3. **Unread Count Cache**

- **Key Pattern**: `user:{userId}:unread_count`
- **TTL**: 5 minutes
- **Strategy**: Cache-first lookup
- **Invalidation**: On markAsRead, markAllAsRead

```javascript
// Usage
const count = await NotificationService.getUnreadCount(userId);
```

### 4. **Individual Notification Cache** (Legacy)

- **Key Pattern**: `notification:{notificationId}`
- **TTL**: 24 hours
- **Used**: During notification creation

## Cache Flow

### When a Notification is Fetched

```
1. Check Redis cache for room/user notifications
2. If hit: Return cached data (fast)
3. If miss: Query MongoDB
4. Cache the result in Redis
5. Return to client
```

### When a Notification is Created

```
1. Save to MongoDB
2. Cache individual notification in Redis
3. Add to room notifications list in Redis
4. Add to user notifications list in Redis
5. Invalidate room cache to ensure fresh data
6. Emit Socket.io event to clients
```

### When a Notification is Marked as Read

```
1. Update in MongoDB
2. Invalidate both user notification cache and unread count cache
3. Next fetch will query fresh data from DB
```

## Performance Benefits

### Before Caching

- Every notification fetch: Direct MongoDB query (~100-300ms)
- Multiple users in a room: Multiple DB queries
- High database load

### After Caching

- Cache hit: Return from Redis (~5-10ms)
- Cache miss: Query DB once, cache result
- Next users benefit from cached data
- Unread count: Cached for 5 minutes (significant improvement for this hot query)

## Cache Invalidation Strategy

### Automatic Invalidation

1. **Mark as Read**: Clears user notification cache + unread count cache
2. **Mark All as Read**: Clears user notification cache + unread count cache
3. **New Notification**: Invalidates room cache

### Manual Invalidation (if needed)

```javascript
// Clear all caches for a room
await NotificationService.invalidateRoomCache(roomId);

// Clear all caches for a user
await NotificationService.invalidateUserCaches(userId);

// Get cache statistics
const stats = await NotificationService.getCacheStats();
```

## API Endpoints

### Get Room Notifications

```
GET /api/notifications/room/:roomId?limit=50
```

- First time: Queries MongoDB + caches
- Subsequent calls: Returns from Redis cache

### Get User Notifications

```
GET /api/notifications/user?limit=50
```

- First time: Queries MongoDB + caches
- Subsequent calls: Returns from Redis cache

### Get Unread Count

```
GET /api/notifications/unread-count
```

- First time: Counts from MongoDB + caches for 5 min
- Within 5 min: Returns cached count
- After 5 min: Recalculates and recaches

### Mark as Read

```
PATCH /api/notifications/:id/read
```

- Updates MongoDB
- Invalidates user cache
- Clears unread count cache

## Console Logs for Debugging

### Cache Hits

```
🎁 Notifications cache HIT for room {roomId}
🎁 Notifications cache HIT for user {userId}
🎁 Unread count cache HIT for user {userId}
```

### Cache Misses

```
📥 Notifications cache MISS for room {roomId}, fetching from DB
📥 Notifications cache MISS for user {userId}, fetching from DB
📥 Unread count cache MISS for user {userId}
```

### Cache Invalidation

```
📑 Invalidated notification and unread count cache for user {userId}
🗑️ Cleared notification cache for room {roomId}
🗑️ Cleared all caches for user {userId}
```

## Real-Time Updates

When notifications are created via Socket.io:

1. Socket event is emitted immediately to clients (real-time)
2. Database is updated asynchronously
3. Redis cache is invalidated for next fetch
4. Clients don't need to wait for DB/cache ops

This ensures **real-time notifications** while **maintaining cache consistency**.

## Monitoring Cache Performance

```javascript
// Get cache statistics
const stats = await NotificationService.getCacheStats();
console.log(stats);
// Output:
// {
//   dbSize: 42,  // Total keys in Redis
//   info: "# Keyspace\r\ndb0:keys=42,...",
//   timestamp: Date
// }
```

## Configuration

### TTL Settings (in notificationService.js)

- Notification cache: `86400` seconds (24 hours)
- Unread count cache: `300` seconds (5 minutes)

To adjust:

```javascript
// In getRoomNotifications/getUserNotifications
pipeline.expire(cacheKey, 86400); // Change 86400 to desired seconds

// In getUnreadCount
await redis.setex(cacheKey, 300, count.toString()); // Change 300 for TTL
```

## Best Practices

1. **Always use cache-aware methods** from NotificationService
2. **Trust cache invalidation** - don't manually clear unless debugging
3. **Monitor console logs** for cache hit/miss patterns
4. **Adjust TTL** based on your access patterns
5. **Use getCacheStats()** to monitor Redis usage

## Troubleshooting

### Stale Data Issues

- Check if cache invalidation is being triggered
- Verify Redis is running: `redis-cli ping`
- Clear Redis manually: `redis-cli FLUSHDB`

### Cache Size Growing

- Monitor with `getCacheStats()`
- Verify TTL is working: `redis-cli TTL key-name`
- Check for memory leaks in notification creation

### Performance Not Improving

- Verify cache hits in console logs
- Check Redis connection: `redis-cli INFO stats`
- Monitor Redis memory: `redis-cli INFO memory`

## Future Optimizations

1. **Pub/Sub for Cache Invalidation**: Use Redis Pub/Sub to invalidate cache across multiple servers
2. **Cache Warming**: Pre-load frequently accessed room notifications
3. **Selective Cache**: Only cache notifications for active rooms
4. **Compression**: Compress large notification objects in Redis
5. **Analytics**: Track cache hit/miss ratios for optimization
