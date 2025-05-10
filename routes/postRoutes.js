const express = require("express");
const router = express.Router();
const {
  createPostController,
  updatePostController,
  getPostByUserController,
  updatePostInformationByUserController

} = require("../controllers/postController");
const { authenticateJWT } = require('../middlewares/auth'); 
const upload = require("../middlewares/uploadMiddleware");




// Route để tạo post mới
router.post("/create-post",authenticateJWT, upload.array("room_images", 5),createPostController);

// Route để update post
router.put("/update-post/:id", updatePostController);
// Route để lấy danh sách post của người dùng
router.get("/get-post-by-user", authenticateJWT,getPostByUserController);

// Route để update thông tin bài đăng
router.put("/update-post-by-user/:id", authenticateJWT,upload.array("room_images", 5), updatePostInformationByUserController);

module.exports = router;
