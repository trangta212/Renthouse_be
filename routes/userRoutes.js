const express = require("express"); 
const route = express.Router();
const {getUserProfileController} = require("../controllers/userController");
const { authenticateJWT } = require('../middlewares/auth'); 

route.get("/", authenticateJWT,getUserProfileController);

module.exports = route;