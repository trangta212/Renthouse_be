require("dotenv").config();
const {
  createUser,
  checkLogin
} = require("../queries/authQuery");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createNewUser = async (req, res) => {
  try {
    const userData = req.body;
    const newUser = await createUser(userData);
    if (newUser.message) {
      return res.status(400).json({ error: newUser.message });
    }
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    res.status(200).json({
      message: "Đăng ký thành công.",
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error:
        error.errors && error.errors.length > 0
          ? error.errors[0].message
          : "Đã có vấn đề xảy ra, vui lòng thử lại sau.",
    });
  }
};
const checkingLogin = async (req, res) => {
  try{
    const userData = req.body;
    const existUser = await checkLogin(userData);
    if (!existUser)
      return res
        .status(400)
        .json({ error: "Không tìm thấy địa chỉ email" });
    const checkPassword = await bcrypt.compare(
      userData.password,
      existUser.password
    );
    if (!checkPassword)
      return res.status(400).json({
        error: "Mật khẩu không đúng",
      });

    const token = jwt.sign(
      { id: existUser.id, role: existUser.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    return res.status(200).json({
      message: "Đăng nhập thành công",
      token: token,
    });
  }catch(error){
    console.log(error);
    res.status(400).json({
      error: error.errors && error.errors.length > 0
        ? error.errors[0].message
        : "Đã có vấn đề xảy ra, vui lòng thử lại sau.",
    });
  }
};
module.exports = { createNewUser, checkingLogin };