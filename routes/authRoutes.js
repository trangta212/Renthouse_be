const express = require("express"); 
const route = express.Router();
const { createNewUser } = require("../controllers/authController");
route.post("/register", createNewUser);
module.exports = route;