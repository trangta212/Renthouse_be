const db = require("../models/index");
 
const getListRoom = async (roomData) => {
  try {
    const existroom = await db.Room.findAll({
      where: {
         status: 'available',
      },
    });
    return existroom; 
  } catch (error) {
    throw error;
  }
}
 
const getRoomById = async (id) => {
  const room = await db.Room.findByPk(id);
  return room;
};

module.exports = {getListRoom , getRoomById};