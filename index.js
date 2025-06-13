require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const sequelize = require("./config/dbConfig");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require('path');
const bodyParser = require("body-parser");
const startBrowser = require('./crawl_data/browser');
const scrapeController = require('./crawl_data/scrapeController');
// const importRooms = require('./crawl_datacrawl_data/importRoom');


const app = express();
const port = process.env.PORT || 8080;

// Khởi tạo HTTP server với Express
const server = createServer(app);

// Cấu hình Socket.IO
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "10mb" })); // Tăng giới hạn JSON payload lên 10MB
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(morgan("combined"));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Thêm socket.io vào request object (ĐẶT TRƯỚC CÁC ROUTES)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Import routes
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const paymentRoute = require("./routes/paymentRoutes");
const postRoutes = require("./routes/postRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const roomSearchRoutes = require("./routes/roomSearchRoutes");
const depositRoutes = require("./routes/depositRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const contractRoutes = require("./routes/contractRoutes");
const uploadRoutes = require('./routes/uploadRoutes');

// Định nghĩa route
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/room", roomRoutes);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/favorite", favoriteRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1", roomSearchRoutes);
app.use("/api/v1/deposit", depositRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/contract", contractRoutes);
app.use('/api/upload', uploadRoutes);

// Kết nối database
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

// CHỌN MỘT CÁCH XỬ LÝ SOCKET:
// Cách 1: Sử dụng WebSocket Controller
const websocketController = require("./controllers/webSocketController");
websocketController(io);

// Cách 2: Xử lý trực tiếp (NẾN CHỌN CÁCH 1 THÌ COMMENT PHẦN NÀY LẠI)
// io.on("connection", (socket) => {
//   console.log(`🔗 New client connected: ${socket.id}`);
//
//   // Lưu socket ID cho user
//   socket.on("authenticate", (userId) => {
//     socket.join(`user_${userId}`);
//     console.log(`User ${userId} authenticated with socket ${socket.id}`);
//   });
//
//   // Handle disconnect
//   socket.on("disconnect", () => {
//     console.log(`❌ Client disconnected: ${socket.id}`);
//   });
// });

// Error handling middleware - đặt trước server.listen
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    error: err.message || "Có lỗi xảy ra trong quá trình xử lý",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Chạy server
server.listen(port, async () => {
  await connectDB();
  console.log(`🚀 Server is running on port ${port}`);
  // Uncomment nếu cần sử dụng các tính năng này
  // let browser = startBrowser();
  // scrapeController(browser);
  // importRooms();
});