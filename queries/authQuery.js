const db = require("../models/index");
const createUser = async (userData) => {
  try {
    const existingUser = await db.User.findOne({
      where: { email: userData.email },
    });
    if (existingUser) {
      return {
        message: "Email already existed",
      };
    }

    const user = await db.User.create(userData);
    return user;
  } catch (error) {
    throw error;
  }
};
const checkLogin = async (userData) => {
     const existUser = await db.User.findOne({
        where: { email: userData.email },
      });
      return existUser;
}

module.exports = {createUser, checkLogin};