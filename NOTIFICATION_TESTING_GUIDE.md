# Notification System - Testing Guide

## Pre-Test Checklist

- [ ] Backend is running (`npm run dev` in backend folder)
- [ ] Frontend is running (`npm run dev` in frontend folder)
- [ ] MongoDB is running and connected
- [ ] Redis is running and connected
- [ ] All files from the setup are in place

## Test Scenario 1: User Join Notification

### Setup

1. Open IDE in Browser Tab A: http://localhost:5173
2. Login as User A
3. Create or join a room (let's call it "test-room")
4. Open IDE in Browser Tab B: http://localhost:5173
5. Login as User B

### Test Steps

1. In Tab B, create or join the same room ("test-room")
2. Check Tab A's notification table
3. Verify a "User Joined" notification appears with:
   - Username: "User B"
   - Message: "User B joined the room"
   - Status: "Active" (green)
   - Type badge: "User Joined" (green)
   - Time: "just now"

### Expected Result

✅ "User Joined" notification appears in Tab A's CheckboxInTable component in real-time

---

## Test Scenario 2: File Created Notification

### Setup

Same room with User A and User B connected

### Test Steps

1. In Tab A, click "Create File" button
2. Enter filename: "test-file.js"
3. Click "Create"
4. Check Tab B's notification table

### Expected Result

✅ "File Created" notification appears in Tab B with:

- Username: "User A"
- Message: 'User A created file "test-file.js"'
- Status: "Pending" (yellow)
- Type badge: "File Created" (blue)
- Metadata includes: fileName

---

## Test Scenario 3: File Deleted Notification

### Setup

Same room with a previously created file ("test-file.js")

### Test Steps

1. In Tab A, right-click on "test-file.js" or find delete button
2. Delete the file
3. Confirm deletion
4. Check Tab B's notification table

### Expected Result

✅ "File Deleted" notification appears in Tab B with:

- Username: "User A"
- Message: 'User A deleted file "test-file.js"'
- Status: "Pending" (yellow)
- Type badge: "File Deleted" (orange)
- Metadata includes: fileName

---

## Test Scenario 4: Folder Created Notification

### Setup

Same room with User A and User B connected

### Test Steps

1. In Tab A, find "Create Folder" button/option
2. Enter folder name: "components"
3. Click "Create"
4. Check Tab B's notification table

### Expected Result

✅ "Folder Created" notification appears in Tab B with:

- Username: "User A"
- Message: 'User A created folder "components"'
- Status: "Pending" (yellow)
- Type badge: "Folder Created" (purple)
- Metadata includes: folderName

---

## Test Scenario 5: User Left Notification

### Setup

Same room with User A and User B connected

### Test Steps

1. In Tab B, close the browser tab or click "Leave Room"
2. Check Tab A's notification table

### Expected Result

✅ "User Left" notification appears in Tab A with:

- Username: "User B"
- Message: "User B left the room"
- Status: "Inactive" (gray)
- Type badge: "User Left" (red)
- Time: "just now"

---

## Test Scenario 6: Notification Table Features

### Setup

Generate 5-10 notifications using scenarios 1-4

### Test: Checkbox Selection

1. Click checkbox on first notification row
2. Verify row is highlighted (darker background)
3. Click "Select All" checkbox
4. Verify all rows are selected
5. Verify counter shows correct count

### Expected Result

✅ Checkboxes work correctly, rows highlight on selection

### Test: Mark as Read

1. Select 2-3 notifications
2. Click "Mark as Read" button
3. Verify selected notifications fade out (opacity-60)
4. Verify button disappears when no rows selected

### Expected Result

✅ Selected notifications are marked as read and visually de-emphasized

### Test: Delete Notifications

1. Select 2-3 notifications
2. Click "Delete" button
3. Verify notifications disappear from table
4. Verify total count decreases

### Expected Result

✅ Selected notifications are removed from table and database

### Test: Time Formatting

1. Create a notification
2. Check time format shows "just now"
3. Wait 1 minute
4. Refresh page
5. Verify time shows "1m ago"

### Expected Result

✅ Time displays correctly with relative formatting

### Test: Notification Persistence

1. Note the notification list
2. Refresh the page (F5)
3. Check if notifications still appear

### Expected Result

✅ Notifications persist after page refresh from MongoDB

---

## Test Scenario 7: API Endpoints

### Get Room Notifications

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/notifications/room/test-room
```

**Expected Response:**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "roomId": "test-room",
      "userId": "...",
      "type": "USER_JOINED",
      "username": "User B",
      "message": "User B joined the room",
      "read": false,
      "createdAt": "2024-01-06T..."
    }
  ]
}
```

### Get Unread Count

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/notifications/unread-count
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "unreadCount": 3
  }
}
```

---

## Test Scenario 8: Real-Time Broadcasting

### Setup

3+ browsers/tabs in same room

### Test Steps

1. In Tab A, create a file
2. Verify notification appears in Tab B AND Tab C simultaneously
3. All tabs should show identical notification at same time

### Expected Result

✅ Real-time broadcasting to all connected users works

---

## Test Scenario 9: Database Storage

### MongoDB Verification

```bash
# Connect to MongoDB
mongosh
use your_db_name

# Check notifications
db.notifications.find().pretty()

# Should show documents like:
# {
#   _id: ObjectId(...),
#   roomId: "test-room",
#   userId: ObjectId(...),
#   type: "FILE_CREATED",
#   username: "User A",
#   message: 'User A created file "test.js"',
#   metadata: { fileName: "test.js" },
#   read: false,
#   createdAt: ISODate(...),
#   updatedAt: ISODate(...)
# }

# Check TTL index exists
db.notifications.getIndexes()
# Should show expireAfterSeconds: 86400
```

### Redis Verification

```bash
# Connect to Redis
redis-cli

# Check notification keys
KEYS "notification:*" | head -5

# Check room notifications list
LRANGE "room:test-room:notifications" 0 -1

# Check user notifications
LRANGE "user:USER_ID:notifications" 0 -1
```

---

## Test Scenario 10: Error Handling

### Test: Invalid Room ID

1. Manually try to fetch notifications for non-existent room
2. Should return empty array (success: true, count: 0)

### Test: Deleted Notification

1. Delete a notification
2. Try to mark it as read
3. Should return error or indicate not found

### Test: Network Disconnection

1. Unplug internet or disable network
2. Try to create a file/folder
3. Notification should queue/retry when reconnected

---

## Performance Tests

### Bulk Notification Test

1. Create 100+ notifications using multiple rapid actions
2. Load room notifications API
3. Verify page doesn't slow down
4. Check response time < 500ms

### Stress Test

1. Open 10+ tabs in same room
2. Perform actions rapidly
3. All tabs should receive notifications in < 100ms
4. No crashes or errors

---

## Cleanup & Teardown

After testing:

1. **Clear Old Notifications** (optional)

   ```bash
   curl -X POST -H "Authorization: Bearer TOKEN" \
     http://localhost:8000/api/notifications/cleanup
   ```

2. **Verify Cleanup**
   ```bash
   mongosh
   use your_db_name
   db.notifications.countDocuments()  # Should be 0 if > 24h old
   ```

---

## Test Results Summary

Create this table to track test results:

| Scenario               | Status            | Notes |
| ---------------------- | ----------------- | ----- |
| User Join              | ✅ PASS / ❌ FAIL |       |
| File Created           | ✅ PASS / ❌ FAIL |       |
| File Deleted           | ✅ PASS / ❌ FAIL |       |
| Folder Created         | ✅ PASS / ❌ FAIL |       |
| User Left              | ✅ PASS / ❌ FAIL |       |
| Table Features         | ✅ PASS / ❌ FAIL |       |
| API Endpoints          | ✅ PASS / ❌ FAIL |       |
| Real-time Broadcasting | ✅ PASS / ❌ FAIL |       |
| Database Storage       | ✅ PASS / ❌ FAIL |       |
| Error Handling         | ✅ PASS / ❌ FAIL |       |

---

## Debugging Tips

### If notifications aren't appearing:

1. **Check Socket.io connection:**

   ```javascript
   // In browser console
   console.log(socket.connected); // Should be true
   console.log(socket.id); // Should have a value
   ```

2. **Check browser console for errors:**

   - Open DevTools (F12)
   - Check Console tab for red errors
   - Check Network tab for failed API calls

3. **Check backend logs:**

   - Look for "notification" in server output
   - Check for error messages
   - Verify socket events are being received

4. **Test socket manually:**

   ```javascript
   // In browser console
   socket.emit("createFile", {
     file: { id: 1, name: "test.js" },
     roomId: "test-room",
     username: "TestUser",
     userId: "user123",
   });
   ```

5. **Check MongoDB:**

   ```bash
   mongosh
   db.notifications.find().count()  # Should increase
   ```

6. **Check Redis:**
   ```bash
   redis-cli
   KEYS "*notifications*"  # Should have keys
   ```

---

## Common Issues & Solutions

| Issue                                 | Solution                                             |
| ------------------------------------- | ---------------------------------------------------- |
| No notifications appear               | Check socket connection, verify userId is passed     |
| Only see own notifications            | Verify room ID is same for all users                 |
| Notifications disappear after refresh | Check MongoDB TTL index, verify connection           |
| API returns 401                       | Check authentication token is valid                  |
| Real-time slow                        | Check Redis connection, verify no console errors     |
| Checkbox not working                  | Verify React state updates, check for console errors |

---

## Success Criteria

✅ All tests pass when:

- [ ] Notifications appear in real-time for all room users
- [ ] All 5 notification types work correctly
- [ ] Notifications persist in MongoDB after page refresh
- [ ] Notifications are cached in Redis
- [ ] API endpoints return correct data
- [ ] Table features (select, delete, mark read) work
- [ ] No console errors
- [ ] Time formatting displays correctly
- [ ] Multiple users receive same notifications simultaneously
- [ ] Old notifications auto-delete after 24 hours
