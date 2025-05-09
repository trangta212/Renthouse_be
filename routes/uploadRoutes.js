const express = require('express');
const router = express.Router();
const { upload, processImage, base64ToFile } = require('../utils/imageUtils');
const { updateUserProfileController } = require('../controllers/userController');
const path = require('path');

// Route for direct file upload

router.put("/update-profile", upload.single("profile_picture"), updateUserProfileController);


module.exports = router; 