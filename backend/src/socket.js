const { Server } = require("socket.io");

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  

  

  io.on("connection", (socket) => {
    console.log(`🟢 New client connected: ${socket.id}`);

    // ✅ join room event
    socket.on("joinRoom", ({ roomId }) => {
      if (!roomId) {
        console.log("backendLog: room id missing");
        return;
      }

      socket.join(roomId);
      console.log(`📥 ${socket.id} joined room ${roomId}`);

      // 🔊 broadcast to all others in room (except this socket)
      socket.to(roomId).emit("someoneJoined", { socketId: socket.id });

      // 👋 also notify this user that join was successful
      io.to(socket.id).emit("joinedRoom", { roomId });
    });
    

    // Example: broadcast message
    socket.on("sendMessage", ({ roomId, message }) => {
      io.to(roomId).emit("receiveMessage", { sender: socket.id, message });
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);
    });
  });

  console.log("⚡ Socket.IO initialized");
  return io;
};

module.exports = { initSocket };
