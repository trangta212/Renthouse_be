require("dotenv").config();
const { createPost, updatePost } = require("../queries/postQuery");

const createPostController = async (req, res) => {
  try {
    const postData = req.body;
    if (!postData || !postData.email) {
      return res.status(400).json({ error: "Dữ liệu đầu vào không hợp lệ" });
    }

    const newPost = await createPost(postData).catch((err) => {
      console.error("Error in createPost function:", err);
      throw new Error("Database operation failed");
    });

    return res.status(200).json({
      success: true,
      message: "Bài đăng đã được tạo thành công!",
      data: newPost,
    });
  } catch (error) {
    console.error("Lỗi khi tạo bài đăng:", error);
    return res.status(500).json({
      success: false,
      error: "Đã xảy ra lỗi khi tạo bài đăng. Vui lòng thử lại!",
    });
  }
};

const updatePostController = async (req, res) => {
    try {
      // Lấy id từ URL params thay vì từ body
      const { id } = req.params;
  
      // Log request data để debug
      console.log("Update post request data:", req.body);
  
      // Kiểm tra id có tồn tại không
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Post ID is required",
        });
      }
  
      // Chuẩn bị dữ liệu để update
      const updateData = {
        email: req.body.email,
        lastName: req.body.lastName,
        phone_number: req.body.phone_number,
        room_name: req.body.room_name,
        description: req.body.description,
        price_per_month: req.body.price_per_month,
        type: req.body.type,
        area: req.body.area,
        address: req.body.address,
        status: req.body.status,
      };
  
      // Validate dữ liệu đầu vào
      if (updateData.price_per_month && isNaN(updateData.price_per_month)) {
        return res.status(400).json({
          success: false,
          message: "Price must be a number",
        });
      }
  
      if (updateData.area && isNaN(updateData.area)) {
        return res.status(400).json({
          success: false,
          message: "Area must be a number",
        });
      }
  
      // Gọi hàm updatePost từ query
      const result = await updatePost(id, updateData);
  
      // Trả về kết quả thành công
      return res.status(200).json({
        success: true,
        message: "Post updated successfully",
        data: result,
      });
    } catch (error) {
      // Log chi tiết lỗi để debug
      console.error("Error in updatePostController:", error);
  
      // Xử lý lỗi cụ thể
      if (error.message === "Post not found") {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }
  
      // Lỗi validation từ database
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors.map((err) => err.message),
        });
      }
  
      // Lỗi unique constraint
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          success: false,
          message: "Duplicate entry error",
          errors: error.errors.map((err) => err.message),
        });
      }
  
      // Lỗi server
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };
  

module.exports = {
  createPostController,
  updatePostController,
};
