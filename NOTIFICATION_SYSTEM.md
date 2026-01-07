# Notification System Documentation

## Overview

A complete real-time notification system that tracks user activities in collaborative code IDE rooms and displays them to all connected users. Notifications are saved in both MongoDB and Redis for persistence and performance.

## Features

### Notification Types

1. **USER_JOINED** - When a user joins a room
2. **USER_LEFT** - When a user leaves a room
3. **FILE_CREATED** - When a file is created
4. **FILE_DELETED** - When a file is deleted
5. **FOLDER_CREATED** - When a folder is created
6. **FOLDER_DELETED** - When a folder is deleted

### Storage

- **MongoDB** - Primary persistent storage with 24-hour TTL
- **Redis** - Caching layer for real-time access
- **Socket.io** - Real-time broadcast to all connected users in a room

## Backend Implementation

### Models

#### Notification Model (`src/models/Notification.js`)

```javascript
{
  roomId: String (indexed),
  userId: ObjectId (ref: User),
  type: Enum (USER_JOINED, USER_LEFT, FILE_CREATED, FILE_DELETED, FOLDER_CREATED, FOLDER_DELETED),
  username: String,
  message: String,
  metadata: {
    fileName: String,
    folderName: String,
    filePath: String,
    socketId: String,
    totalUsers: Number
  },
  read: Boolean (default: false),
  createdAt: Date (TTL: 24 hours),
  updatedAt: Date
}
```

### Services

#### NotificationService (`src/services/notificationService.js`)

**Core Methods:**

- `createNotification()` - Create and save notification to MongoDB & Redis
- `getRoomNotifications()` - Fetch notifications for a specific room
- `getUserNotifications()` - Fetch notifications for a user
- `getUnreadCount()` - Get count of unread notifications
- `markAsRead()` - Mark single notification as read
- `markAllAsRead()` - Mark all user notifications as read
- `cleanupOldNotifications()` - Remove notifications older than 24 hours

**Convenience Methods:**

- `notifyUserJoined()` - Create user joined notification
- `notifyUserLeft()` - Create user left notification
- `notifyFileCreated()` - Create file created notification
- `notifyFileDeleted()` - Create file deleted notification
- `notifyFolderCreated()` - Create folder created notification
- `notifyFolderDeleted()` - Create folder deleted notification

### Controllers

#### NotificationController (`src/controllers/notificationController.js`)

**REST Endpoints:**

- `GET /api/notifications/room/:roomId` - Get room notifications
- `GET /api/notifications/user` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:notificationId/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:notificationId` - Delete notification
- `POST /api/notifications/cleanup` - Cleanup old notifications

### Routes

#### Notification Routes (`src/routes/notifications.js`)

All routes are protected with authentication middleware.

### Socket Events

#### Backend Socket Handlers (`src/socket.js`)

**Events Emitted:**

- `notification` - Broadcast notification to all users in room

**Events Received:**

- `joinRoom` - {roomId, username, userId}
- `createFile` - {file, roomId, username, userId}
- `deleteFile` - {fileId, roomId, username, userId, fileName}
- `createFolder` - {folderName, roomId, username, userId}
- `disconnect` - User disconnection

### Integration Points

All room/file operations now emit notifications:

1. **User Join:**

   ```javascript
   socket.on("joinRoom", async ({ roomId, username, userId }) => {
     // Creates USER_JOINED notification
     await NotificationService.notifyUserJoined(roomId, userId, username);
     io.to(roomId).emit("notification", {...});
   });
   ```

2. **File Creation:**

   ```javascript
   socket.on("createFile", async ({ file, roomId, username, userId }) => {
     // Creates FILE_CREATED notification
     await NotificationService.notifyFileCreated(roomId, userId, username, file.name);
     io.to(roomId).emit("notification", {...});
   });
   ```

3. **File Deletion:**

   ```javascript
   socket.on("deleteFile", async ({ fileId, roomId, username, userId, fileName }) => {
     // Creates FILE_DELETED notification
     await NotificationService.notifyFileDeleted(roomId, userId, username, fileName);
     io.to(roomId).emit("notification", {...});
   });
   ```

4. **Folder Creation:**

   ```javascript
   socket.on("createFolder", async ({ folderName, roomId, username, userId }) => {
     // Creates FOLDER_CREATED notification
     await NotificationService.notifyFolderCreated(roomId, userId, username, folderName);
     io.to(roomId).emit("notification", {...});
   });
   ```

5. **User Disconnect:**
   ```javascript
   socket.on("disconnect", async () => {
     // Creates USER_LEFT notification
     await NotificationService.notifyUserLeft(roomId, userId, username);
     io.to(roomId).emit("notification", {...});
   });
   ```

## Frontend Implementation

### Components

#### CheckboxInTable Component (`src/components/CheckboxInTable.jsx`)

Main notification display component with:

- Real-time notification listening via Socket.io
- Checkbox selection for multiple operations
- Mark as read functionality
- Delete notification functionality
- Notification type badges with color coding
- Time formatting (e.g., "2m ago")
- Unread count display

### Hooks

#### useNotifications Hook (`src/hooks/useNotifications.js`)

Custom hook providing:

- `notifications` - Array of notifications
- `unreadCount` - Count of unread notifications
- `loading` - Loading state
- `error` - Error state
- `fetchRoomNotifications()` - Fetch room notifications
- `fetchUserNotifications()` - Fetch user notifications
- `fetchUnreadCount()` - Fetch unread count
- `markAsRead()` - Mark single notification as read
- `markAllAsRead()` - Mark all as read
- `deleteNotif()` - Delete notification
- Real-time socket event listening

### API Library

#### Notification API (`src/lib/notificationApi.js`)

Helper functions for API calls:

- `getRoomNotifications(roomId, limit)` - Fetch room notifications
- `getUserNotifications(limit)` - Fetch user notifications
- `getUnreadCount()` - Get unread count
- `markNotificationAsRead(notificationId)` - Mark as read
- `markAllNotificationsAsRead()` - Mark all as read
- `deleteNotification(notificationId)` - Delete notification
- `deleteMultipleNotifications(notificationIds)` - Delete multiple

### Socket Event Emissions

Updated in frontend to include userId:

1. **Join Room:**

   ```javascript
   socket.emit("joinRoom", {
     roomId: savedRoomId,
     username: user?.username,
     userId: user?._id,
   });
   ```

2. **Create File:**

   ```javascript
   socket.emit("createFile", {
     file: newFile,
     roomId: roomId,
     username: user?.username,
     userId: user?._id,
   });
   ```

3. **Delete File:**

   ```javascript
   socket.emit("deleteFile", {
     fileId: fileId,
     roomId: roomId,
     username: user?.username,
     userId: user?._id,
     fileName: files.find((f) => f.id === fileId)?.name,
   });
   ```

4. **Create Folder:**
   ```javascript
   socket.emit("createFolder", {
     folderName: newFolderName,
     roomId: roomId,
     username: user?.username,
     userId: user?._id,
   });
   ```

## Data Flow

### Real-Time Flow (Socket.io)

```
User Action (File Create)
    ↓
Frontend emit socket event with userId
    ↓
Backend socket handler receives
    ↓
NotificationService.createNotification()
    ↓
Save to MongoDB ↓ Save to Redis
    ↓
Backend emits "notification" event to room
    ↓
All connected users receive notification
    ↓
Frontend updates CheckboxInTable component
```

### API Flow (REST)

```
User requests notifications
    ↓
Frontend calls notificationApi.getRoomNotifications()
    ↓
Backend GET /api/notifications/room/:roomId
    ↓
NotificationService.getRoomNotifications()
    ↓
Query MongoDB (with Redis cache)
    ↓
Return notifications to frontend
    ↓
Frontend displays in CheckboxInTable
```

## Configuration

### Environment Variables

No additional environment variables needed. Uses existing:

- `MONGODB_URI` - MongoDB connection
- `REDIS_URL` - Redis connection
- `CLIENT_URL` - Frontend URL for CORS

### Data Retention

- MongoDB notifications: 24-hour TTL (auto-delete)
- Redis notifications: 24-hour expiration
- Cache keys: `notification:{id}`, `room:{roomId}:notifications`, `user:{userId}:notifications`

## Error Handling

All operations include try-catch blocks:

- Backend: Logs errors and returns error responses
- Frontend: Logs errors and handles gracefully
- Socket events: Non-blocking notifications (won't crash the app)

## Performance Considerations

1. **Indexing:**

   - `roomId` - Fast room notification queries
   - `userId` + `read` - Fast unread queries
   - `createdAt` - TTL index for auto-cleanup

2. **Caching:**

   - Room notifications cached in Redis
   - User notifications cached in Redis
   - 24-hour expiration on all cache entries

3. **Real-Time:**

   - Socket.io broadcasts only to users in specific room
   - No polling required
   - Instant updates via socket events

4. **Cleanup:**
   - MongoDB TTL index auto-deletes after 24 hours
   - Redis auto-expires after 24 hours
   - Can manually run cleanup endpoint

## Usage Examples

### Backend - Create Notification

```javascript
const NotificationService = require("./services/notificationService");

// User joined
await NotificationService.notifyUserJoined(roomId, userId, "john_doe");

// File created
await NotificationService.notifyFileCreated(
  roomId,
  userId,
  "jane_doe",
  "app.js",
  "src/app.js"
);

// File deleted
await NotificationService.notifyFileDeleted(
  roomId,
  userId,
  "john_doe",
  "app.js"
);

// Folder created
await NotificationService.notifyFolderCreated(
  roomId,
  userId,
  "jane_doe",
  "components"
);
```

### Frontend - Use Notifications

```javascript
import { useNotifications } from "@/hooks/useNotifications";
import CheckboxInTable from "@/components/CheckboxInTable";

export default function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    fetchRoomNotifications,
    markAsRead,
    deleteNotif,
  } = useNotifications();

  useEffect(() => {
    fetchRoomNotifications();
  }, []);

  return (
    <div>
      <h2>Notifications ({unreadCount} unread)</h2>
      <CheckboxInTable />
    </div>
  );
}
```

## Testing

### Manual Testing

1. Open IDE in multiple browser tabs
2. Perform actions (create/delete files, folders, join/leave)
3. Verify notifications appear in all tabs in real-time
4. Test mark as read functionality
5. Test delete functionality
6. Refresh page and verify notifications persist

### API Testing

```bash
# Get room notifications
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/notifications/room/ROOM_ID

# Get user notifications
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/notifications/user

# Get unread count
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/notifications/unread-count

# Mark as read
curl -X PUT -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/notifications/NOTIF_ID/read

# Delete notification
curl -X DELETE -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/notifications/NOTIF_ID
```

## Future Enhancements

1. **Notification Preferences:**

   - Allow users to mute specific notification types
   - Notification sound/desktop alerts

2. **Email Notifications:**

   - Send email digests of daily notifications
   - Real-time email for critical activities

3. **Notification Categories:**

   - Group notifications by type
   - Filter by activity type

4. **Analytics:**

   - Track notification metrics
   - User activity heatmaps

5. **Advanced Search:**
   - Search notifications by username, type, date range
   - Saved searches/filters
