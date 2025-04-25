const express = require("express");
const route = express.Router();
const {
  paymentByVnPay,
  paymentReturn,
  createMomoPayment,
  paymentReturnByMomo
} = require("../controllers/paymentController");
const { authenticateJWT } = require("../middlewares/auth");


route.post("/create-payment",authenticateJWT, paymentByVnPay);
route.get("/vnpay-return", authenticateJWT,paymentReturn);
route.post("/momo/create", authenticateJWT,createMomoPayment);
route.get("/momo-return",authenticateJWT ,paymentReturnByMomo); // Route mới

module.exports = route;