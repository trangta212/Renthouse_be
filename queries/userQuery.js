const db = require("../models/index");

const getUserProfile = async (userId) => {
  try {
    console.log('Querying for userId:', userId); // Debug log
    const userProfile = await db.User.findOne({
      where: { id: userId },
      attributes: ["id", "email", "lastName", "phone_number", "profile_picture"],
    });
    console.log('Query result:', userProfile); // Debug log
    return userProfile;
  } catch (error) {
    throw error;
  }
};

const updateUserProfile = async (userId,userInformation) => {
  try {
    const userProfile = await db.User.findOne({
      where: { id: userId },
    });
    if (!userProfile) {
      throw new Error("User not found");
    }
    await userProfile.update(userInformation);
    return userProfile;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile
};
