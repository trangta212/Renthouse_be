require("dotenv").config();
const db = require("../models/index");
const { createDeposit } = require("../queries/depositQuery");

const getDepositController = async (req, res) => {
  try {
      const userId = req.user?.id; // Lấy userId từ token (middleware xác thực)
      console.log("✅ User ID sau xác thực:", req.user);

      if (!userId) {
          console.error("❌ ID người dùng không hợp lệ:", req.user);
          return res.status(400).json({ error: "ID người dùng không hợp lệ" });
      }

      const depositData = req.body;
      console.log("✅ Dữ liệu nhận từ frontend:", depositData);

      depositData.user_id = userId;
      console.log("✅ Dữ liệu gửi đến createDeposit:", depositData);

      const depositdataControl = await createDeposit(depositData);
      console.log("✅ Kết quả từ createDeposit:", depositdataControl);

      if (!depositdataControl) {
          console.error("❌ Không tìm thấy người dùng:", depositdataControl);
          return res.status(404).json({ error: "Không tìm thấy người dùng" });
      }

      return res.status(200).json({
          success: true,
          message: "Thông tin người dùng",
          data: depositdataControl,
          type:"notification"
      });
  } catch (error) {
      console.error("❌ Lỗi khi lấy thông tin người dùng:", error.message);
      console.error("❌ Chi tiết lỗi:", error.stack);
      return res.status(500).json({
          success: false,
          error: "Đã xảy ra lỗi khi lấy thông tin người dùng. Vui lòng thử lại!",
      });
  }
};
module.exports = { getDepositController };