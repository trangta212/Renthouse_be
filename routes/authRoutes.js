const express = require("express"); 
const route = express.Router();
const { createNewUser } = require("../controllers/authController");
const {checkingLogin} = require("../controllers/authController"); 
route.post("/register", createNewUser);
route.post("/login", checkingLogin);
module.exports = route;