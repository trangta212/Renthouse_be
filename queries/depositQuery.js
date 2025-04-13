const db = require("../models/index");
const moment = require("moment");

const createDeposit = async (depositData) => {
  try {
    const {
      fullNameIndentify,
      phone_number,
      room_id,             // giả sử bạn truyền room_id
      status,
      deposit_amount,
      deposit_day,         // ví dụ: "13/4/2025"
      date_of_birth,
      user_id              // cần truyền user_id nếu cập nhật user
    } = depositData;

    console.log("📦 Data of deposit:", depositData);

    const result = await db.sequelize.transaction(async (t) => {
      // 1. Cập nhật user
      const user = await db.User.update(
        {
          fullNameIndentify,
          phone_number,
          date_of_birth,
          updated_at: new Date(),
        },
        { where: { id: user_id }, transaction: t }
      );

      // 2. Tạo bản ghi Deposit
      const depositDateConverted = moment(deposit_day, "D/M/YYYY").toDate();
      const rentPost = await db.RentPost.findOne({
        where: { room_id: room_id },
        transaction: t,
      });
      
      if (!rentPost) {
        throw new Error("Không tìm thấy bài đăng (RentPost) cho room_id đã cung cấp.");
      }
      
      // 2. Lấy post_id từ kết quả
      const postId = rentPost.id;

      const deposit = await db.Deposit.create(
        {
          user_id: user_id,
          post_id: postId,        
          amount: deposit_amount,
          status: status,
          created_at: new Date(),
          updated_at: new Date(),
          depositDate: depositDateConverted, // nếu có trường này
        },
        { transaction: t }
      );

      return {
        message: "Deposit created successfully",
        deposit,
        user,
      };
    });

    return result;
  } catch (error) {
    console.error("❌ Error creating deposit:", error);
    throw error;
  }
};
module.exports = {
  createDeposit
};