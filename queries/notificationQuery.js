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
    is_read: false,
    time: new Date(),
  });
};

module.exports = {
  getUserNotificationsQuery,
  findNotificationById,
  markNotificationAsRead,
  findDepositByNotificationId,
  updateDepositStatus,
  findUserById,
  createNotification,
};
