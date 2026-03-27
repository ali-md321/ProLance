if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const http       = require("http");
const { Server } = require("socket.io");
const app        = require("./Backend/app");
const connectDB  = require("./Backend/config/databaseConnect");
const Chat       = require("./Backend/models/chatModel");
const Message    = require("./Backend/models/messageModel");
const jwt        = require("jsonwebtoken");

const PORT = process.env.PORT || 3000;

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",   // ← must be exact string, not array
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// ── Socket auth middleware ──────────────────────────────────────────────────
io.use((socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers?.cookie || "";
    const tokenCookie  = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith("token="));
    const token = tokenCookie?.split("=")[1]?.trim()
                  || socket.handshake.auth?.token;

    if (!token) {
      console.log("Socket: no token found");
      return next(new Error("Unauthorised"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    console.log("Socket auth OK for user:", decoded.id);
    next();
  } catch (err) {
    console.log("Socket auth error:", err.message);
    next(new Error("Unauthorised"));
  }
});

// ── Online users map  userId → socketId ────────────────────────────────────
const onlineUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.userId;
  console.log("Socket connected:", socket.id, "user:", userId);

  onlineUsers.set(userId, socket.id);
  io.emit("online_users", Array.from(onlineUsers.keys()));

  // ── Join chat room ──────────────────────────────────────────────────────
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${userId} joined chat ${chatId}`);
  });

  // ── Send message ────────────────────────────────────────────────────────
  socket.on("send_message", async ({ chatId, content }) => {
    if (!content?.trim()) return;
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) return;
      if (!chat.participants.map(String).includes(userId)) return;

      const message = await Message.create({
        chat:    chatId,
        sender:  userId,
        content: content.trim(),
      });

      chat.lastMessage   = message._id;
      chat.lastMessageAt = new Date();
      for (const pid of chat.participants) {
        if (pid.toString() !== userId) {
          const prev = chat.unreadCounts.get(pid.toString()) || 0;
          chat.unreadCounts.set(pid.toString(), prev + 1);
        }
      }
      await chat.save();

      const populated = await Message.findById(message._id)
        .populate("sender", "name avatar role");

      io.to(chatId).emit("receive_message", populated);

      for (const pid of chat.participants) {
        const otherId = pid.toString();
        if (otherId !== userId) {
          const otherSocket = onlineUsers.get(otherId);
          if (otherSocket) {
            io.to(otherSocket).emit("chat_updated", {
              chatId,
              lastMessage:   populated,
              lastMessageAt: chat.lastMessageAt,
            });
          }
        }
      }
    } catch (err) {
      console.error("send_message error:", err.message);
    }
  });

  // ── Mark read ───────────────────────────────────────────────────────────
  socket.on("mark_read", async (chatId) => {
    try {
      await Message.updateMany(
        { chat: chatId, sender: { $ne: userId }, isRead: false },
        { isRead: true }
      );
      const chat = await Chat.findById(chatId);
      if (chat) {
        chat.unreadCounts.set(userId, 0);
        await chat.save();
      }
      socket.to(chatId).emit("messages_read", { chatId, readBy: userId });
    } catch (err) {
      console.error("mark_read error:", err.message);
    }
  });

  // ── Typing ──────────────────────────────────────────────────────────────
  socket.on("typing_start", ({ chatId }) => {
    socket.to(chatId).emit("typing_start", { chatId, userId });
  });

  socket.on("typing_stop", ({ chatId }) => {
    socket.to(chatId).emit("typing_stop", { chatId, userId });
  });

  // ── Disconnect ──────────────────────────────────────────────────────────
  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", socket.id, reason);
    onlineUsers.delete(userId);
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});