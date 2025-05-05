const db = require("../models/index");
const sequelize = require('sequelize');

 
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
            attributes: ["id", "lastName", "email","profile_picture"], // Chỉ lấy các thông tin cần thiết
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

const getNearbyRooms = async ({ latitude, longitude, radius }) => {
  return await db.Room.findAll({
    attributes: {
      include: [
        [
          sequelize.literal(`
            6371 * acos(
              cos(radians(${latitude}))
              * cos(radians(latitude))
              * cos(radians(longitude) - radians(${longitude}))
              + sin(radians(${latitude})) * sin(radians(latitude))
            )
          `),
          'distance'
        ]
      ]
    },
    include: [
      {
        model: db.RentPost,
        include: {
          model: db.User,
          attributes: ["id", "lastName", "email", "phone_number"], // Chỉ lấy các thông tin cần thiết
        },
      },
    ],
    having: sequelize.literal(`distance <= ${radius}`),
    order: sequelize.literal('distance ASC')
  });
};

module.exports = {getListRoom , getRoomById, getNearbyRooms};