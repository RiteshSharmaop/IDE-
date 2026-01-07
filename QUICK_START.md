# Quick Start Guide - Rooms & Notifications

## 🎯 What Was Built

### 1. **Rooms Management**

- Store code projects in separate rooms
- Organize files with folder structure
- Track collaborators and access time
- Persistent storage in database

### 2. **Persistent Notifications**

- Notifications no longer disappear on page refresh
- Stored in database with 7-day auto-cleanup
- Mark as read/unread
- Supports 6 notification types

---

## 📂 File Structure

```
Backend:
├── models/
│   ├── UserRoom.js (NEW)
│   ├── FolderStructure.js (NEW)
│   ├── Notification.js (NEW)
│   └── File.js (MODIFIED)
├── controllers/
│   ├── roomController.js (MODIFIED)
│   ├── fileController.js (MODIFIED)
│   └── notificationController.js (NEW)
├── routes/
│   ├── room.js (MODIFIED)
│   ├── files.js (MODIFIED)
│   └── notifications.js (NEW)
└── server.js (MODIFIED)

Frontend:
├── components/
│   └── RoomsSidebar.jsx (NEW)
├── lib/
│   ├── roomApi.js (NEW)
│   ├── notificationApi.js (NEW)
│   └── api.js
└── pages/
    └── CodeIDE.jsx (MODIFIED)
```

---

## 🔧 Key Functions

### Backend (Express + MongoDB)

**Room Management:**

- Create room → `POST /api/rooms/create-user-room`
- Get rooms → `GET /api/rooms/user-rooms`
- Delete room → `DELETE /api/rooms/:roomId`
- Save files to room → `POST /api/files/:fileId/save-to-room/:roomId`

**Notifications:**

- Create → `POST /api/notifications`
- Get room notifications → `GET /api/notifications/:roomId`
- Mark as read → `PUT /api/notifications/:notificationId/read`
- Delete → `DELETE /api/notifications/:notificationId`

### Frontend (React)

**Room Functions:**

```javascript
// Load all rooms
await loadUserRooms();

// Create room
await handleCreateRoom({ roomId, roomName, description });

// Switch active room
handleRoomClick(room);

// Delete room
await handleDeleteRoom(roomId);
```

**Notification Functions:**

```javascript
// Load notifications for a room
await loadRoomNotifications(roomId);

// Create notification
await createNotification({ roomId, type, title, message });
```

---

## 🚀 How to Use

### For Users:

1. Click **"+ New Room"** in sidebar → Create a room
2. Rooms appear in **Rooms** section with:
   - Room name
   - Last accessed time
   - Collaborator count
   - File count
3. Click room to make it active
4. Create/save files to current room
5. Notifications persist and appear when room opens

### For Developers:

1. All room endpoints require JWT auth
2. User data automatically scoped by userId
3. Use provided API utilities in frontend:
   ```javascript
   import { getUserRooms, createUserRoom } from "../lib/roomApi";
   import {
     getNotifications,
     createNotification,
   } from "../lib/notificationApi";
   ```

---

## 💾 Database Details

### 3 New Collections:

1. **UserRooms** - Maps users to rooms with metadata
2. **FolderStructure** - Hierarchical organization
3. **Notifications** - Persistent notification history

### Indexes for Performance:

- UserRoom: `{ userId: 1, roomId: 1 }`
- FolderStructure: `{ userId: 1, roomId: 1, parentId: 1 }`
- Notification: `{ userId: 1, roomId: 1, createdAt: -1 }`

---

## 🔒 Security

✅ **Protected:** All endpoints require JWT authentication
✅ **Isolated:** Users can only access their own data
✅ **Validated:** Input validation on all endpoints
✅ **Auto-cleanup:** Notifications auto-delete after 7 days

---

## 🐛 Known Limitations & Future Improvements

**Current:**

- Room sharing coming (collaborators field exists, not implemented)
- Real-time updates through WebSocket (architecture ready)
- Notification preferences (can be added)

**To Implement:**

1. Emit notifications via WebSocket when files are created
2. Add room permission levels (owner, editor, viewer)
3. Batch operations for multiple files
4. Notification filtering and search
5. Email/SMS alerts for important notifications

---

## ⚡ Performance Optimizations

- **Database Indexes:** All lookups use indexed queries
- **TTL Index:** Auto-deletes old notifications (saves space)
- **Pagination:** Notification endpoints support limit/skip
- **Lazy Loading:** Rooms loaded on demand

---

## 🆘 Troubleshooting

**Issue:** Rooms not showing

- → Check browser console for API errors
- → Verify JWT token is valid
- → Check MongoDB connection

**Issue:** Notifications disappear

- → That's FIXED now! They persist in DB
- → If gone: They auto-delete after 7 days

**Issue:** File not saving to room

- → Ensure room is active (`activeRoom` is set)
- → Check API response for errors
- → Verify file exists in database

---

## 📞 API Response Format

All endpoints return:

```javascript
{
  success: true/false,
  message: "Description",
  data: { /* payload */ },
  count: number,    // if applicable
  total: number     // if paginated
}
```

---

## 🎓 Code Example: Complete Room + Notification Flow

```javascript
// 1. Create room
const roomRes = await createUserRoom({
  roomId: `room-${Date.now()}`,
  roomName: "My JavaScript Project",
  description: "Learning React",
});

// 2. Create a notification
await createNotification({
  roomId: roomRes.data.roomId,
  type: "FOLDER_CREATED",
  title: "Room Setup Complete",
  message: "Your room is ready to use",
});

// 3. Load notifications whenever room opens
const notifRes = await getNotifications(roomId);
setNotifications(notifRes.data);

// 4. Mark as read
await markNotificationAsRead(notificationId);
```

---

**✅ Ready to Use!**

All backend routes are active and frontend is integrated. Start using the Rooms feature in the CodeIDE application.
