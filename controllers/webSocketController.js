const jwt = require("jsonwebtoken");
const db = require("../models");

module.exports = (io) => {
  console.log("=== WEBSOCKET CONTROLLER LOADED ===");

  io.on("connection", (socket) => {
    console.log("\n=== NEW CONNECTION ===");
    console.log("Socket ID:", socket.id);

    // // Test log để kiểm tra console có hoạt động
    // setInterval(() => {
    //   console.log("Heartbeat check - Socket:", socket.id);
    // }, 5000);

    // Xử lý authenticate
    socket.on("authenticate", async (data) => {
      try {
        console.log("\n=== AUTHENTICATE EVENT ===");
        console.log("Socket ID:", socket.id);
        console.log("Received data:", data);

        const { email, token } = data;

        if (!email || !token) {
          console.log("❌ Missing email or token");
          socket.emit("auth_error", "Missing email or token");
          return;
        }

        console.log("Looking for user with email:", email);
        const user = await db.User.findOne({
          where: { email: email },
        });

        if (!user) {
          console.log("❌ User not found in database");
          socket.emit("auth_error", "User not found");
          return;
        }

        console.log("✅ User found:", user.email);
        socket.userEmail = email;
        socket.isAuthenticated = true;
        socket.join(`user_${email}`);

        console.log(
          "✅ Socket authenticated and joined room:",
          `user_${email}`
        );
        socket.emit("authenticated", { success: true });
      } catch (error) {
        console.log("❌ Authentication error:", error.message);
        console.error("Full error:", error);
        socket.emit("auth_error", "Authentication failed");
      }
    });

    // Xử lý gửi tin nhắn
    socket.on("send_message", async (data) => {
      console.log("\n=== SEND MESSAGE EVENT TRIGGERED ===");
      console.log("Socket ID:", socket.id);
      console.log("Socket authentication status:", socket.isAuthenticated);
      console.log("Socket user email:", socket.userEmail);
      console.log("Received data:", JSON.stringify(data, null, 2));

      try {
        if (!socket.isAuthenticated) {
          const error = "Socket not authenticated";
          console.log("❌", error);
          socket.emit("message_error", error);
          return;
        }

        if (!data || typeof data !== "object") {
          const error = "Invalid message data format";
          console.log("❌", error);
          socket.emit("message_error", error);
          return;
        }

        const { receiverEmail, content } = data;
        const senderEmail = socket.userEmail;

        console.log("Message details:", {
          senderEmail,
          receiverEmail,
          content,
          socketId: socket.id,
        });

        if (!receiverEmail || !content) {
          const error = "Missing receiverEmail or content";
          console.log("❌", error, {
            receiverEmail: !!receiverEmail,
            content: !!content,
          });
          socket.emit("message_error", error);
          return;
        }

        console.log("Finding receiver in database...");
        const receiver = await db.User.findOne({
          where: { email: receiverEmail },
        });

        if (!receiver) {
          const error = "Receiver not found";
          console.log("❌", error);
          socket.emit("message_error", error);
          return;
        }

        console.log("✅ Receiver found. Creating message...");
        try {
          const message = await db.Message.create({
            senderEmail,
            receiverEmail,
            content,
          });

          console.log("✅ Message saved:", {
            id: message.id,
            sender: message.senderEmail,
            receiver: message.receiverEmail,
          });

          // Gửi tin nhắn đến người nhận
          io.to(`user_${receiverEmail}`).emit("receive_message", {
            id: message.id,
            senderEmail,
            content,
            timestamp: message.createdAt,
          });
          io.to(`user_${senderEmail}`).emit("receive_message", {
            id: message.id,
            senderEmail,
            content,
            timestamp: message.createdAt,
          });
          // Gửi xác nhận về người gửi
          socket.emit("message_sent", {
            success: true,
            message: {
              id: message.id,
              senderEmail: message.senderEmail,
              receiverEmail: message.receiverEmail,
              content: message.content,
              createdAt: message.createdAt,
            },
          });

          console.log("✅ Message handling completed successfully");
        } catch (dbError) {
          console.log("❌ Database error:", {
            name: dbError.name,
            message: dbError.message,
            stack: dbError.stack,
          });
          socket.emit("message_error", "Failed to save message");
        }
      } catch (error) {
        console.log("❌ Unexpected error:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
        socket.emit("message_error", "Internal server error");
      }
    });

    socket.on("disconnect", () => {
      console.log("\n=== DISCONNECT EVENT ===");
      console.log("Socket ID:", socket.id);
      console.log("User email:", socket.userEmail || "Unknown");
    });

    // Log all events for debugging
    socket.onAny((event, ...args) => {
      console.log("\n=== EVENT RECEIVED ===");
      console.log("Event name:", event);
      console.log("Arguments:", args);
    });
  });

  // Test log khi khởi tạo
  // setInterval(() => {
  //   console.log("WebSocket server heartbeat check");
  // }, 10000);
};
