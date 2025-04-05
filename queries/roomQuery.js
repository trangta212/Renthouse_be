const db = require("../models/index");
 
const getListRoom = async (roomData) => {
  try {
    const existroom = await db.Room.findAll({
      where: {
         status: 'available',
      },
      include: [
        {
          model: db.RentPost,
          include: {
            model: db.User,
            attributes: ["id", "lastName", "email"], // Chỉ lấy các thông tin cần thiết
          },
        },
      ],
    });
    return existroom; 
  } catch (error) {
    throw error;
  }
}
 
const getRoomById = async (id) => {
  try {
    const room = await db.Room.findOne({
      where: { id: id },
      include: {
        model: db.RentPost,
        include: {
          model: db.User,
          attributes: ["id", "lastName", "email","phone_number"], // Chỉ lấy các thông tin cần thiết
        },
      },
    });

    if (!room) {
      console.log("Room not found");
      return null;
    }

    console.log("Room:", room);
    return room;
  } catch (error) {
    console.error("Error fetching room with user:", error);
  }
};



module.exports = {getListRoom , getRoomById};