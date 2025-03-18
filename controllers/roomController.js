require("dotenv").config();
const { getListRoom ,getRoomById } = require("../queries/roomQuery");


const getListRoomController = async (req, res) => {
    try {
        const roomData = req.body; // Không cần await
        if (!roomData) {
            return res.status(400).json({ error: "Dữ liệu đầu vào không hợp lệ" });
        }

        const listRoom = await getListRoom(roomData);
        if (!listRoom || listRoom.length === 0) {
            return res.status(400).json({ error: "Không tìm thấy phòng nào" });
        }

        res.status(200).json({
            message: "Danh sách phòng",
            listRoom: listRoom,
        });

    } catch (error) {
        res.status(500).json({ error: "Lỗi server", details: error.message });
    }
};

const getDetailRoomById = async (req, res) => {
    try {
      const roomDetail = await getRoomById(req.params.id);
      if (!roomDetail)
        return res.status(404).json({ message: "Room details not found" });
      res.status(200).json({
        dataRoom: roomDetail,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };
  
module.exports = { getListRoomController, getDetailRoomById };
