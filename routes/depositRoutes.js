const express = require("express");
const router = express.Router();
const {
    getDepositController
} = require("../controllers/depositController");
const { authenticateJWT } = require('../middlewares/auth'); 


// Route để tạo deposit mới
router.post("/create-deposit",authenticateJWT, getDepositController);
module.exports = router; 