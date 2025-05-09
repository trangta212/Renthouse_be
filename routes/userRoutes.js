const express = require("express"); 
const route = express.Router();
const {getUserProfileController,updateUserProfileController} = require("../controllers/userController");
const { authenticateJWT } = require('../middlewares/auth'); 
const upload = require("../middlewares/uploadMiddleware");

route.get("/", authenticateJWT,getUserProfileController);
route.put("/update-profile", authenticateJWT,upload.single("profile_picture"),updateUserProfileController);

module.exports = route;
