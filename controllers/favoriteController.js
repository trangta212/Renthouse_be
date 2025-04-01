const { addFavoriteRoom, isRoomExists } = require('../queries/favoriteQuery');

/**
 * Controller để thêm phòng vào danh sách yêu thích
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const addFavoriteRoomController = async (req, res) => {
  try {
    const { roomIds } = req.body; // Lấy roomId từ body của request
    const userId = req.user.id; // Lấy userId từ token (middleware xác thực)

    if (!roomIds) {
      return res.status(400).json({ message: 'roomId là bắt buộc' });
    }

    const favoriteRooms = [];
    for (const roomId of roomIds) {
    const roomExists = await isRoomExists(roomId);
        if (!roomExists) {
          return res.status(404).json({ message: `Phòng với id ${roomId} không tồn tại` });
        }

      const favorite = await addFavoriteRoom({ room_id: roomId, user_id: userId });
      favoriteRooms.push(favorite);
    }

    res.status(201).json({
      message: 'Phòng đã được thêm vào danh sách yêu thích',
      favoriteRooms,
    });
  } catch (error) {
    console.error('Error in addFavoriteRoomController:', error);
    res.status(500).json({ message: 'Lỗi khi thêm phòng vào danh sách yêu thích' });
  }
};

module.exports = {
  addFavoriteRoomController,
  isRoomExists
};