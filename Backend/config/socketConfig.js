let io;

// In-memory user store
let users = [];

// Add user
const addUser = (userId, socketId) => {
  const exists = users.find((user) => user.userId === userId);
  if (!exists) {
    users.push({ userId, socketId });
  }
};

// Remove user
const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

// Get user
const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

// Get all online users
const getAllUsers = () => {
  return users.map((user) => user.userId);
};

const configureSocket = (server) => {
  const socketIO = require("socket.io")(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io = socketIO;

  socketIO.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // ✅ Add user
    socket.on("addUser", (userId) => {
      if (userId) {
        addUser(userId, socket.id);
        socketIO.emit("getUsers", getAllUsers());
      }
    });

    // ✅ Join chat room
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
    });

    // ✅ Send message
    socket.on("sendMessage", (msg) => {
      // Send to room
      socket.to(msg.chatId).emit("getMessage", msg);

      // Send directly to receiver if online
      const receiver = getUser(msg.receiverId);
      if (receiver) {
        socketIO.to(receiver.socketId).emit("getMessage", msg);
      }
    });

    // ✅ Typing
    socket.on("typing", ({ senderId, receiverId, chatId }) => {
      const receiver = getUser(receiverId);
      if (receiver) {
        socketIO.to(receiver.socketId).emit("typing", { chatId });
      }
    });

    // ✅ Stop typing
    socket.on("typing stop", ({ senderId, receiverId, chatId }) => {
      const receiver = getUser(receiverId);
      if (receiver) {
        socketIO.to(receiver.socketId).emit("stopTyping", { chatId });
      }
    });

    // ❌ Disconnect
    socket.on("disconnect", () => {
      removeUser(socket.id);
      socketIO.emit("getUsers", getAllUsers());
    });
  });
};

module.exports = { configureSocket };