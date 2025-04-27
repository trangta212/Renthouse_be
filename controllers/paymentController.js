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
  try {
    const { payment_method, trans_id, order_id, partnerCode, deposit_amount } = deposit;

    console.log("Dữ liệu deposit gửi vào processRefund:", {
      payment_method,
      trans_id,
      order_id,
      partnerCode,
      deposit_amount,
    });

    if (payment_method === "momo") {
      const refundResponse = await momoRefund({
        trans_id, // 3300750913
        order_id, // MOMO1745571997570
        partnerCode, // MOMO
        deposit_amount, // 500000
      });

      if (refundResponse.success) {
        console.log("✅ Hoàn tiền MoMo thành công:", refundResponse);
        return {
          success: true,
          message: "Hoàn tiền thành công",
          refund_id: refundResponse.refundId,
        };
      } else {
        console.error("❌ Hoàn tiền MoMo thất bại:", refundResponse);
        return {
          success: false,
          message: refundResponse.message || "Hoàn tiền thất bại",
          error: refundResponse.message,
        };
      }
    } else if (payment_method === "vnpay") {
      const refundResponse = await vnpayRefund({
        transactionId: trans_id,
        amount: deposit_amount,
        reason: "Chủ trọ từ chối đặt cọc",
      });

      if (refundResponse.success) {
        console.log("✅ Hoàn tiền VNPay thành công:", refundResponse);
        return {
          success: true,
          message: "Hoàn tiền thành công",
          refund_id: refundResponse.refundId,
        };
      } else {
        console.error("❌ Hoàn tiền VNPay thất bại:", refundResponse);
        return {
          success: false,
          message: refundResponse.message || "Hoàn tiền thất bại",
          error: refundResponse.message,
        };
      }
    } else {
      return {
        success: false,
        message: "Phương thức thanh toán không được hỗ trợ hoàn tiền",
      };
    }
  } catch (error) {
    console.error("❌ Lỗi khi hoàn tiền:", error);
    return {
      success: false,
      message: "Lỗi hệ thống khi hoàn tiền",
      error: error.message,
    };
  }
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

const momoRefund = async (refundData) => {
  try {
    const { trans_id, order_id, partnerCode, deposit_amount } = refundData;

    // Kiểm tra dữ liệu đầu vào
    if (!trans_id || !order_id || !partnerCode || deposit_amount == null) {
      throw new Error("Thiếu các trường bắt buộc: trans_id, order_id, partnerCode, deposit_amount");
    }

    // Kiểm tra trans_id là số nguyên hợp lệ
    if (isNaN(trans_id) || !Number.isInteger(Number(trans_id))) {
      throw new Error("trans_id phải là số nguyên hợp lệ");
    }
    const transIdNumber = Number(trans_id); // Đảm bảo là số

    // Kiểm tra deposit_amount là số nguyên hợp lệ và lớn hơn 0
    if (isNaN(deposit_amount) || !Number.isInteger(Number(deposit_amount)) || deposit_amount <= 0) {
      throw new Error("deposit_amount phải là số nguyên hợp lệ và lớn hơn 0");
    }

    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;

    // Tạo orderId mới cho yêu cầu hoàn tiền
    const refundOrderId = `${partnerCode}_REFUND_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    // Tạo requestId mới để đảm bảo tính duy nhất
    const refundRequestId = `${partnerCode}_REFUND_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Hardcode reason (có thể thay bằng logic lấy từ database nếu cần)
    const reason = "Chủ trọ từ chối đặt cọc";

    // Tạo rawSignature theo đúng thứ tự của MoMo
    const rawSignature = `accessKey=${accessKey}&amount=${deposit_amount}&description=${reason}&orderId=${refundOrderId}&partnerCode=${partnerCode}&requestId=${refundRequestId}&transId=${transIdNumber}`;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = JSON.stringify({
      partnerCode,
      orderId: refundOrderId, // Sử dụng orderId mới
      requestId: refundRequestId, // requestId mới
      amount: parseInt(deposit_amount), // Sử dụng deposit_amount
      transId: transIdNumber, // transId là số nguyên
      lang: "vi",
      description: reason,
      signature,
    });

    console.log("MoMo refund payload:", JSON.parse(requestBody));

    const options = {
      hostname: "test-payment.momo.vn",
      port: 443,
      path: "/v2/gateway/api/refund",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
      },
    };

    return new Promise((resolve, reject) => {
      const momoReq = https.request(options, (momoRes) => {
        momoRes.setEncoding("utf8");
        let data = "";

        momoRes.on("data", (chunk) => {
          data += chunk;
        });

        momoRes.on("end", () => {
          try {
            const response = JSON.parse(data);
            console.log("Momo refund response:", response);

            if (response.resultCode === 0) {
              resolve({
                success: true,
                message: "Hoàn tiền thành công",
                refundId: response.transId,
              });
            } else {
              resolve({
                success: false,
                message: response.message || "Hoàn tiền thất bại",
                errorCode: response.resultCode,
              });
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      momoReq.on("error", (error) => {
        console.error("Momo refund error:", error);
        reject(error);
      });

      momoReq.write(requestBody);
      momoReq.end();
    });
  } catch (error) {
    console.error("Error in momoRefund:", error);
    return {
      success: false,
      message: "Lỗi khi gọi API hoàn tiền MoMo",
      error: error.message,
    };
  }
};


module.exports = { paymentByVnPay, paymentReturn,processRefund,createMomoPayment,
  handleMomoIPN,paymentReturnByMomo,momoRefund};