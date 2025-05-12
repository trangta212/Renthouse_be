require("dotenv").config();
const { getUserNotificationsQuery ,
  findNotificationById,
  markNotificationAsRead,
  findDepositByNotificationId,
  updateDepositStatus,
  findUserById,
} = require("../queries/notificationQuery");
const { processRefund } = require("./paymentController");
const db = require("../models");

const getUserNotifications = async (req, res) => {
    try {
      const currentUserId = req.user.id; // lấy từ middleware authenticateJWT
  
      // Gọi query để lấy thông báo cho chủ trọ
      const notifications = await getUserNotificationsQuery(currentUserId);
  
      return res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      console.error("❌ Error retrieving notifications:", error);
      return res.status(500).json({ success: false, error: "Lỗi server" });
    }
  };

  const confirmRentalByOwner = async (req, res) => {
    try {
      const notificationId = req.params.notificationId;
      const { action } = req.body; // 'accept' or 'refund'
  
      const notification = await findNotificationById(notificationId);
      if (!notification) {
        return res.status(404).json({ success: false, message: "Notification không tồn tại." });
      }
  
      await markNotificationAsRead(notification);
  
      const deposit = await findDepositByNotificationId(notification.id);
      if (!deposit) {
        return res.status(404).json({ success: false, message: "Không tìm thấy deposit tương ứng." });
      }
  
      const userRenting = await findUserById(deposit.user_id);
      if (!userRenting) {
        return res.status(404).json({ success: false, message: "Không tìm thấy người thuê." });
      }

      let message = '';
      let notifyTenant;
      let rentPost;
      if (action === 'accept') {
        await updateDepositStatus(deposit, 'accept');
        rentPost = await db.RentPost.findOne({ where: { room_id: notification.room_id } });
        if (rentPost) {
          await rentPost.update({ status: 'deposited' });
        }
        message = `Đặt cọc của bạn đã được chủ trọ chấp nhận. Vui lòng xác nhận và tiến hành thiết lập hợp đồng.`;
        type ="contract"
        notifyTenant 
        // = await createNotification(userRenting.id, notification.room_id, message , type);
        = await notification.update({
          message: message,
          type: type,
          status: 'accepted', // Ví dụ, nếu bạn muốn cập nhật trạng thái của notification
          room_id: notification.room_id, // Giữ nguyên room_id nếu cần
          user_id: userRenting.id, // Cập nhật lại thông tin người thuê nếu cần
          // Bạn có thể thêm hoặc chỉnh sửa thêm các trường khác tùy theo yêu cầu
        });

      } else if (action === 'refund') {
        // Process refund
        const refundResult = await processRefund(deposit);
        
        if (!refundResult.success) {
          // Cập nhật trạng thái hoàn tiền thất bại
          await deposit.update({ 
            status: 'refund_failed',
            refund_status: 'refund_failed',
            refund_reason: refundResult.error || "Lỗi khi hoàn tiền"
          });
          
          return res.status(500).json({ 
            success: false, 
            message: refundResult.message || "Lỗi khi hoàn tiền. Vui lòng thử lại sau." 
          });
        }
        
        // Cập nhật trạng thái hoàn tiền thành công
        await deposit.update({ 
          status: 'refunded',
          refund_status: 'refunded',
          refund_reason: "Chủ trọ từ chối đặt cọc"
        });
        type = "cancel"
        message = `Đặt cọc của bạn đã bị từ chối. Số tiền ${deposit.deposit_amount.toLocaleString()} VND đã được hoàn trả về tài khoản của bạn.`;
        notifyTenant
        = await notification.update({
          message: message,
          type: type,
          status: 'refunded', // Ví dụ, nếu bạn muốn cập nhật trạng thái của notification
          room_id: notification.room_id, // Giữ nguyên room_id nếu cần
          user_id: userRenting.id, // Cập nhật lại thông tin người thuê nếu cần
          // Bạn có thể thêm hoặc chỉnh sửa thêm các trường khác tùy theo yêu cầu
        });
      } else {
        return res.status(400).json({ 
          success: false, 
          message: "Hành động không hợp lệ. Vui lòng chọn 'accept' hoặc 'refund'." 
        });
      }
  
      return res.status(200).json({
        success: true,
        message: action === 'accept' 
          ? "Chủ trọ đã xác nhận cho thuê. Đặt cọc chuyển sang trạng thái 'accept'."
          : "Chủ trọ đã từ chối và hoàn tiền đặt cọc. Đặt cọc chuyển sang trạng thái 'refunded'.",
        deposit,
        notificationUpdated: notification,
        notifyTenant,
        type:"notification"
      });
  
    } catch (error) {
      console.error("❌ Error processing rental action:", error);
      return res.status(500).json({ success: false, message: "Lỗi server." });
    }
  };
  
  module.exports = { getUserNotifications , confirmRentalByOwner };
  