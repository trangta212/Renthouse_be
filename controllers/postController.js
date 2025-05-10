require("dotenv").config();
const { createPost, updatePost,getPostByUser,UpdatePostInformationByUser} = require("../queries/postQuery");
const moment = require("moment");
const axios = require("axios");

// const createPostController = async (req, res) => {
//   try {
//     const userId = req.user.id; 
//     const {  
//       fullNameIndentify,
//       identifyNumber,
//       date_of_birth,
//       phone_number,
//       electricity_bill,
//       water_bill,
//       extensions,
//       full_furnishing,
//       room_name,
//       description,
//       price_per_month,
//       type,
//       area,
//       address,
//       user_address,
//       start_date,
//       expire,
//       priority
//     } = req.body;
    
//       const postData = {
//       fullNameIndentify,
//       identifyNumber,
//       date_of_birth,
//       phone_number,
//       electricity_bill,
//       water_bill,
//       extensions,
//       full_furnishing,
//       room_name,
//       description,
//       price_per_month,
//       type,
//       area,
//       address,
//       user_address,
//       room_images: req.files
//        ? req.files.map(file => file.filename) // hoặc thêm prefix nếu cần
//       : [],
//       start_date,
//       expire,
//       priority
//     };
//     console.log("req.file:", req.file);

//     if (!postData) {
//       return res.status(400).json({ error: "Dữ liệu đầu vào không hợp lệ" });
//     }
    
//     const newPost = await createPost(postData,userId).catch((err) => {
//       console.error("Error in createPost function:", err);
//       throw new Error("Database operation failed");
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Bài đăng đã được tạo thành công!",
//       data: newPost,
//     });
//   } catch (error) {
//     console.error("Lỗi khi tạo bài đăng:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Đã xảy ra lỗi khi tạo bài đăng. Vui lòng thử lại!",
//     });
//   }
// };

const createPostController = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullNameIndentify,
      identifyNumber,
      date_of_birth,
      phone_number,
      electricity_bill,
      water_bill,
      extensions,
      full_furnishing,
      room_name,
      description,
      price_per_month,
      type,
      area,
      address,
      user_address,
      start_date,
      expire,
      priority,
    } = req.body;

    // Hàm lấy longitude và latitude từ address bằng PositionStack
    const getCoordinates = async (address) => {
      try {
        if (!address || address.trim().length < 5) {
          console.warn("Address is too short or empty:", address);
          return { longitude: null, latitude: null };
        }
    
        console.log("Sending geocoding request for address:", address);
    
        const response = await axios.get("http://api.positionstack.com/v1/forward", {
          params: {
            access_key: "134f8263c1046f546b9bde8aed3ef677", // thay bằng .env nếu có
            query: address, // KHÔNG cần encodeURIComponent
            limit: 1,
            country: "VN",
          },
          timeout: 5000,
          headers: {
            "User-Agent": "RentHouseApp/1.0 (contact@renthouse.vn)" // thêm cho đúng chuẩn gọi API
          }
        });
    
        console.log("responsePositionStack :", response.data);
    
        const results = response.data.data;
        if (results && results.length > 0) {
          const { latitude, longitude } = results[0];
          console.log(`Found coordinates: latitude=${latitude}, longitude=${longitude}`);
          return { longitude, latitude };
        } else {
          console.warn(`No results found for address: ${address}`);
          return { longitude: null, latitude: null };
        }
      } catch (error) {
        console.error("Error fetching coordinates from PositionStack:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          code: error.code,
        });
        return { longitude: null, latitude: null };
      }
    };
    

    // Lấy tọa độ từ address
    const coordinates = await getCoordinates(address);
    console.log("Received coordinates:", coordinates);

    const postData = {
      fullNameIndentify,
      identifyNumber,
      date_of_birth,
      phone_number,
      electricity_bill: parseFloat(electricity_bill),
      water_bill: parseFloat(water_bill),
      extensions,
      full_furnishing: parseInt(full_furnishing),
      room_name,
      description,
      price_per_month: parseFloat(price_per_month),
      type,
      area: parseFloat(area),
      address,
      user_address,
      room_images: req.files ? req.files.map((file) => file.filename) : [],
      start_date,
      expire,
      priority,
      longitude: coordinates.longitude,
      latitude: coordinates.latitude,
    };

    console.log("req.files:", req.files);
    console.log("postData:", postData);

    if (!postData) {
      return res.status(400).json({ error: "Dữ liệu đầu vào không hợp lệ" });
    }

    const newPost = await createPost(postData, userId).catch((err) => {
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
    const {
      room_name,
      description,
      price_per_month,
      type,
      area,
      address,
      electricity_bill,
      water_bill,
      extensions,
      full_furnishing,
    } = req.body;
    
    const postData = {
      room_name,
      description,
      price_per_month,
      type,
      area,
      address,
      electricity_bill,
      water_bill,
      extensions,
      full_furnishing,
      room_images: req.files ? req.files.map((file) => file.filename) : [],
    };

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

