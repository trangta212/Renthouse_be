const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markNotificationAsRead,
  confirmRentalByOwner,
} = require('../controllers/notificationController');
const { authenticateJWT } = require("../middlewares/auth");

// Định nghĩa route cho việc gửi thông báo
// router.get('/send-notification', authenticateJWT, sendDepositNotificationController);
router.get('/notifications', authenticateJWT, getUserNotifications);
router.post('/confirm-rental/:notificationId', authenticateJWT, confirmRentalByOwner);
module.exports = router;