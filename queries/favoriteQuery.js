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
    console.error("Error checking room existence:", error);
    throw new Error("Lỗi khi kiểm tra phòng");
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
        include: [
          {
            model: db.Room,
            as: "room",
            attributes: ["id", "room_name", "description", "room_images"], // Các thông tin về phòng cần lấy thêm
          },
        ],
      });
    }

    return favorite;
  } catch (error) {
    console.error("Error adding favorite room:", error);
    throw new Error("Không thể thêm phòng vào danh sách yêu thích");
  }
};


const getFavoriteRooms = async (userId) => {
  try {
    if (!userId) {
      throw new Error("userId là bắt buộc");
    }
    const favoriteRooms = await db.FavoriteRoom.findAll({
      where: { user_id: userId } ,
      attributes: ["id", "user_id", "room_id", "createdAt", "updatedAt"], // Chọn các trường cần trả về
      include: [
        {
          model: db.Room,
          as: "room",
          attributes: ["id", "room_name", "description", "room_images"], // Các thông tin về phòng cần lấy thêm
        },
      ],
    });

    return favoriteRooms;
  } catch (error) {
    console.error("Error fetching favorite rooms:", error);
    throw new Error("Không thể lấy danh sách yêu thích");
  }
}

const removeSelectedFavoriteRooms = async (roomIds, userId) => {
  try {
    if (!Array.isArray(roomIds) || roomIds.length === 0) {
      throw new Error("Danh sách roomIds không hợp lệ");
    }

    const result = await db.FavoriteRoom.destroy({
      where: {
        room_id: roomIds, // Điều kiện xóa: room_id nằm trong danh sách roomIds
        user_id: userId,  // Điều kiện xóa: thuộc về userId
      },
    });

    return result > 0; // Trả về true nếu xóa thành công
  } catch (error) {
    console.error("Error removing selected favorite rooms:", error);
    throw new Error("Không thể xóa các phòng khỏi danh sách yêu thích");
  }
};

module.exports = {
  addFavoriteRoom,
  isRoomExists,
  getFavoriteRooms,
  removeSelectedFavoriteRooms,
};
