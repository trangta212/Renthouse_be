const db = require("../models/index");

const getUserProfile = async (userId) => {
  try {
    console.log('Querying for userId:', userId); // Debug log
    const userProfile = await db.User.findOne({
      where: { id: userId },
      attributes: ["id", "email", "lastName", "phone_number"],
    });
    console.log('Query result:', userProfile); // Debug log
    return userProfile;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  getUserProfile,
};