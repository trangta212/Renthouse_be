const fs = require('fs');

// Đọc file JSON
fs.readFile('roomInfor_filled.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Lỗi khi đọc file:', err);
    return;
  }

  let rooms = JSON.parse(data);

  // Cập nhật trường full_furnishing
  rooms.forEach(room => {
    if (room.full_furnishing === "Đầy đủ nội thất") {
      room.full_furnishing = 1;
    } else if (room.full_furnishing === "Không đầy đủ nội thất") {
      room.full_furnishing = 0;
    }
  });

  // Ghi kết quả vào file mới
  fs.writeFile('updated_data.json', JSON.stringify(rooms, null, 2), 'utf8', err => {
    if (err) {
      console.error('Lỗi khi ghi file:', err);
      return;
    }
    console.log('Đã cập nhật giá trị full_furnishing và lưu vào updated_data.json.');
  });
});
