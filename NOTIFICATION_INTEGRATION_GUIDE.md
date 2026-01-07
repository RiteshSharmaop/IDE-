# Notification System - Quick Integration Guide

## What's Been Implemented

A complete real-time notification system that captures and displays all user activities in collaborative rooms:

### ✅ Backend (Node.js/Express)

- **Notification Model** - MongoDB schema with TTL
- **NotificationService** - Core service for all notification operations
- **NotificationController** - REST API endpoints
- **Notification Routes** - `/api/notifications/*` endpoints
- **Socket.io Integration** - Real-time notification broadcasting
- **Redis Caching** - Performance layer for quick retrieval

### ✅ Frontend (React)

- **Updated CheckboxInTable** - Display notifications with rich UI
- **useNotifications Hook** - Complete notification management
- **NotificationApi Library** - API wrapper functions
- **Socket Integration** - Real-time event listening
- **Updated CodeIDE** - Enhanced socket emissions with userId

## Features

### Notification Types

| Type           | Trigger          | Color  |
| -------------- | ---------------- | ------ |
| USER_JOINED    | User enters room | Green  |
| USER_LEFT      | User leaves room | Red    |
| FILE_CREATED   | File created     | Blue   |
| FILE_DELETED   | File deleted     | Orange |
| FOLDER_CREATED | Folder created   | Purple |
| FOLDER_DELETED | Folder deleted   | Pink   |

### Notification Table Features

- ✅ Checkbox selection for batch operations
- ✅ Mark selected as read
- ✅ Delete selected notifications
- ✅ Real-time updates via Socket.io
- ✅ Load historical notifications from API
- ✅ Time formatting (e.g., "2m ago")
- ✅ Unread count display
- ✅ Status indicators (Active/Inactive/Pending)
- ✅ Type-specific coloring and labeling

## Database Storage

### MongoDB

```javascript
// Automatically stores:
- Room ID (indexed for quick queries)
- User ID (who caused the action)
- Notification type
- Username
- Detailed message
- Metadata (file names, folder names, etc.)
- Read status
- Auto-deletes after 24 hours (TTL index)
```

### Redis

```javascript
// Cached for 24 hours:
- notification:{id} - Individual notifications
- room:{roomId}:notifications - Room notification list
- user:{userId}:notifications - User notification list
```

## Files Created/Modified

### New Files

```
backend/
├── src/
│   ├── models/Notification.js          ✨ NEW
│   ├── services/notificationService.js ✨ NEW
│   ├── controllers/notificationController.js ✨ NEW
│   └── routes/notifications.js         ✨ NEW
frontend/
├── src/
│   ├── lib/notificationApi.js          ✨ NEW
│   └── hooks/useNotifications.js       ✨ NEW
└── NOTIFICATION_SYSTEM.md              ✨ NEW
```

### Modified Files

```
backend/
├── src/
│   ├── socket.js                       🔄 UPDATED (notification events)
│   └── server.js                       🔄 UPDATED (notification routes)
frontend/
├── src/
│   ├── components/CheckboxInTable.jsx  🔄 UPDATED (notification display)
│   └── pages/CodeIDE.jsx               🔄 UPDATED (socket emissions)
```

## Backend Setup

### 1. No Additional Dependencies Required

All notifications use existing packages (mongoose, socket.io, redis)

### 2. Start Backend

```bash
cd backend
npm install  # If needed
npm run dev  # or node src/server.js
```

The notification system automatically:

- Creates MongoDB collection with TTL index
- Connects to Redis
- Initializes Socket.io handlers
- Registers API routes

## Frontend Setup

### 1. No Additional Dependencies Required

Uses existing React, Socket.io, and API infrastructure

### 2. Start Frontend

```bash
cd frontend
npm install  # If needed
npm run dev
```

### 3. Access Notifications

The CheckboxInTable component is automatically:

- Listening for real-time socket events
- Loading historical notifications from API
- Displaying all notification types with proper formatting

## Real-Time Flow

```
User Action in Room
     ↓
Frontend emit socket event with userId
     ↓
Backend receive & create notification
     ↓
Save to MongoDB ↔ Redis cache
     ↓
Emit "notification" event to all users in room
     ↓
Frontend receive via socket
     ↓
Add to notifications table
     ↓
Display to all connected users
```

## API Endpoints Reference

### Get Room Notifications

```bash
GET /api/notifications/room/:roomId?limit=50
Authorization: Bearer TOKEN
Response: { success: true, count: N, data: [...notifications] }
```

### Get User Notifications

```bash
GET /api/notifications/user?limit=50
Authorization: Bearer TOKEN
Response: { success: true, count: N, data: [...notifications] }
```

### Get Unread Count

```bash
GET /api/notifications/unread-count
Authorization: Bearer TOKEN
Response: { success: true, data: { unreadCount: N } }
```

### Mark Notification as Read

```bash
PUT /api/notifications/:notificationId/read
Authorization: Bearer TOKEN
Response: { success: true, message: "Notification marked as read", data: {...} }
```

### Mark All as Read

```bash
PUT /api/notifications/mark-all-read
Authorization: Bearer TOKEN
Response: { success: true, message: "All notifications marked as read" }
```

### Delete Notification

```bash
DELETE /api/notifications/:notificationId
Authorization: Bearer TOKEN
Response: { success: true, message: "Notification deleted successfully" }
```

## Socket Events

### Emitted from Backend (to frontend)

```javascript
// Real-time notification broadcast
socket.emit("notification", {
  id: ObjectId,
  type: "USER_JOINED|USER_LEFT|FILE_CREATED|FILE_DELETED|FOLDER_CREATED",
  username: "user_name",
  message: "User action message",
  roomId: "room_id",
  metadata: { fileName, folderName, etc },
  createdAt: timestamp,
});
```

### Received by Backend (from frontend)

```javascript
// User joins room
socket.emit("joinRoom", {
  roomId: String,
  username: String,
  userId: ObjectId, // 🆕 IMPORTANT
});

// File creation
socket.emit("createFile", {
  file: { id, name, content, language, folder },
  roomId: String,
  username: String,
  userId: ObjectId, // 🆕 IMPORTANT
});

// File deletion
socket.emit("deleteFile", {
  fileId: String,
  roomId: String,
  username: String,
  userId: ObjectId, // 🆕 IMPORTANT
  fileName: String, // 🆕 IMPORTANT
});

// Folder creation
socket.emit("createFolder", {
  folderName: String,
  roomId: String,
  username: String,
  userId: ObjectId, // 🆕 IMPORTANT
});
```

## Testing the System

### 1. Open Multiple Tabs

```
Tab 1: http://localhost:5173 (Login as User A)
Tab 2: http://localhost:5173 (Login as User B)
Both join same room
```

### 2. Test Each Notification Type

- Tab 1: Create a file → See notification in Tab 2
- Tab 1: Delete a file → See notification in Tab 2
- Tab 1: Create a folder → See notification in Tab 2
- Tab 2: Close browser → See "User Left" in Tab 1

### 3. Test Table Features

- Select notifications → Click "Mark as Read"
- Select notifications → Click "Delete"
- Verify time formatting and status badges
- Refresh page → Verify notifications persist

### 4. Test Persistence

```bash
# Check MongoDB
mongosh
use ide_db
db.notifications.find().limit(5)

# Check Redis
redis-cli
KEYS room:*:notifications
LRANGE room:ROOM_ID:notifications 0 -1
```

## Troubleshooting

### No Notifications Appearing

1. Check browser console for errors
2. Verify Socket.io connection: `socket.connected` should be `true`
3. Ensure both users are in same room
4. Check backend logs for socket events

### Notifications Not Persisting

1. Verify MongoDB connection: `mongosh < mongodb.uri >`
2. Check Redis connection: `redis-cli ping`
3. Verify TTL index: `db.notifications.getIndexes()`

### Socket Events Not Emitting

1. Ensure `userId` is included in socket emissions
2. Check that user object has `_id` property
3. Verify Socket.io namespace is correct

### API Not Working

1. Verify authentication token is valid
2. Check Bearer token format in headers
3. Verify room ID exists in database

## Performance Notes

- ✅ Indexed MongoDB queries for fast retrieval
- ✅ Redis caching reduces database hits
- ✅ Socket.io broadcasts only to relevant room
- ✅ Auto-cleanup of old notifications (24h TTL)
- ✅ Supports thousands of concurrent notifications

## Security

- ✅ All API endpoints require authentication
- ✅ Users can only see notifications for their rooms
- ✅ Socket.io room-based isolation
- ✅ No sensitive data in notifications

## Next Steps (Optional Enhancements)

1. **Add Notification Sound/Badge**

   - Browser notifications API
   - Desktop alert notifications

2. **Add Notification Preferences**

   - User settings to mute certain types
   - Notification frequency controls

3. **Add Email Notifications**

   - Daily digest emails
   - Critical activity alerts

4. **Add Notification Search**

   - Filter by type, user, date
   - Full-text search in messages

5. **Add Notification Export**
   - Export as CSV/PDF
   - Audit trail generation
