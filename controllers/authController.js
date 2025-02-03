require("dotenv").config();
const {
  createUser,
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
      message: "登録が成功しました。",
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error:
        error.errors && error.errors.length > 0
          ? error.errors[0].message
          : "問題が発生しました。",
    });
  }
};
module.exports = { createNewUser };