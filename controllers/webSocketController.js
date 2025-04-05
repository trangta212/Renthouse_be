// controllers/webSocketController.js

module.exports = (io) => {
    io.on("connection", (socket) => {
      console.log(`🔗 New client connected: ${socket.id}`);
  
      // Lắng nghe sự kiện 'authenticate' để lưu socket ID của người dùng
      socket.on("authenticate", (userEmail) => {
        socket.join(`user_${userEmail}`);
        console.log(`User ${userEmail} authenticated with socket ${socket.id}`);
      });
  
      // Lắng nghe sự kiện 'send_message' khi có tin nhắn mới
      socket.on("send_message", (messageData) => {
        console.log("📩 Server received message from FE:", messageData); // ✅ Log thêm vào đây
        const { senderEmail, receiverEmail, message } = messageData;
  
        // Sau khi gửi tin nhắn, phát sự kiện tới người nhận
        socket.to(`user_${receiverEmail}`).emit("receive_message", messageData);
      });
  
      // Xử lý khi client ngắt kết nối
      socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
      });
    });
  };
  