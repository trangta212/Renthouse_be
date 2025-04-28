const { Notification ,Deposit, User } = require('../models');


const getUserNotificationsQuery = async (userId) => {
  try {
    // Lấy danh sách thông báo cho user theo userId
    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [['time', 'DESC']], // Sắp xếp theo thời gian mới nhất
    });

    return notifications;
  } catch (error) {
    console.error("❌ Error retrieving notifications in query:", error);
    throw new Error("Error retrieving notifications");
  }
};
const findNotificationById = async (id) => {
  return await Notification.findByPk(id);
};

const markNotificationAsRead = async (notification) => {
  return await notification.update({ is_read: true });
};

const findDepositByNotificationId = async (notificationId) => {
  return await Deposit.findOne({
    where: { notification_id: notificationId }
  });
};

const updateDepositStatus = async (deposit, status) => {
  return await deposit.update({ status });
};

const findUserById = async (userId) => {
  return await User.findByPk(userId);
};

const createNotification = async (userId, roomId, message) => {
  return await Notification.create({
    user_id: userId,
    room_id: roomId,
    message,
    type,
    is_read: false,
    time: new Date(),
  });
};

// const getUserNotificationsWithType = async (userId) => {
//   try {
//     // Truy vấn tất cả thông báo của userId
//     const notifications = await Notification.findAll({
//       where: { user_id: userId },
//       attributes: ['notification_id', 'user_id', 'room_id', 'message', 'is_read', 'time'],
//     });

//     // Xử lý từng thông báo để xác định type
//     const result = await Promise.all(
//       notifications.map(async (notification) => {
//         const notificationId = notification.notification_id;
//         const notificationUserId = notification.user_id;

//         // Kiểm tra trong bảng Deposit
//         const deposit = await Deposit.findOne({
//           where: {
//             notification_id: notificationId,
//             user_id: notificationUserId, // user_id trong Deposit phải trùng với user_id trong Notification
//           },
//           attributes: ['deposit_id'],
//         });

//         // Xác định type
//         const type = deposit ? 'contract' : 'notification';

//         // Trả về dữ liệu thông báo với type
//         return {
//           notificationResponseId: notificationId, // Ánh xạ notification_id thành notificationResponseId
//           type,
//           user_id: notification.user_id,
//           room_id: notification.room_id,
//           message: notification.message,
//           is_read: notification.is_read,
//           time: notification.time,
//         };
//       })
//     );

//     return result;
//   } catch (error) {
//     console.error('❌ Error retrieving user notifications:', error);
//     throw new Error('Error retrieving user notifications');
//   }
// };

module.exports = {
  getUserNotificationsQuery,
  findNotificationById,
  markNotificationAsRead,
  findDepositByNotificationId,
  updateDepositStatus,
  findUserById,
  createNotification,
//  getUserNotificationsWithType 
};
