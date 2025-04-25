const vnpay = require("../middlewares/vnpayMiddleware");
const crypto = require("crypto");
const https = require('https');



const { ProductCode, VnpLocale } = require("vnpay");
const paymentByVnPay = (req, res) => {
  try {
    const { amount, orderInfo } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Số tiền không hợp lệ" });
    }
    if (!orderInfo) {
      return res.status(400).json({ error: "Thiếu thông tin đơn hàng" });
    }

    // Ghi log dữ liệu đầu vào
    console.log("VNPay Request Payload:", { amount, orderInfo });

    const returnUrl =
      req.body?.returnUrl || process.env.VNPAY_RETURN_URL || "http://localhost:3000/api/v1/payment/vnpay-return";

    // Tạo URL thanh toán
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amount, // Đảm bảo middleware nhân với 100
      vnp_IpAddr:
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip,
      vnp_TxnRef: `ORDER_${Date.now()}_${Math.random().toString(36).substring(2)}`, // Mã duy nhất
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: returnUrl,
      vnp_Locale: VnpLocale.VN,
    });

    // Ghi log URL thanh toán
    console.log("VNPay Payment URL:", paymentUrl);

    return res.json({ paymentUrl });
  } catch (error) {
    console.error("Lỗi VNPay:", error.message, error.stack);
    return res.status(500).json({ error: "Lỗi khi tạo URL thanh toán", details: error.message });
  }
};

const paymentReturn = (req, res) => {
  let verify = {};
  try {
    verify = vnpay.verifyReturrl(req.query);
    if (!verify.isVerified) {
      return res.send("Xác thực tính toàn vẹn dữ liệu không thành công");
    }
    if (!verify.isSuccess) {
      return res.send("Đơn hàng thanh toán không thành công");
    }
  } catch (error) {
    return res.send("Dữ liệu không hợp lệ");
  }

  return res.send("Xác thực URL trả về thành công");
};
const processRefund = async (deposit) => {
  const { transaction_id, transaction_no, amount, created_by, ip_address } = deposit;

  const response = await vnpayRefund({
    transactionId: transaction_id,
    transactionNo: transaction_no,
    amount,
    reason: "Người dùng hủy đặt cọc",
    user: created_by || "admin",
    ip: ip_address || "127.0.0.1",
  });

  return response;
};

const createMomoPayment = (req, res) => {
  const {
    amount,
    orderInfo = "Thanh toán MoMo",
  } = req.body;

  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const redirectUrl = process.env.MOMO_REDIRECT_URL;
  const ipnUrl = process.env.MOMO_IPN_URL;

  const requestType = "captureWallet";
  const orderId = partnerCode + Date.now();
  const requestId = orderId;
  const extraData = "";

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto.createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = JSON.stringify({
    partnerCode,
    partnerName: "RentHouse",
    storeId: "RentHouseStore",
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang: "vi",
    requestType,
    autoCapture: true,
    extraData,
    signature,
  });

  const options = {
    hostname: "test-payment.momo.vn",
    port: 443,
    path: "/v2/gateway/api/create",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
  };

  const momoReq = https.request(options, (momoRes) => {
    momoRes.setEncoding("utf8");
    let data = "";

    momoRes.on("data", (chunk) => {
      data += chunk;
    });

    momoRes.on("end", () => {
      const response = JSON.parse(data);
      if (response.resultCode === 0) {
        res.json(response);
      } else {
        res.status(400).json({ message: "Thanh toán MoMo thất bại", response });
      }
    });
  });

  momoReq.on("error", (e) => {
    console.error(`MoMo request error: ${e.message}`);
    res.status(500).json({ message: "Lỗi khi gọi MoMo", error: e.message });
  });

  momoReq.write(requestBody);
  momoReq.end();
};

// MOMO - IPN (chưa xử lý chi tiết)
const handleMomoIPN = (req, res) => {
  console.log("Nhận IPN từ MoMo:", req.body);
  // TODO: xử lý lưu trạng thái thanh toán tại đây

  return res.status(200).json({ message: "Đã nhận IPN MoMo" });
};
// const paymentReturnByMomo = (req, res) => {
//   try {
//     // Lấy các tham số từ query
//     const {
//       partnerCode,
//       orderId,
//       requestId,
//       amount,
//       orderInfo,
//       orderType,
//       transId,
//       resultCode,
//       message,
//       payType,
//       responseTime,
//       extraData,
//       signature,
//     } = req.query;

//     // Kiểm tra các tham số bắt buộc
//     if (!partnerCode || !orderId || !resultCode || !signature) {
//       return res.status(400).json({ error: "Thiếu tham số bắt buộc" });
//     }

//     // Tạo chuỗi rawSignature để xác thực chữ ký
//     const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData || ""}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

//     // Tạo chữ ký
//     const computedSignature = crypto
//       .createHmac("sha256", process.env.MOMO_SECRET_KEY)
//       .update(rawSignature)
//       .digest("hex");

//     // Xác thực chữ ký
//     if (computedSignature !== signature) {
//       console.error("Chữ ký MoMo không hợp lệ:", { computedSignature, signature });
//       return res.status(400).json({ error: "Chữ ký không hợp lệ" });
//     }

//     // Kiểm tra trạng thái thanh toán
//     if (resultCode === "0") {
//       // Thanh toán thành công
//       // TODO: Lưu trạng thái thanh toán vào database nếu cần
//       // Ví dụ: Lưu { orderId, amount, transId, responseTime, status: "success" }

//       // Giải mã extraData để lấy postId (nếu có)
//       let postId;
//       if (extraData) {
//         try {
//           const decodedExtraData = JSON.parse(Buffer.from(extraData, "base64").toString());
//           postId = decodedExtraData.postId;
//         } catch (decodeError) {
//           console.error("Lỗi decode extraData:", decodeError);
//         }
//       }

//       return res.json({
//         status: "success",
//         message: "Thanh toán thành công",
//         data: {
//           orderId,
//           amount: Number(amount),
//           orderInfo,
//           responseTime,
//           transId,
//           payType,
//           postId,
//         },
//       });
//     } else {
//       // Thanh toán thất bại
//       // TODO: Lưu trạng thái thất bại vào database nếu cần
//       return res.status(400).json({
//         status: "error",
//         message: `Thanh toán thất bại: ${message}`,
//         data: { orderId, resultCode },
//       });
//     }
//   } catch (error) {
//     console.error("Lỗi xử lý MoMo return:", error);
//     return res.status(500).json({ error: "Lỗi server khi xử lý MoMo return" });
//   }
// };
const paymentReturnByMomo = (req, res) => {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.query;

    // Log tất cả tham số
    console.log("Full req.query:", req.query);
    console.log("Required params:", { partnerCode, orderId, resultCode, signature });

    // Kiểm tra tham số bắt buộc
    if (!partnerCode || !orderId || !resultCode || !signature) {
      console.error("Thiếu tham số bắt buộc:", { partnerCode, orderId, resultCode, signature });
      return res.status(400).json({ error: "Thiếu tham số bắt buộc" });
    }

    // Giải mã orderInfo
    const decodedOrderInfo = decodeURIComponent(orderInfo || "");
    console.log("Decoded orderInfo:", decodedOrderInfo);

    // Tạo rawSignature
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData || ""}&message=${message}&orderId=${orderId}&orderInfo=${decodedOrderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    console.log("Raw signature:", rawSignature);

    // Tạo chữ ký
    const computedSignature = crypto
      .createHmac("sha256", process.env.MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest("hex");

    console.log("Computed vs Received signature:", { computedSignature, signature });

    // Xác thực chữ ký
    if (computedSignature !== signature) {
      console.error("Chữ ký MoMo không hợp lệ:", { computedSignature, signature });
      return res.status(400).json({ error: "Chữ ký không hợp lệ" });
    }

    // Kiểm tra trạng thái thanh toán
    if (resultCode === "0") {
      let postId;
      if (extraData) {
        try {
          const decodedExtraData = JSON.parse(Buffer.from(extraData, "base64").toString());
          postId = decodedExtraData.postId;
        } catch (decodeError) {
          console.error("Lỗi decode extraData:", decodeError);
        }
      }

      return res.json({
        status: "success",
        message: "Thanh toán thành công",
        data: {
          orderId,
          amount: Number(amount),
          orderInfo: decodedOrderInfo,
          responseTime,
          transId,
          payType,
          postId,
        },
      });
    } else {
      return res.status(400).json({
        status: "error",
        message: `Thanh toán thất bại: ${message}`,
        data: { orderId, resultCode },
      });
    }
  } catch (error) {
    console.error("Lỗi xử lý MoMo return:", error);
    return res.status(500).json({ error: "Lỗi server khi xử lý MoMo return" });
  }
};

module.exports = { paymentByVnPay, paymentReturn,processRefund,createMomoPayment,
  handleMomoIPN,paymentReturnByMomo};