const { addFavoriteRoom, isRoomExists,getFavoriteRooms,removeSelectedFavoriteRooms } = require('../queries/favoriteQuery');

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

const getFavoriteRoomsController = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy userId từ token hoặc request
    const favoriteRooms = await getFavoriteRooms(userId); // Gọi hàm để lấy danh sách yêu thích

    res.status(200).json({
      message: "Lấy danh sách yêu thích thành công",
      favoriteRooms,
    });
  } catch (error) {
    console.error("Error in getFavoriteRoomsController:", error);
    res.status(500).json({ message: "Không thể lấy danh sách yêu thích" });
  }
};

const removeSelectedFavoriteRoomsController = async (req, res) => {
  try {
    const { roomIds } = req.body; // Lấy danh sách roomIds từ body request
    const userId = req.user.id; // Lấy userId từ token hoặc session

    if (!roomIds || !Array.isArray(roomIds) || roomIds.length === 0) {
      return res.status(400).json({ message: "Danh sách roomIds không hợp lệ" });
    }

    const isRemoved = await removeSelectedFavoriteRooms(roomIds, userId);

    if (isRemoved) {
      return res.status(200).json({ message: "Xóa các phòng khỏi danh sách yêu thích thành công" });
    } else {
      return res.status(404).json({ message: "Không tìm thấy các phòng trong danh sách yêu thích" });
    }
  } catch (error) {
    console.error("Error in removeSelectedFavoriteRoomsController:", error);
    return res.status(500).json({ message: "Không thể xóa các phòng khỏi danh sách yêu thích" });
  }
};

module.exports = {
  addFavoriteRoomController,
  isRoomExists,
  getFavoriteRoomsController,
  removeSelectedFavoriteRoomsController
};