require("dotenv").config();
const { getUserNotificationsQuery ,
  findNotificationById,
  markNotificationAsRead,
  findDepositByNotificationId,
  updateDepositStatus,
  findUserById,
  createNotification
} = require("../queries/notificationQuery");

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
  
      const notification = await findNotificationById(notificationId);
      if (!notification) {
        return res.status(404).json({ success: false, message: "Notification không tồn tại." });
      }
  
      await markNotificationAsRead(notification);
  
      const deposit = await findDepositByNotificationId(notification.id);
      if (!deposit) {
        return res.status(404).json({ success: false, message: "Không tìm thấy deposit tương ứng." });
      }
  
      await updateDepositStatus(deposit, 'accept');
  
      const userRenting = await findUserById(deposit.user_id);
      if (!userRenting) {
        return res.status(404).json({ success: false, message: "Không tìm thấy người thuê." });
      }
  
      const message = `Đặt cọc của bạn đã được chủ trọ chấp nhận. Vui lòng xác nhận và tiến hành thiết lập hợp đồng.`;
      const notifyTenant = await createNotification(userRenting.id, notification.room_id, message);
  
      return res.status(200).json({
        success: true,
        message: "Chủ trọ đã xác nhận cho thuê. Đặt cọc chuyển sang trạng thái 'accept'.",
        deposit,
        notificationUpdated: notification,
        notifyTenant,
      });
  
    } catch (error) {
      console.error("❌ Error confirming rental:", error);
      return res.status(500).json({ success: false, message: "Lỗi server." });
    }
  };

  module.exports = { getUserNotifications , confirmRentalByOwner };