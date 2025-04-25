require('dotenv').config();

module.exports = {
  partnerCode: process.env.MOMO_PARTNER_CODE,
  accessKey: process.env.MOMO_ACCESS_KEY,
  secretKey: process.env.MOMO_SECRET_KEY,
  redirectUrl: process.env.MOMO_REDIRECT_URL,
  ipnUrl: process.env.MOMO_IPN_URL,
  requestType: process.env.MOMO_REQUEST_TYPE,
  endpoint: process.env.MOMO_ENDPOINT,
};
