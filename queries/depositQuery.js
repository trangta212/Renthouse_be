const db = require("../models/index");
const moment = require("moment");
const { Notification } = require("../models");

const createDeposit = async (depositData) => {
  try {
    const {
      fullNameIndentify,
      phone_number,
      identifyNumber,
      room_id,             // giả sử bạn truyền room_id
      status,
      deposit_amount,
      deposit_day,         // ví dụ: "13/4/2025"
      date_of_birth,
      user_id    ,          // cần truyền user_id nếu cập nhật user
      address,
      cccd_images,
      payment_method,
      trans_id,
      order_id,
      payment_time,
      refund_reason,
      partnerCode
    } = depositData;

    console.log("📦 Data of deposit:", depositData);

    const result = await db.sequelize.transaction(async (t) => {
      // 1. Cập nhật user
      const [user, created] = await db.User.upsert(
        {
          id: user_id, // rất quan trọng để xác định update hay insert
          fullNameIndentify: fullNameIndentify,
          phone_number: phone_number,
          date_of_birth: moment(date_of_birth, 'D/M/YYYY').format('YYYY-MM-DD'),
          identifyNumber: identifyNumber,
          address: address,
          cccd_images: cccd_images,
          updated_at: new Date(),
        },
        { transaction: t }
      );
      
      console.log(created ? "👶 Created new user" : "🔁 Updated existing user");
      // Truy vấn rentpost
      // 1. Lấy RentPost
       const rentPost = await db.RentPost.findOne({
          where: { room_id },
          transaction: t,
           });

if (!rentPost) throw new Error("Không tìm thấy RentPost");

// 2. Lấy Room
const room = await db.Room.findByPk(room_id, { transaction: t });


      if (!rentPost) {
        throw new Error("Không tìm thấy bài đăng (RentPost) cho room_id đã cung cấp.");
      }

      // 2. Tạo bản ghi Deposit
      const depositDateConverted = moment(deposit_day, "D/M/YYYY").toDate();
     
      
      if (!rentPost) {
        throw new Error("Không tìm thấy bài đăng (RentPost) cho room_id đã cung cấp.");
      }
      
      // 2. Lấy post_id từ kết quả
      const postId = rentPost.id;

      const deposit = await db.Deposit.create(
        {
          user_id: user_id,
          post_id: postId,        
          deposit_amount: deposit_amount,
          deposit_day: deposit_day,
          status: status,
          created_at: new Date(),
          updated_at: new Date(),
          depositDate: depositDateConverted, // nếu có trường này
          payment_method: payment_method,
          trans_id: trans_id,
          order_id: order_id,
          payment_time: payment_time,
          refund_reason: refund_reason,
          partnerCode: partnerCode,
        },
        { transaction: t }
      );

      // 3. Gửi thông báo cho chủ trọ
      const userName = await db.User.findByPk(user_id, { transaction: t });
      if (!userName) {
        throw new Error("Không tìm thấy thông tin người dùng.");
      }

      const notification = await Notification.create({
        user_id: rentPost.user_id,  // Gửi thông báo cho chủ trọ của RentPost
        room_id: rentPost.room_id,
        message: message = `Phòng của bạn đã được đặt cọc trước ${deposit_amount.toLocaleString()} VND vào lúc ${deposit_day} từ ${userName.fullNameIndentify}. Bạn có đồng ý xác nhận việc đặt cọc này không?`,
        is_read: false,
        time: new Date(),
      });

      // Cập nhật notification_id vào Deposit
      await deposit.update({ notification_id: notification.id }, { transaction: t });

      console.log(`📬 Notification sent to owner (user_id: ${rentPost.user_id})`);

      return {
        message: "Deposit created successfully",
        deposit,
        user,
        notification,
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
