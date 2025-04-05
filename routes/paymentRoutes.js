const express = require("express");
const route = express.Router();
const {
  paymentByVnPay,
  paymentReturn,
} = require("../controllers/paymentController");
const { authenticateJWT } = require("../middlewares/auth");


route.post("/create-payment",authenticateJWT, paymentByVnPay);
route.get("/vnpay-return", authenticateJWT,paymentReturn);

module.exports = route;