const express = require("express");
const router = express.Router();
const {
  createPostController,
  updatePostController,
  getPostByUserController,
  updatePostInformationByUserController

} = require("../controllers/postController");
const { authenticateJWT } = require('../middlewares/auth'); 


// Route để tạo post mới
router.post("/create-post", createPostController);

// Route để update post
router.put("/update-post/:id", updatePostController);
// Route để lấy danh sách post của người dùng
router.get("/get-post-by-user", authenticateJWT,getPostByUserController);

// Route để update thông tin bài đăng
router.put("/update-post-by-user/:id", authenticateJWT, updatePostInformationByUserController);

module.exports = router;
