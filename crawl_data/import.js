require("dotenv").config();
const fs = require("fs");
const sequelize = require("./database");
const Room = require("./models/room");

// Đọc dữ liệu từ file JSON
const data = JSON.parse(fs.readFileSync("dataphongtro.json", "utf8"));

// Hàm nhập dữ liệu vào DB
const importData = async () => {
  try {
    await sequelize.sync({ force: true }); // Xóa bảng cũ, tạo bảng mới
    console.log("Database synced!");

    // Duyệt qua danh sách và lưu từng mục vào DB
    const rooms = data.headerDetail.map((item) => ({
      title: item.title,
      address: item.address,
      price: item.price,
      description: data.descriptionData.join("\n"), // Gộp mô tả thành chuỗi
    }));

    await Room.bulkCreate(rooms); // Thêm hàng loạt dữ liệu vào DB
    console.log("Data imported successfully!");
    process.exit();
  } catch (error) {
    console.error("Error importing data:", error);
    process.exit(1);
  }
};

// Chạy script nhập dữ liệu
importData();
