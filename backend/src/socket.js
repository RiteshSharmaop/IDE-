
const { Server } = require("socket.io");

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
        folders: ['src', 'dsa'],
        users: [],
        executionHistory: [],
        createdAt: new Date()
      });
    }
    return rooms.get(roomId);
  };

  const addUserToRoom = (roomId, socketId, username) => {
    const room = getOrCreateRoom(roomId);

    if (!room.users.find(u => u.socketId === socketId)) {
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
      room.users = room.users.filter(u => u.socketId !== socketId);
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


  
  io.on('connection', (socket) => {
    //console.log(`User connected: ${socket.id}`);

    // User joins a room
    socket.on('joinRoom', ({ roomId, username }) => {
      socket.join(roomId);
      addUserToRoom(roomId, socket.id, username);

      const room = getOrCreateRoom(roomId);

      //console.log(`${username} joined room ${roomId}`);
      //console.log(`Total users in room: ${room.users.length}`);

      // Send room data to the joining user
      socket.emit('joinedRoom', {
        roomId: roomId,
        files: room.files,
        folders: room.folders,
        users: room.users.map(u => ({ username: u.username, socketId: u.socketId }))
      });

      // Notify others that someone joined
      socket.to(roomId).emit('someoneJoined', {
        socketId: socket.id,
        username: username,
        totalUsers: room.users.length
      });
    });

    
    // Create File
    socket.on('createFile', ({ file, roomId, username }) => {
      //console.log(`File created: ${file.name} by ${username} in room ${roomId}`);

      const room = getOrCreateRoom(roomId);

      // Add file to room if not already there
      if (!room.files.find(f => f.id === file.id)) {
        room.files.push(file);
      }

      // Broadcast to all users in room (including sender)
      socket.to(roomId).emit('fileCreated', {
        file: file,
        username: username,
        timestamp: new Date()
      });

      //console.log(`Total files in room ${roomId}: ${room.files.length}`);
    });

    // Delete File
    socket.on('deleteFile', ({ fileId, roomId, username }) => {
      //console.log(`File deleted: ${fileId} by ${username} in room ${roomId}`);

      const room = getOrCreateRoom(roomId);
      room.files = room.files.filter(f => f.id !== fileId);

      io.to(roomId).emit('fileDeleted', {
        fileId: fileId,
        username: username,
        timestamp: new Date()
      });
    });

    // Update File Content
    socket.on('updateFile', ({ fileId, content, roomId, username }) => {
      const room = getOrCreateRoom(roomId);
      const file = room.files.find(f => f.id === fileId);

      if (file) {
        file.content = content;
        file.lastModifiedBy = username;
        file.lastModifiedAt = new Date();

        // Broadcast to all users except sender (to avoid echoing back)
        socket.to(roomId).emit('fileUpdated', {
          fileId: fileId,
          content: content,
          username: username,
          timestamp: new Date()
        });
      }
    });

    // Set Active File
    socket.on('setFileActive', (fileId, roomId) => {
      socket.to(roomId).emit('fileSetActive', {
        fileId: fileId,
        socketId: socket.id
      });
    });

    // Close File
    socket.on('closeFile', (fileId, roomId) => {
      io.to(roomId).emit('fileClosed', {
        fileId: fileId,
        socketId: socket.id
      });
    });

    // File Change
    socket.on('fileChange', (fileId, roomId) => {
      socket.to(roomId).emit('fileChanged', {
        fileId: fileId,
        editorId: socket.id
      });
    });

    
    socket.on('createFolder', ({ folderName, roomId, username }) => {
      //console.log(`Folder created: ${folderName} by ${username} in room ${roomId}`);

      const room = getOrCreateRoom(roomId);

      if (!room.folders.includes(folderName)) {
        room.folders.push(folderName);
      }

      io.to(roomId).emit('folderCreated', {
        folderName: folderName,
        username: username,
        timestamp: new Date()
      });

      //console.log(`Total folders in room ${roomId}: ${room.folders.length}`);
    });

    
    socket.on('executeCode', ({ fileName, fileId, language, output, error, roomId, username }) => {
      //console.log(`Code executed: ${fileName} (${language}) by ${username} in room ${roomId}`);

      // Broadcast execution to all users in room (including sender)
      io.to(roomId).emit('codeExecuted', {
        fileName: fileName,
        fileId: fileId,
        language: language,
        output: output,
        error: error,
        username: username,
        timestamp: new Date()
      });

      // Log execution to room history
      const room = getOrCreateRoom(roomId);
      room.executionHistory.push({
        fileName,
        language,
        username,
        timestamp: new Date(),
        successful: !error
      });
    });

   
    socket.on('getRoomData', (roomId) => {
      const room = getOrCreateRoom(roomId);
      socket.emit('roomData', {
        files: room.files,
        folders: room.folders,
        users: room.users.map(u => ({ username: u.username, socketId: u.socketId })),
        executionHistory: room.executionHistory
      });
    });

    socket.on('getActiveUsers', (roomId) => {
      const count = getActiveUserCount(roomId);
      console.log("Loop :");

      
      io.to(roomId).emit("activeUserCount", {
        roomId,
        count
      });

      console.log("Count : " , count);
      

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
        cursorPosition
      });
    });

   
    // Handle user disconnect
    socket.on('disconnect', () => {
      //console.log(`User disconnected: ${socket.id}`);

      // Remove user from all rooms they were in
      rooms.forEach((room, roomId) => {
        const user = room.users.find(u => u.socketId === socket.id);
        if (user) {
          removeUserFromRoom(roomId, socket.id);

          // Notify others in room
          io.to(roomId).emit('someoneLeft', {
            socketId: socket.id,
            username: user.username,
            totalUsers: room.users.length
          });

          //console.log(`${user.username} removed from room ${roomId}`);
        }
      });
    });

    // Handle any errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  //console.log("⚡ Socket.IO initialized");
  return io;
};

module.exports = { initSocket };