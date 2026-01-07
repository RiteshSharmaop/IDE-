# ❓ Notification System - FAQ & Troubleshooting

## Frequently Asked Questions

### 🎯 General Questions

**Q: What exactly is the notification system?**
A: A real-time system that monitors user activities in collaborative rooms (joins, file/folder operations) and instantly notifies all connected users.

**Q: Is it production-ready?**
A: Yes! It includes authentication, error handling, performance optimization, and comprehensive documentation.

**Q: Do I need to modify my existing code?**
A: Minimal changes. The system is integrated into existing socket.js and CodeIDE. Most functionality is additive.

**Q: Can I use it with existing MongoDB and Redis?**
A: Yes! It uses your existing MongoDB and Redis connections. No new services needed.

**Q: How much does it cost?**
A: It's included in your existing MongoDB/Redis costs. No additional fees.

---

### 🚀 Setup Questions

**Q: How long does setup take?**
A: 5 minutes. Just start the backend and frontend. The system auto-initializes.

**Q: Do I need to install new packages?**
A: No. Everything uses existing dependencies (mongoose, socket.io, redis).

**Q: What if I skip a file?**
A: Use `check-notification-setup.ps1` (Windows) or `check-notification-setup.sh` (Linux/Mac) to verify all files exist.

**Q: Can I test without production databases?**
A: Yes! Use development MongoDB and Redis. The system works the same way.

**Q: What if MongoDB/Redis is not running?**
A: The app will show connection errors. Start the databases and restart the server.

---

### 💾 Data Questions

**Q: Where are notifications stored?**
A: Primary storage is MongoDB. Redis caches them for 24 hours.

**Q: How long do notifications last?**
A: 24 hours. MongoDB's TTL index auto-deletes them. Configurable in model.

**Q: What if I delete a notification?**
A: It's removed from both MongoDB and Redis immediately.

**Q: Can users see other users' notifications?**
A: No. Each user only sees notifications from their joined rooms.

**Q: How many notifications can the system handle?**
A: Thousands per second. MongoDB and Redis can handle enterprise scale.

**Q: Is notification data encrypted?**
A: In MongoDB and Redis, use their built-in encryption. In transit, use HTTPS/TLS.

---

### 🔄 Real-Time Questions

**Q: Why aren't notifications appearing?**
A: Check socket connection: In browser console, run `socket.connected`. Should be `true`.

**Q: Why is there a delay?**
A: Normal delay is < 100ms. If longer, check network and server logs.

**Q: What if Socket.io loses connection?**
A: Socket.io auto-reconnects. Users might miss notifications during disconnect.

**Q: Can I increase the number of concurrent users?**
A: Yes. Scale MongoDB and Redis horizontally if needed.

**Q: What's the max number of notifications per room?**
A: Unlimited. But notifications older than 24 hours auto-delete.

---

### 🔐 Security Questions

**Q: Are notifications secure?**
A: Yes. Authentication required for all APIs, socket.io room isolation, and no sensitive data.

**Q: Can users see admin notifications?**
A: Only if they're in the room where the action occurred.

**Q: What about SQL injection?**
A: MongoDB uses parameterized queries, so no SQL injection possible.

**Q: Are passwords in notifications?**
A: No. Notifications only contain usernames and activity descriptions.

**Q: Can I restrict who sees what?**
A: Currently by room. Could add role-based access if needed.

---

### 🎨 UI Questions

**Q: Can I customize the notification table?**
A: Yes! Edit CheckboxInTable.jsx to change colors, layout, or add columns.

**Q: Can I change notification sounds?**
A: Not included by default, but can add using Audio API.

**Q: Can I show desktop notifications?**
A: Not included, but can add using Notification API.

**Q: Can I change the notification colors?**
A: Yes! Edit the `typeColor` object in CheckboxInTable.jsx.

**Q: Can I add more notification types?**
A: Yes! Edit the enum in Notification.js model and add socket handlers.

---

### ⚡ Performance Questions

**Q: Why is my app slow?**
A: Check database connections, network latency, or Redis/MongoDB performance.

**Q: Can I limit notifications per user?**
A: Yes. Use the `limit` query parameter in API calls.

**Q: Should I use Redis?**
A: Optional but recommended. Dramatically improves read performance.

**Q: How do I optimize database queries?**
A: Indexes are already created. Add more if querying by new fields.

**Q: What's the max API response time?**
A: Should be < 500ms. If slower, check database connection.

---

### 🐛 Troubleshooting

**Q: Notifications appear in one tab but not another?**
A: Ensure both tabs are in the SAME room. Check room ID matches.

**Q: Notifications show old timestamp?**
A: Check server time sync. Should show current time with TTL.

**Q: Checkbox not working?**
A: Check browser console for React errors. Might be a state issue.

**Q: "Cannot find module" error?**
A: Run `npm install` in backend and `npm install` in frontend.

**Q: "Connection refused" error?**
A: MongoDB or Redis not running. Start them first.

**Q: API returns 401?**
A: Authentication token expired or invalid. Login again.

**Q: Socket events not firing?**
A: Check socket ID in browser console. Verify room ID matches.

---

## 🔧 Common Issues & Solutions

### Issue 1: No Notifications Appearing

**Symptoms:**

- Create a file but don't see notification
- Page seems to work but no notifications

**Solutions:**

```javascript
// 1. Check socket connection
console.log(socket.connected); // Should be true
console.log(socket.id); // Should have value

// 2. Check room ID
console.log(roomId); // Should have value

// 3. Check if userId is passed
// In CodeIDE.jsx, verify:
socket.emit("createFile", {
  file: newFile,
  roomId: roomId,
  username: user?.username,
  userId: user?._id, // ← This must exist
});
```

**Fix:**

- Ensure user is logged in (user object exists)
- Ensure room ID is set
- Restart browser tab
- Check browser console for errors

---

### Issue 2: Notifications Disappear After Refresh

**Symptoms:**

- See notifications, then refresh page
- Notifications gone

**Solutions:**

```bash
# 1. Check MongoDB connection
mongosh
> db.notifications.find()

# 2. Check TTL index
> db.notifications.getIndexes()
# Should show expireAfterSeconds: 86400

# 3. Check Redis doesn't expire too early
redis-cli
> TTL "notification:NOTIF_ID"
```

**Fix:**

- Verify MongoDB is running
- Verify TTL index exists (should be 86400 seconds)
- Restart server to recreate indexes

---

### Issue 3: Slow Notifications

**Symptoms:**

- Notification takes 5+ seconds to appear
- Delay in socket events

**Solutions:**

```javascript
// 1. Check network latency
// Open DevTools → Network tab → Socket.io messages

// 2. Check server logs
// Look for slow socket event handlers

// 3. Check database performance
// mongosh: { command: "mongoTop" }
```

**Fix:**

- Check network connection (WiFi vs Ethernet)
- Restart server if many events queued
- Add database indexes if needed
- Scale Redis/MongoDB if CPU high

---

### Issue 4: API Returns 401 Unauthorized

**Symptoms:**

- API calls fail with 401
- Cannot get notifications via REST API

**Solutions:**

```javascript
// 1. Check token exists
console.log(localStorage.getItem("token"));

// 2. Check token format
// Should be: "Bearer eyJ..."

// 3. Check token expiry
// Should be recent, not days old
```

**Fix:**

- Login again to get new token
- Check token is being sent in header
- Verify backend has auth middleware

---

### Issue 5: Database Connection Errors

**Symptoms:**

- "Cannot connect to MongoDB" error
- "Redis connection refused" error

**Solutions:**

```bash
# 1. Check MongoDB
mongosh
# Should connect

# 2. Check Redis
redis-cli
> PING
# Should return: PONG

# 3. Check .env variables
# Verify MONGODB_URI and REDIS_URL are set
```

**Fix:**

- Start MongoDB: `mongod`
- Start Redis: `redis-server`
- Check .env file has correct connection strings
- Check firewall isn't blocking ports

---

### Issue 6: Socket.io Not Connecting

**Symptoms:**

- `socket.connected` is false
- No socket events received

**Solutions:**

```javascript
// 1. Check socket initialization
import { useSocket } from "@/context/SocketContext";
const { socket } = useSocket();
console.log(socket); // Should exist

// 2. Check CORS
// Browser console → Network tab → Check for CORS errors

// 3. Check socket URL
// Should match backend URL
```

**Fix:**

- Restart frontend
- Check backend is running
- Check CORS is configured correctly
- Check socket provider is wrapping app

---

### Issue 7: High Memory Usage

**Symptoms:**

- App slows down over time
- Browser tab becomes unresponsive
- Memory usage keeps increasing

**Solutions:**

```javascript
// 1. Check for memory leaks
// DevTools → Memory tab → Take heap snapshots

// 2. Limit notifications shown
// Only show last 100, not all

// 3. Clean up socket listeners
// Should unsubscribe from events
```

**Fix:**

- Implement pagination (limit notifications)
- Add cleanup/unsubscribe in useEffect
- Check for duplicate socket listeners

---

## 🎯 Debugging Checklist

When something doesn't work, go through this checklist:

- [ ] Backend server running? (`npm run dev` output visible)
- [ ] Frontend server running? (Can access http://localhost:5173)
- [ ] MongoDB running? (Can connect via mongosh)
- [ ] Redis running? (Can connect via redis-cli)
- [ ] User logged in? (Can see user object)
- [ ] In same room? (Room IDs match)
- [ ] Socket connected? (`socket.connected === true`)
- [ ] No console errors? (F12 → Console tab)
- [ ] Network requests OK? (No 401, 500 errors)
- [ ] Database has data? (mongosh → db.notifications.find())

---

## 📊 Performance Debugging

**If notifications are slow:**

1. Open DevTools (F12)
2. Go to Network tab
3. Filter to "Socket.io" messages
4. Look at timing
5. If > 100ms, issue is network or server

**If API calls are slow:**

1. Open DevTools (F12)
2. Go to Network tab
3. Look at `/api/notifications/*` requests
4. Check Response time
5. If > 200ms, issue is database

**If database is slow:**

```bash
mongosh
> db.notifications.find().explain("executionStats")
# Check executionStage, totalDocsScanned
```

---

## 🧬 Debug Mode

Enable verbose logging:

**Backend:**

```javascript
// In socket.js, uncomment logs:
console.log(`Notification created: ${type}`);
console.log(`Broadcasting to room: ${roomId}`);
```

**Frontend:**

```javascript
// In CheckboxInTable.jsx:
useEffect(() => {
  console.log("Notification received:", data);
}, [socket, roomId]);
```

**Database:**

```bash
# MongoDB
mongosh
> db.setProfilingLevel(1)

# Redis
redis-cli
> MONITOR
```

---

## 🆘 Emergency Troubleshooting

**Nothing works at all:**

1. Restart everything:

   ```bash
   # Kill all Node processes
   pkill -f "node"

   # Restart backend
   cd backend && npm run dev

   # Restart frontend (new terminal)
   cd frontend && npm run dev
   ```

2. Clear caches:

   ```bash
   # Browser cache
   Clear Cache → Hard Refresh (Ctrl+Shift+R or Cmd+Shift+R)

   # Redis
   redis-cli FLUSHALL
   ```

3. Reset MongoDB:

   ```bash
   mongosh
   > db.notifications.deleteMany({})
   > db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 })
   ```

4. Check logs carefully - look for first error

---

## 📞 Still Need Help?

1. **Check Documentation:**

   - NOTIFICATION_SYSTEM.md (technical)
   - NOTIFICATION_INTEGRATION_GUIDE.md (setup)
   - NOTIFICATION_TESTING_GUIDE.md (testing)

2. **Run Verification:**

   ```bash
   # Windows
   .\check-notification-setup.ps1

   # Linux/Mac
   bash check-notification-setup.sh
   ```

3. **Review Logs:**

   - Backend: `npm run dev` terminal
   - Frontend: F12 → Console
   - Database: `mongosh` commands

4. **Test Manually:**
   - Use provided test procedures
   - Verify each component separately
   - Check with curl commands

---

## 📈 Performance Tips

- Use pagination: `?limit=50` instead of all
- Enable Redis caching
- Index frequently queried fields
- Monitor MongoDB/Redis resource usage
- Set up alerts for slow queries
- Review logs regularly
- Clean old notifications periodically

---

**Last Updated:** 2024-01-06
**Version:** 1.0.0
