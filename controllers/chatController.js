const db = require("../models");
const { Op } = require("sequelize");

// Lấy danh sách cuộc trò chuyện
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy danh sách các cuộc trò chuyện duy nhất
    const conversations = await db.Message.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      include: [
        {
          model: db.User,
          as: "sender",
          attributes: ["id", "firstName", "lastName", "profile_picture"],
        },
        {
          model: db.User,
          as: "receiver",
          attributes: ["id", "firstName", "lastName", "profile_picture"],
        },
      ],
      order: [["createdAt", "DESC"]],
      group: [
        [
          db.sequelize.literal(
            "LEAST(senderId, receiverId), GREATEST(senderId, receiverId)"
          ),
        ],
      ],
    });

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Error in getConversations:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách cuộc trò chuyện",
    });
  }
};

// Lấy tin nhắn giữa 2 người dùng
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy id người dùng từ token

    // Lấy thông tin người dùng hiện tại
    const currentUser = await db.User.findOne({
      where: { id: userId },
      attributes: ["email"],
    });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    const senderEmail = currentUser.email;
    const { receiverEmail } = req.query;

    if (!receiverEmail) {
      return res.status(400).json({
        success: false,
        message: "Thiếu email người nhận",
      });
    }

    const receiver = await db.User.findOne({
      where: { email: receiverEmail },
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Người nhận không tồn tại",
      });
    }

    // Tìm tất cả tin nhắn giữa người gửi và người nhận
    const messages = await db.Message.findAll({
      where: {
        [Op.or]: [
          {
            senderEmail: senderEmail,
            receiverEmail: receiverEmail,
          },
          {
            senderEmail: receiverEmail,
            receiverEmail: senderEmail,
          },
        ],
      },
      include: [
        {
          model: db.User,
          as: "sender",
          attributes: ["id", "firstName", "lastName", "profile_picture"],
        },
        {
          model: db.User,
          as: "receiver",
          attributes: ["id", "firstName", "lastName", "profile_picture"],
        },
      ],
      order: [["createdAt", "ASC"]], // Sắp xếp theo thời gian tạo
    });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy tin nhắn",
    });
  }
};

// Đánh dấu tin nhắn đã đọc
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { senderId } = req.body;

    await db.Message.update(
      { isRead: true },
      {
        where: {
          senderId,
          receiverId: userId,
          isRead: false,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Đã đánh dấu tin nhắn là đã đọc",
    });
  } catch (error) {
    console.error("Error in markAsRead:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi đánh dấu tin nhắn đã đọc",
    });
  }
};

// Gửi tin nhắn
// async function sendMessage(req, res) {
//   try {
//     const { receiverEmail, content } = req.body;
//     const userId = req.user.id;

//     // Lấy thông tin người dùng hiện tại
//     const currentUser = await db.User.findOne({
//       where: { id: userId },
//       attributes: ["email"],
//     });

//     if (!currentUser) {
//       return res.status(404).json({
//         success: false,
//         message: "Người dùng không tồn tại",
//       });
//     }

//     const senderEmail = currentUser.email;

//     if (!receiverEmail || !content) {
//       return res.status(400).json({
//         success: false,
//         message: "Thiếu email người nhận hoặc nội dung tin nhắn",
//       });
//     }

//     const receiver = await db.User.findOne({
//       where: { email: receiverEmail },
//     });

//     if (!receiver) {
//       return res.status(404).json({
//         success: false,
//         message: "Người nhận không tồn tại",
//       });
//     }

//     // Tạo tin nhắn mới
//     const message = await db.Message.create({
//       senderEmail,
//       receiverEmail,
//       content,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Tin nhắn đã được gửi!",
//       data: {
//         senderEmail,
//         receiverEmail,
//         content,
//         receiverId: receiver.id,
//       },
//     });
//   } catch (error) {
//     console.error("Error in sendMessage:", error);
//     res.status(500).json({
//       success: false,
//       message: "Lỗi khi gửi tin nhắn",
//     });
//   }
// }

module.exports = {
  getConversations,
  getMessages,
  markAsRead,
  // sendMessage,
};
