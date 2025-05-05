require("dotenv").config();
const { createPost, updatePost,getPostByUser,UpdatePostInformationByUser} = require("../queries/postQuery");

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
        room_images: req.body.room_images,
        start_date: req.body.start_date,
        expire: req.body.expire
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
const getPostByUserController = async (req, res) => {
  try {
    const userId = req.user.id; 
    if (!userId) {
      return res.status(400).json({ error: "ID người dùng không hợp lệ" });
    }
    const posts = await getPostByUser(userId);
    return res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching posts by user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updatePostInformationByUserController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // id là postId
    const postId = id;
    const postData = req.body;

    if (!userId || !postId) {
      return res.status(400).json({ error: "ID người dùng hoặc ID bài đăng không hợp lệ" });
    }

    const updatedPost = await UpdatePostInformationByUser(userId, postId, postData);

    return res.status(200).json({
      success: true,
      message: "Thông tin bài đăng đã được cập nhật thành công!",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin bài đăng:", error);
    return res.status(500).json({
      success: false,
      error: "Đã xảy ra lỗi khi cập nhật thông tin bài đăng. Vui lòng thử lại!",
    });
  }
};


module.exports = {
  createPostController,
  updatePostController,
  getPostByUserController,
  updatePostInformationByUserController
};

