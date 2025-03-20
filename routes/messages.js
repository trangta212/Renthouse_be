const express = require("express");
const router = express.Router();
const { Message, User } = require("../models");
const { Op } = require("sequelize");

// Tạo tin nhắn mới
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    const newMessage = await Message.create({
      senderId,
      receiverId,
      messageText: text,
    });

    // Load thêm thông tin người gửi
    const messageWithSender = await Message.findByPk(newMessage.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "avatar"],
        },
      ],
    });

    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Lấy tin nhắn giữa 2 người dùng
router.get("/:userId/:friendId", async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const messages = await Message.findAndCountAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "avatar"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset: (page - 1) * limit,
    });

    res.status(200).json({
      messages: messages.rows,
      totalPages: Math.ceil(messages.count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Đánh dấu tin nhắn đã đọc
router.put("/read/:messageId", async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: "Không tìm thấy tin nhắn" });
    }

    message.isRead = true;
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
