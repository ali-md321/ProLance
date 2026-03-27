// utils/socket.js
import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => socket;

export const connectSocket = () => {
  if (socket?.connected) return socket;

  socket = io("http://localhost:3000", {   // ← explicit backend URL
    withCredentials: true,
    transports: ["websocket", "polling"],  // ← allow polling fallback
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};