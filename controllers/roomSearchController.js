require("dotenv").config();
const { getFilteredRooms } = require("../queries/roomSearchQuery");

const roomSearchController = async (req, res) => {
  try {
    const { location, type, priceRange, area } = req.params;
    const { q } = req.query;

    const searchParams = {
      location,
      type,
      priceRange,
      area,
      q
    };

    const rooms = await getFilteredRooms(searchParams);
    res.status(200).json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Error in roomSearchController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = { roomSearchController };