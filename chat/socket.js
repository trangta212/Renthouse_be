const { Server } = require("socket.io");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // URL của frontend
      methods: ["GET", "POST"]
    }
  });

  // Lưu trữ user online
  let onlineUsers = new Map();

  io.on("connection", (socket) => {
    // Xử lý khi user kết nối
    socket.on("addUser", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    });

    // Xử lý gửi tin nhắn
    socket.on("sendMessage", (data) => {
      const receiverSocket = onlineUsers.get(data.receiverId);
      if(receiverSocket) {
        io.to(receiverSocket).emit("getMessage", {
          senderId: data.senderId,
          text: data.text,
          createdAt: new Date()
        });
      }
    });

    // Xử lý ngắt kết nối
    socket.on("disconnect", () => {
      onlineUsers.forEach((value, key) => {
        if (value === socket.id) {
          onlineUsers.delete(key);
        }
      });
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    });
  });
}

module.exports = initSocket;