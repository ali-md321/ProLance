const Chat    = require("../models/chatModel");
const Message = require("../models/messageModel");
const User    = require("../models/userModel");
const catchAsync   = require("../middlewares/catchAsync");
const ErrorHandler = require("../utils/errorhandler");

// ── GET or CREATE a chat between two users ──────────────────────────────
module.exports.getOrCreateChatController = catchAsync(async (req, res) => {
  const myId    = req.userId;
  const { userId } = req.params;          // the other user

  if (myId === userId) {
    throw new ErrorHandler("Cannot chat with yourself", 400);
  }

  // find existing chat that contains both participants
  let chat = await Chat.findOne({
    participants: { $all: [myId, userId] },
  })
    .populate("participants", "name avatar role")
    .populate("lastMessage");

  if (!chat) {
    chat = await Chat.create({ participants: [myId, userId] });
    chat = await Chat.findById(chat._id)
      .populate("participants", "name avatar role")
      .populate("lastMessage");
  }

  res.status(200).json({ success: true, chat });
});

// ── GET all chats for the logged-in user ────────────────────────────────
module.exports.getMyChatsController = catchAsync(async (req, res) => {
  const myId = req.userId;

  const chats = await Chat.find({ participants: myId })
    .populate("participants", "name avatar role")
    .populate("lastMessage")
    .sort({ lastMessageAt: -1 });

  res.status(200).json({ success: true, chats });
});

// ── GET messages for a chat (paginated, newest-last) ────────────────────
module.exports.getChatMessagesController = catchAsync(async (req, res) => {
  const { chatId } = req.params;
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip  = (page - 1) * limit;

  const chat = await Chat.findById(chatId);
  if (!chat) throw new ErrorHandler("Chat not found", 404);

  // only participants can read
  if (!chat.participants.map(String).includes(req.userId)) {
    throw new ErrorHandler("Not authorised", 403);
  }

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "name avatar role")
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);

  // mark unread messages as read
  await Message.updateMany(
    { chat: chatId, sender: { $ne: req.userId }, isRead: false },
    { isRead: true }
  );

  // reset unread count for me
  chat.unreadCounts.set(req.userId, 0);
  await chat.save();

  res.status(200).json({ success: true, messages });
});

// ── SEND a message (REST fallback — socket is primary) ──────────────────
module.exports.sendMessageController = catchAsync(async (req, res) => {
  const { chatId }  = req.params;
  const { content } = req.body;

  if (!content?.trim()) throw new ErrorHandler("Message cannot be empty", 400);

  const chat = await Chat.findById(chatId);
  if (!chat) throw new ErrorHandler("Chat not found", 404);
  if (!chat.participants.map(String).includes(req.userId)) {
    throw new ErrorHandler("Not authorised", 403);
  }

  const message = await Message.create({
    chat:    chatId,
    sender:  req.userId,
    content: content.trim(),
  });

  // update chat metadata
  chat.lastMessage   = message._id;
  chat.lastMessageAt = new Date();

  // increment unread for the other participant
  for (const pid of chat.participants) {
    if (pid.toString() !== req.userId) {
      const prev = chat.unreadCounts.get(pid.toString()) || 0;
      chat.unreadCounts.set(pid.toString(), prev + 1);
    }
  }
  await chat.save();

  const populated = await Message.findById(message._id).populate("sender", "name avatar role");
  res.status(201).json({ success: true, message: populated });
});