const { Server } = require("socket.io");
const mongoose = require("mongoose");
const NotificationService = require("./services/notificationService");

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  const rooms = new Map(); // Store room data
  const activeUsers = new Map(); // Track active users per room

  const getOrCreateRoom = (roomId) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        files: [],
        folders: ["src", "dsa"],
        users: [],
        executionHistory: [],
        createdAt: new Date(),
      });
    }
    return rooms.get(roomId);
  };

  const addUserToRoom = (roomId, socketId, username) => {
    const room = getOrCreateRoom(roomId);

    if (!room.users.find((u) => u.socketId === socketId)) {
      room.users.push({ socketId, username, joinedAt: new Date() });
    }

    if (!activeUsers.has(roomId)) {
      activeUsers.set(roomId, new Set());
    }
    activeUsers.get(roomId).add(socketId);
  };

  const removeUserFromRoom = (roomId, socketId) => {
    const room = rooms.get(roomId);
    if (room) {
      room.users = room.users.filter((u) => u.socketId !== socketId);
    }

    const users = activeUsers.get(roomId);
    if (users) {
      users.delete(socketId);
      if (users.size === 0) {
        activeUsers.delete(roomId);
        // Optional: Clean up empty rooms after timeout
        // setTimeout(() => rooms.delete(roomId), 300000); // 5 minutes
      }
    }
  };

  const getActiveUserCount = (roomId) => {
    return activeUsers.has(roomId) ? activeUsers.get(roomId).size : 0;
  };

  io.on("connection", (socket) => {
    //console.log(`User connected: ${socket.id}`);

    // User joins a room
    socket.on("joinRoom", async ({ roomId, username, userId }) => {
      console.log("🚪 joinRoom event received:", { roomId, username, userId });
      socket.join(roomId);
      addUserToRoom(roomId, socket.id, username);

      const room = getOrCreateRoom(roomId);
      socket.username = username;
      socket.userId = userId;
      socket.roomId = roomId;

      // Send room data to the joining user
      socket.emit("joinedRoom", {
        roomId: roomId,
        files: room.files,
        folders: room.folders,
        users: room.users.map((u) => ({
          username: u.username,
          socketId: u.socketId,
        })),
      });

      // Create notification for user joined
      const notificationData = {
        type: "USER_JOINED",
        username: username,
        message: `${username} joined the room`,
        roomId: roomId,
        createdAt: new Date(),
      };

      // If we don't have valid user info, skip DB save and emit a transient notification
      if (!userId || !username) {
        console.warn(
          "⚠️ Missing user info for join notification, emitting transient event",
          {
            roomId,
            username,
            userId,
          }
        );
        io.to(roomId).emit("notification", {
          ...notificationData,
          id: `temp-${Date.now()}`,
        });
      } else {
        try {
          const notification = await NotificationService.notifyUserJoined(
            roomId,
            userId,
            username
          );

          console.log("📨 Emitting user joined notification:", {
            roomId,
            username,
            type: "USER_JOINED",
          });

          // Invalidate room cache to fetch fresh data
          await NotificationService.invalidateRoomCache(roomId);

          // Broadcast notification to all users in room
          io.to(roomId).emit("notification", {
            id: notification._id,
            type: "USER_JOINED",
            username: username,
            message: `${username} joined the room`,
            roomId: roomId,
            createdAt: notification.createdAt,
          });
        } catch (error) {
          console.error("❌ Error creating join notification:", error);
          // Still emit the notification event even if DB save fails (real-time feature)
          console.log(
            "📨 Emitting user joined notification (without DB save):",
            notificationData
          );
          io.to(roomId).emit("notification", {
            ...notificationData,
            id: `temp-${Date.now()}`,
          });
        }
      }

      // Notify others that someone joined
      socket.to(roomId).emit("someoneJoined", {
        socketId: socket.id,
        username: username,
        totalUsers: room.users.length,
      });
    });

    // Create File
    socket.on("createFile", async ({ file, roomId, username, userId }) => {
      const room = getOrCreateRoom(roomId);

      // Add file to room if not already there
      if (!room.files.find((f) => f.id === file.id)) {
        room.files.push(file);
      }

      // Create notification
      try {
        const notification = await NotificationService.notifyFileCreated(
          roomId,
          userId,
          username,
          file.name,
          file.path || ""
        );

        // Broadcast notification to all users in room
        io.to(roomId).emit("notification", {
          id: notification._id,
          type: "FILE_CREATED",
          username: username,
          message: `${username} created file "${file.name}"`,
          roomId: roomId,
          metadata: { fileName: file.name },
          createdAt: notification.createdAt,
        });
      } catch (error) {
        console.error("Error creating file notification:", error);
        // Still emit the notification event even if DB save fails (real-time feature)
        io.to(roomId).emit("notification", {
          id: `temp-${Date.now()}`,
          type: "FILE_CREATED",
          username: username,
          message: `${username} created file "${file.name}"`,
          roomId: roomId,
          metadata: { fileName: file.name },
          createdAt: new Date(),
        });
      }

      // Broadcast to all users in room (including sender)
      socket.to(roomId).emit("fileCreated", {
        file: file,
        username: username,
        timestamp: new Date(),
      });
    });

    // Delete File
    socket.on(
      "deleteFile",
      async ({ fileId, roomId, username, userId, fileName }) => {
        const room = getOrCreateRoom(roomId);
        room.files = room.files.filter((f) => f.id !== fileId);

        // Create notification
        try {
          const notification = await NotificationService.notifyFileDeleted(
            roomId,
            userId,
            username,
            fileName || fileId
          );

          // Broadcast notification to all users in room
          io.to(roomId).emit("notification", {
            id: notification._id,
            type: "FILE_DELETED",
            username: username,
            message: `${username} deleted file "${fileName || fileId}"`,
            roomId: roomId,
            metadata: { fileName: fileName || fileId },
            createdAt: notification.createdAt,
          });
        } catch (error) {
          console.error("Error creating file deletion notification:", error);
          // Still emit the notification event even if DB save fails (real-time feature)
          io.to(roomId).emit("notification", {
            id: `temp-${Date.now()}`,
            type: "FILE_DELETED",
            username: username,
            message: `${username} deleted file "${fileName || fileId}"`,
            roomId: roomId,
            metadata: { fileName: fileName || fileId },
            createdAt: new Date(),
          });
        }

        io.to(roomId).emit("fileDeleted", {
          fileId: fileId,
          username: username,
          timestamp: new Date(),
        });
      }
    );

    // Update File Content
    socket.on("updateFile", ({ fileId, content, roomId, username }) => {
      const room = getOrCreateRoom(roomId);
      const file = room.files.find((f) => f.id === fileId);

      if (file) {
        file.content = content;
        file.lastModifiedBy = username;
        file.lastModifiedAt = new Date();

        // Broadcast to all users except sender (to avoid echoing back)
        socket.to(roomId).emit("fileUpdated", {
          fileId: fileId,
          content: content,
          username: username,
          timestamp: new Date(),
        });
      }
    });

    // Set Active File
    socket.on("setFileActive", (fileId, roomId) => {
      socket.to(roomId).emit("fileSetActive", {
        fileId: fileId,
        socketId: socket.id,
      });
    });

    // Close File
    socket.on("closeFile", (fileId, roomId) => {
      io.to(roomId).emit("fileClosed", {
        fileId: fileId,
        socketId: socket.id,
      });
    });

    // File Change
    socket.on("fileChange", (fileId, roomId) => {
      socket.to(roomId).emit("fileChanged", {
        fileId: fileId,
        editorId: socket.id,
      });
    });

    socket.on(
      "createFolder",
      async ({ folderName, roomId, username, userId }) => {
        const room = getOrCreateRoom(roomId);

        if (!room.folders.includes(folderName)) {
          room.folders.push(folderName);
        }

        // Create notification
        try {
          const notification = await NotificationService.notifyFolderCreated(
            roomId,
            userId,
            username,
            folderName
          );

          // Broadcast notification to all users in room
          io.to(roomId).emit("notification", {
            id: notification._id,
            type: "FOLDER_CREATED",
            username: username,
            message: `${username} created folder "${folderName}"`,
            roomId: roomId,
            metadata: { folderName },
            createdAt: notification.createdAt,
          });
        } catch (error) {
          console.error("Error creating folder notification:", error);
          // Still emit the notification event even if DB save fails (real-time feature)
          io.to(roomId).emit("notification", {
            id: `temp-${Date.now()}`,
            type: "FOLDER_CREATED",
            username: username,
            message: `${username} created folder "${folderName}"`,
            roomId: roomId,
            metadata: { folderName },
            createdAt: new Date(),
          });
        }

        io.to(roomId).emit("folderCreated", {
          folderName: folderName,
          username: username,
          timestamp: new Date(),
        });
      }
    );

    socket.on(
      "executeCode",
      ({ fileName, fileId, language, output, error, roomId, username }) => {
        //console.log(`Code executed: ${fileName} (${language}) by ${username} in room ${roomId}`);

        // Broadcast execution to all users in room (including sender)
        io.to(roomId).emit("codeExecuted", {
          fileName: fileName,
          fileId: fileId,
          language: language,
          output: output,
          error: error,
          username: username,
          timestamp: new Date(),
        });

        // Log execution to room history
        const room = getOrCreateRoom(roomId);
        room.executionHistory.push({
          fileName,
          language,
          username,
          timestamp: new Date(),
          successful: !error,
        });
      }
    );

    socket.on("getRoomData", (roomId) => {
      const room = getOrCreateRoom(roomId);
      socket.emit("roomData", {
        files: room.files,
        folders: room.folders,
        users: room.users.map((u) => ({
          username: u.username,
          socketId: u.socketId,
        })),
        executionHistory: room.executionHistory,
      });
    });

    socket.on("getActiveUsers", (roomId) => {
      const count = getActiveUserCount(roomId);
      console.log("Loop :");

      io.to(roomId).emit("activeUserCount", {
        roomId,
        count,
      });

      console.log("Count : ", count);
    });

    // Real-time code change synchronization
    socket.on("codeChange", ({ fileId, content, roomId, cursorPosition }) => {
      //console.log(`Code change in file ${fileId} by ${socket.username}`);

      // Broadcast to all other users in the room
      socket.to(roomId).emit("codeChanged", {
        fileId,
        content,
        username: socket.username,
        socketId: socket.id,
        cursorPosition,
      });
    });

    // Real-time cursor position tracking
    socket.on("cursorMove", ({ fileId, roomId, cursorPosition }) => {
      if (!cursorPosition) return;

      // Broadcast cursor position to all other users in the room
      socket.to(roomId).emit("remoteCursorMoved", {
        fileId,
        socketId: socket.id,
        username: socket.username,
        cursorPosition,
        timestamp: new Date(),
      });
    });

    socket.on("disconnect", async () => {
      rooms.forEach(async (room, roomId) => {
        const user = room.users.find((u) => u.socketId === socket.id);
        if (!user) return;

        removeUserFromRoom(roomId, socket.id);

        // Create notification for user left
        try {
          const notification = await NotificationService.notifyUserLeft(
            roomId,
            socket.userId || user.socketId,
            user.username
          );

          // Broadcast notification to all users in room
          io.to(roomId).emit("notification", {
            id: notification._id,
            type: "USER_LEFT",
            username: user.username,
            message: `${user.username} left the room`,
            roomId: roomId,
            createdAt: notification.createdAt,
          });
        } catch (error) {
          console.error("Error creating user left notification:", error);
          // Still emit the notification event even if DB save fails (real-time feature)
          io.to(roomId).emit("notification", {
            id: `temp-${Date.now()}`,
            type: "USER_LEFT",
            username: user.username,
            message: `${user.username} left the room`,
            roomId: roomId,
            createdAt: new Date(),
          });
        }

        io.to(roomId).emit("someoneLeft", {
          socketId: socket.id,
          username: user.username,
          totalUsers: room.users.length,
        });
      });
    });

    // Handle any errors
    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  //console.log("⚡ Socket.IO initialized");
  return io;
};

module.exports = { initSocket };
