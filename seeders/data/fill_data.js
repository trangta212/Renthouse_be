const fs = require('fs');
const path = require('path');
const removeAccents = require('remove-accents');

const inputFilePath = path.join(__dirname, 'updated_data.json');
const outputFilePath = path.join(__dirname, 'grouped_users.json');


async function generateUsersWithRooms() {
  try {
    const rawData = fs.readFileSync(inputFilePath, 'utf-8');
    const rooms = JSON.parse(rawData);

    const usersMap = new Map();

    for (const room of rooms) {
      const lastName = room.lastName || 'unknown';

      if (!usersMap.has(lastName)) {
        const email = removeAccents(lastName)
          .toLowerCase()
          .replace(/\s+/g, '') + '@example.com';


        usersMap.set(lastName, {
          lastName,
          phone_number: room.phone_number || '',
          profile_picture: room.profile_picture || '',
          email,
          password: '12345',
          rooms: []
        });
      }

      // Lấy user hiện tại rồi push phòng
      const user = usersMap.get(lastName);

      // Xóa các trường user trong room
      const {
        lastName: _,
        phone_number,
        profile_picture,
        ...roomOnlyFields
      } = room;

      user.rooms.push(roomOnlyFields);
    }

    // Chuyển Map sang mảng
    const usersArray = Array.from(usersMap.values());

    // Tạo object gốc users
    const outputData = { users: usersArray };

    fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2), 'utf-8');

    console.log(`✅ Đã tạo file '${outputFilePath}' theo cấu trúc users: [...]`);
  } catch (error) {
    console.error('Lỗi:', error);
  }
}

generateUsersWithRooms();
