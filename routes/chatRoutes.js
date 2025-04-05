const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middlewares/auth");
const {
  getConversations,
  getMessages,
  markAsRead,
  sendMessage,
} = require("../controllers/chatController");

// Tất cả routes đều cần xác thực
router.use(authenticateJWT);

// Lấy danh sách cuộc trò chuyện
router.get("/conversations", getConversations);

// Lấy tin nhắn giữa 2 người dùng
router.get("/messages", getMessages);

// Đánh dấu tin nhắn đã đọc
router.post("/mark-as-read", markAsRead);

// Gửi tin nhắn
// router.post("/send", sendMessage);

module.exports = router;
