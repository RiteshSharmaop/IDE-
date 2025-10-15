import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], // ensures both WebSocket and polling work
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});



export default socket;
