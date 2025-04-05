require("dotenv").config();
const db = require("../models/index");
const { getUserProfile } = require("../queries/userQuery");


const getUserProfileController = async (req, res) => {
  try {
    const userId = req.user.id; 
    if (!userId) {
      return res.status(400).json({ error: "ID người dùng không hợp lệ" });
    }

    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    return res.status(200).json({
      success: true,
      message: "Thông tin người dùng",
      data: userProfile,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return res.status(500).json({
      success: false,
      error: "Đã xảy ra lỗi khi lấy thông tin người dùng. Vui lòng thử lại!",
    });
  }
}
module.exports = { getUserProfileController };