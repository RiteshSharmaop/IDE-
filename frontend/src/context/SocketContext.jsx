// import { createContext, useContext, useState, useEffect } from "react";
// import socket from "../helper/socket"

// const SocketContext = createContext(undefined);

// export const SocketProvider = ({ children }) => {
//   const [socketId, setSocketId] = useState(undefined);
//   const [isConnected, setIsConnected] = useState(socket.connected);

//   useEffect(() => {
//     setSocket()
//     // ✅ Listen for socket connection
//     socket.on("connect", () => {
//       console.log("🟢 Connected:", socket.id);
      
//       setSocketId(socket.id);
//       setIsConnected(true);
//     });

//     socket.on("disconnect", () => {
//       console.log("🔴 Disconnected");
//       setIsConnected(false);
//       setSocketId(undefined);
//     });

//     // 🧹 Cleanup listeners on unmount
//     return () => {
//       socket.off("connect");
//       socket.off("disconnect");
//     };
//   }, []);

//   return (
//     <SocketContext.Provider value={{ socket, setSocketId, socketId, isConnected }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// // Custom hook for easier access
// export const useSocket = () => {
//   const context = useContext(SocketContext);
//   if (!context) {
//     throw new Error("useSocket must be used within a SocketProvider");
//   }
//   return context;
// };

// src/context/SocketContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(undefined);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    
    const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    // When connected, store socket ID
    newSocket.on("connect", () => {
      console.log("🟢 Connected with ID:", newSocket.id);
      setSocketId(newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("🔴 Disconnected");
      setSocketId(null);
    });

    // Cleanup when unmounting
    return () => newSocket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, socketId }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocket must be used within a SocketProvider");
  return context;
};

