const { handleContactAction } = require('../queries/contractQuery');

const processContactAction = async (req, res) => {
  try {
    const { notification_id, action } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!notification_id || !action) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin bắt buộc (notification_id hoặc action)"
      });
    }

    // Kiểm tra action hợp lệ
    if (action !== 'confirm' && action !== 'cancel') {
      return res.status(400).json({
        success: false,
        error: "Hành động không hợp lệ. Chỉ chấp nhận 'confirm' hoặc 'cancel'"
      });
    }

    // Xử lý hành động
    const result = await handleContactAction(notification_id, action);

    return res.status(200).json({
      success: true,
      message:"Hợp đồng thuê phòng của bạn đã được thiết lập. Vui lòng kiểm tra thông tin chi tiết trong file đính kèm mà chúng tôi đã gửi đến email của bạn.",
      data: result.deposit
    });
  } catch (error) {
    console.error("❌ Error processing contact action:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Đã xảy ra lỗi khi xử lý yêu cầu"
    });
  }
};

module.exports = {
  processContactAction
}; 