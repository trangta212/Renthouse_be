require("dotenv").config();
const db = require("../models/index");
const { createDeposit } = require("../queries/depositQuery");


const getDepositController = async (req, res) => {
    try {
      const userId = req.user.id; 
      const depositData = req.body;
      if (!userId) {
        return res.status(400).json({ error: "ID người dùng không hợp lệ" });
      }else {
        console.log("ID người dùng:", userId);
      }
      depositData.user_id = userId;
      const depositdataControl = await createDeposit(depositData)
        if (!depositdataControl) {
            return res.status(404).json({ error: "Không tìm thấy người dùng" });
        }
        return res.status(200).json({
            success: true,
            message: "Thông tin người dùng",
            data: depositdataControl,
          });
    }
    catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      return res.status(500).json({
        success: false,
        error: "Đã xảy ra lỗi khi lấy thông tin người dùng. Vui lòng thử lại!",
      });
    }
    }
module.exports = { getDepositController };