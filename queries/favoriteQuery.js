const db = require("../models/index");
/**
 * Thêm phòng vào danh sách yêu thích
 * @param {Object} data - Dữ liệu cần thêm vào bảng Favoriteroom
 * @returns {Promise<Object>} - Trả về thông tin phòng đã được thêm
 */
const isRoomExists = async (roomId) => {
    try {
      const room = await db.Room.findByPk(roomId); // Tìm phòng theo khóa chính
      return !!room; // Trả về true nếu phòng tồn tại, false nếu không
    } catch (error) {
      console.error('Error checking room existence:', error);
      throw new Error('Lỗi khi kiểm tra phòng');
    }
  };


const addFavoriteRoom = async (data) => {
    try {
      const { room_id, user_id } = data;
  
      const [favorite, created] = await db.FavoriteRoom.findOrCreate({
        where: { room_id, user_id },
        defaults: { room_id, user_id },
      });
  
      // Load lại dữ liệu đầy đủ sau khi tạo
      if (created) {
        return await db.FavoriteRoom.findOne({
          where: { id: favorite.id },
          attributes: ["id", "user_id", "room_id", "createdAt", "updatedAt"], // Chọn các trường cần trả về
        });
      }
  
      return favorite;
    } catch (error) {
      console.error("Error adding favorite room:", error);
      throw new Error("Không thể thêm phòng vào danh sách yêu thích");
    }
  };
  
  
  module.exports = {
    addFavoriteRoom,
    isRoomExists
  };