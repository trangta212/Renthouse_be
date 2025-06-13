const { handleContactAction,getContractList } = require('../queries/contractQuery');

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
        error: "Hành động không hợp lệ. Chỉ chấp nhận 'confirm' hoặc 'c'"
      });
    }

    // Xử lý hành động
    const result = await handleContactAction(notification_id, action);
    
    let message = "";
    if (action === "confirm") {
      message = "Hợp đồng thuê phòng của bạn đã được thiết lập. Vui lòng kiểm tra thông tin chi tiết trong file đính kèm mà chúng tôi đã gửi đến email của bạn.";
    } else if (action === "cancel") {
      message = "Hợp đồng của bạn đã bị người thuê từ chối thiết lập hợp đồng. Tiền đặt cọc bạn sẽ giữ và bài đăng sẽ được hiển thị lại.";
    }

    return res.status(200).json({
      success: true,
      message,
      data: result.deposit,
      type:"contract"
    });
  } catch (error) {
    console.error("❌ Error processing contact action:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Đã xảy ra lỗi khi xử lý yêu cầu",
    });
  }
};

const getContractListController = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getContractList(userId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error in getContractListController:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  processContactAction,
  getContractListController
}; 
