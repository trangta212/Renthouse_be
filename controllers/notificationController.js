require("dotenv").config();
const { getUserNotificationsQuery ,
  findNotificationById,
  markNotificationAsRead,
  findDepositByNotificationId,
  updateDepositStatus,
  findUserById,
  deleteNotificationById
} = require("../queries/notificationQuery");
const { processRefund } = require("./paymentController");
const db = require("../models");

const getUserNotifications = async (req, res) => {
    try {
      const currentUserId = req.user.id; // lấy từ middleware authenticateJWT
  
      // Gọi query để lấy thông báo cho chủ trọ
      const notifications = await getUserNotificationsQuery(currentUserId);
      const unreadCount = notifications.filter(noti => !noti.is_read).length;
  
      return res.status(200).json({
        success: true,
        data: notifications,
        unreadCount
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
  
      const deposit = await db.Deposit.findOne({
        where: { id: notification.deposit_id },
        attributes: {
          exclude: ['orded'] // hoặc 'ordered' nếu đó là tên đúng
        }
      });

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
        type = "contract"
        notifyTenant = await db.Notification.create({
          message: message,
          type: type,
          status: 'accepted',
          room_id: notification.room_id,
          user_id: userRenting.id,
          deposit_id: deposit.id,
          created_at: new Date(),
          updated_at: new Date(),
          is_read: false,
          time: new Date(),
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
        notifyTenant = await db.Notification.create({
          message: message,
          type: type,
          status: 'refunded',
          room_id: notification.room_id,
          user_id: userRenting.id,
          deposit_id: deposit.id,
          created_at: new Date(),
          updated_at: new Date(),
          is_read: false,
          time: new Date(),
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
        type:"notification",
      });
  
    } catch (error) {
      console.error("❌ Error processing rental action:", error);
      return res.status(500).json({ success: false, message: "Lỗi server." });
    }
  };
  const deleteNotificationController =  async (req, res) => {
    try{
    const notificationId = req.params.notificationId;
    if (!notificationId) {
      return res.status(400).json({ message: 'Không có thông báo này' });
    }
    const deleteNoti = await deleteNotificationById(notificationId);
    if (!deleteNoti) {
      console.error("❌ Không thể xoá được thông báo", deleteNoti);
      return res.status(404).json({ error: "Không thể xoá được" });
  }

  return res.status(200).json({
      success: true,
      message: "Xoá thông báo thành công"
  });
} catch (error) {
  console.error("❌ Lỗi ", error.message);
  console.error("❌ Chi tiết lỗi:", error.stack);
  return res.status(500).json({
      success: false,
      error: "Đã xảy ra lỗi",
  });
}
  }
  module.exports = { getUserNotifications , confirmRentalByOwner,deleteNotificationController };
  