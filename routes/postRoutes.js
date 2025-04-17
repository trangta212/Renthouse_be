const express = require("express");
const router = express.Router();
const {
  createPostController,
  updatePostController,
} = require("../controllers/postController");

// Route để tạo post mới
router.post("/create-post", createPostController);

// Route để update post
router.put("/update-post/:id", updatePostController);

module.exports = router;
