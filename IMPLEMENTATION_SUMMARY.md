# HexaHub - Rooms & Notifications Feature Implementation

## Overview

This document summarizes the implementation of the **Rooms Management System** and **Persistent Notifications** for the HexaHub Code IDE application.

---

## ✅ Features Implemented

### 1. **Rooms Management System**

A complete room management system that allows users to organize their code files into different rooms with team collaboration support.

#### Backend Models

- **UserRoom** (`backend/src/models/UserRoom.js`)

  - Stores user-specific room information
  - Links users, files, and folder structures
  - Tracks collaborators and last access time
  - Unique compound index for userId + roomId

- **FolderStructure** (`backend/src/models/FolderStructure.js`)
  - Hierarchical folder/file organization
  - Parent-child relationships
  - Supports file references
  - Path tracking for easy navigation

#### Backend Controllers & Routes

- **Room Controller** (`backend/src/controllers/roomController.js`)

  - `getUserRooms()` - Get all user rooms
  - `createUserRoom()` - Create new room with root folder
  - `getRoomStructure()` - Get room with complete folder hierarchy
  - `saveFolderStructure()` - Persist folder structure to DB
  - `updateLastAccessed()` - Track last access time
  - `deleteUserRoom()` - Remove room and associated data

- **Room Routes** (`backend/src/routes/room.js`)

  - Protected routes with authentication middleware
  - RESTful endpoints for room CRUD operations

- **File Controller Extensions** (`backend/src/controllers/fileController.js`)

  - `saveFileToRoom()` - Associate file with specific room
  - `getRoomFiles()` - Get all files in a room

- **File Routes Updates** (`backend/src/routes/files.js`)
  - New endpoints for room-file relationships

### 2. **Persistent Notifications System**

Replaces volatile client-side notifications with persistent server-side storage.

#### Backend Models

- **Notification** (`backend/src/models/Notification.js`)
  - Stores user notifications with metadata
  - Auto-deletion after 7 days using TTL index
  - Unread status tracking
  - Support for multiple notification types:
    - `USER_JOINED`
    - `USER_LEFT`
    - `FILE_CREATED`
    - `FOLDER_CREATED`
    - `CODE_EXECUTED`
    - `FILE_MODIFIED`

#### Backend Controllers & Routes

- **Notification Controller** (`backend/src/controllers/notificationController.js`)

  - `createNotification()` - Create new notification
  - `getNotifications()` - Get room-specific notifications with pagination
  - `getAllNotifications()` - Get all user notifications
  - `markAsRead()` - Mark single notification as read
  - `markAllAsRead()` - Mark all room notifications as read
  - `deleteNotification()` - Delete single notification
  - `deleteAllNotifications()` - Delete all notifications for a room

- **Notification Routes** (`backend/src/routes/notifications.js`)
  - Protected endpoints for notification management

### 3. **Frontend Components**

#### Rooms Sidebar Component

**File:** `frontend/src/components/RoomsSidebar.jsx`

- Visual room list with expand/collapse functionality
- Create new room functionality
- Delete room with confirmation
- Display room metadata:
  - Last accessed time
  - Number of collaborators
  - File count
  - Room description
- Real-time status with hover interactions

#### API Utility Functions

- **Room API** (`frontend/src/lib/roomApi.js`)

  - `getUserRooms()` - Fetch all user rooms
  - `createUserRoom()` - Create new room
  - `getRoomStructure()` - Get room with folder hierarchy
  - `saveFolderStructure()` - Save folder structure
  - `updateLastAccessed()` - Update last accessed time
  - `deleteUserRoom()` - Delete room
  - `saveFileToRoom()` - Save file to room
  - `getRoomFiles()` - Get room files

- **Notification API** (`frontend/src/lib/notificationApi.js`)
  - `createNotification()` - Create notification
  - `getNotifications()` - Get room notifications
  - `getAllNotifications()` - Get all notifications
  - `markNotificationAsRead()` - Mark as read
  - `markAllNotificationsAsRead()` - Mark all as read
  - `deleteNotification()` - Delete notification
  - `deleteAllNotifications()` - Delete all notifications

#### CodeIDE Page Integration

**File:** `frontend/src/pages/CodeIDE.jsx`

- Added room state management:
  - `rooms` - Array of user rooms
  - `activeRoom` - Currently selected room
  - `loadingRooms` - Loading state
  - `notifications` - Room notifications
- Room handler functions:
  - `loadUserRooms()` - Load rooms on mount
  - `handleCreateRoom()` - Create new room
  - `handleDeleteRoom()` - Delete room
  - `handleRoomClick()` - Switch active room
  - `loadRoomNotifications()` - Load room notifications
  - `handleSaveFileToRoom()` - Save file to room
- RoomsSidebar component integration
- Automatic room loading on component mount

---

## 🔧 Backend Server Configuration

**File:** `backend/src/server.js`

- Added notification routes to Express app
- Route mounted at `/api/notifications`

---

## 📊 Database Schema

### UserRoom Collection

```
{
  userId: ObjectId (index),
  roomId: String (unique with userId),
  roomName: String,
  description: String,
  files: [ObjectId],
  folderStructure: ObjectId,
  collaborators: [ObjectId],
  isActive: Boolean,
  lastAccessed: Date (index),
  createdAt: Date (index),
  updatedAt: Date
}
```

### FolderStructure Collection

```
{
  userId: ObjectId (index),
  roomId: String (index),
  name: String,
  type: 'folder' | 'file',
  parentId: ObjectId,
  fileId: ObjectId,
  children: [ObjectId],
  path: String,
  isExpanded: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Collection

```
{
  userId: ObjectId (index),
  roomId: String (index),
  type: String (enum),
  title: String,
  message: String,
  metadata: Mixed,
  isRead: Boolean,
  createdAt: Date (index),
  expiresAt: Date (TTL index)
}
```

---

## 🚀 API Endpoints

### Room Endpoints

```
POST   /api/rooms/create-user-room         - Create room
GET    /api/rooms/user-rooms               - Get all user rooms
GET    /api/rooms/:roomId/structure        - Get room structure
POST   /api/rooms/:roomId/save-structure   - Save folder structure
PUT    /api/rooms/:roomId/last-accessed    - Update last accessed
DELETE /api/rooms/:roomId                  - Delete room
```

### Notification Endpoints

```
POST   /api/notifications                           - Create notification
GET    /api/notifications                           - Get all notifications
GET    /api/notifications/:roomId                   - Get room notifications
PUT    /api/notifications/:notificationId/read      - Mark as read
PUT    /api/notifications/read-all/:roomId          - Mark all as read
DELETE /api/notifications/:notificationId           - Delete notification
DELETE /api/notifications/:roomId/all               - Delete all for room
```

### File Endpoints (Extended)

```
POST   /api/files/:fileId/save-to-room/:roomId    - Save file to room
GET    /api/files/room/:roomId                     - Get room files
```

---

## 🔐 Security Features

1. **Authentication Protection**

   - All routes protected with JWT middleware
   - User isolation through userId queries
   - No cross-user data access

2. **Data Validation**

   - Required field validation
   - Enum validation for notification types
   - Size limits on content

3. **Auto-Cleanup**
   - TTL index auto-deletes notifications after 7 days
   - Cascade delete of folder structure when room deleted

---

## 🎯 Problem Solved

### Notification Data Disappearance

**Problem:** Notifications were stored only in React state and disappeared when:

- Tab was closed/reopened
- Page was refreshed
- Component unmounted

**Solution:**

- Moved notifications to MongoDB with automatic retrieval
- Implemented persistent storage with optional auto-cleanup after 7 days
- Frontend refetches notifications when room is accessed
- Data now persists indefinitely (or until deleted)

---

## 📝 Usage Examples

### Create a Room

```javascript
const response = await createUserRoom({
  roomId: "room-12345",
  roomName: "My Project",
  description: "Project for learning React",
});
```

### Load Rooms

```javascript
const response = await getUserRooms();
console.log(response.data); // Array of rooms
```

### Create Notification

```javascript
await createNotification({
  roomId: "room-12345",
  type: "FILE_CREATED",
  title: "New File",
  message: "main.js has been created",
  metadata: { fileId: "file-123" },
});
```

### Load Room Notifications

```javascript
const response = await getNotifications("room-12345", (limit = 50), (skip = 0));
console.log(response.data); // Array of notifications
```

---

## 🔄 Integration Points

1. **Socket.io Integration** - Ready for real-time updates
2. **File Management** - Files now linkable to rooms
3. **User Authentication** - All operations user-scoped
4. **Real-time Collaboration** - Structure ready for websocket notifications

---

## 📦 Files Created/Modified

### Created Files

- `backend/src/models/UserRoom.js`
- `backend/src/models/FolderStructure.js`
- `backend/src/models/Notification.js`
- `backend/src/controllers/notificationController.js`
- `backend/src/routes/notifications.js`
- `frontend/src/components/RoomsSidebar.jsx`
- `frontend/src/lib/roomApi.js`
- `frontend/src/lib/notificationApi.js`

### Modified Files

- `backend/src/controllers/roomController.js` - Added user room functionality
- `backend/src/routes/room.js` - Added new endpoints
- `backend/src/controllers/fileController.js` - Added room-file integration
- `backend/src/routes/files.js` - Added room-file endpoints
- `backend/src/server.js` - Added notification routes
- `frontend/src/pages/CodeIDE.jsx` - Integrated rooms and notifications

---

## ✨ Next Steps (Optional Enhancements)

1. Real-time WebSocket integration for instant notifications
2. Room sharing and permission management
3. Notification categories and filtering
4. Sound/email alerts for important notifications
5. Batch operations for room management
6. Room templates for faster setup
7. Notification preferences per user

---

## 🛠 Testing Checklist

- [ ] Create a new room from UI
- [ ] View all rooms in sidebar
- [ ] Click room to make it active
- [ ] Delete room from sidebar
- [ ] Create file and save to room
- [ ] Create notification and verify persistence
- [ ] Refresh page and verify notifications still there
- [ ] Mark notification as read
- [ ] Delete notification
- [ ] Load room and verify notification history

---

**Implementation Status:** ✅ COMPLETE

**Last Updated:** January 6, 2026
