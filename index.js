require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const sequelize = require("./config/dbConfig");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const paymentRoute = require("./routes/paymentRoutes");
const postRoutes = require("./routes/postRoutes");
// const startBrowser = require('./crawl_data/browser');
// const scrapeController = require('./crawl_data/scrapeController');
// const importRooms = require('./crawl_data/importRoom');

const { createServer } = require("http");
const { Server } = require("socket.io");

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
app.use(morgan("combined"));
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    credentials: true,
  })
);

// Định nghĩa route
app.use("/api/auth", authRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/post", postRoutes);

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

// Lắng nghe kết nối từ client qua Socket.IO
io.on("connection", (socket) => {
  console.log(`🔗 New client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

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
  // let browser = startBrowser();
  // scrapeController(browser);
  // importRooms();
});

