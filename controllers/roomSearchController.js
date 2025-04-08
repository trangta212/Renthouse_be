require("dotenv").config();
const { getFilteredRooms } = require("../queries/roomSearchQuery");

const roomSearchController = async (req, res) => {
  try {
    const { location, type, priceRange, area } = req.params;
    const { q } = req.query;

    const rooms = await getFilteredRooms({ location, type, priceRange, area, q });
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Lỗi khi lọc phòng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { roomSearchController };