const express = require("express");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const {
  getOrCreateChatController,
  getMyChatsController,
  getChatMessagesController,
  sendMessageController,
} = require("../controllers/chatController");

const router = express.Router();

router.get("/chats",                        isAuthenticated, getMyChatsController);
router.get("/chats/user/:userId",           isAuthenticated, getOrCreateChatController);
router.get("/chats/:chatId/messages",       isAuthenticated, getChatMessagesController);
router.post("/chats/:chatId/messages",      isAuthenticated, sendMessageController);

module.exports = router;