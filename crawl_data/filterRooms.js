// filterRooms.js
const fs = require('fs');

// Đọc dữ liệu từ file đã có tọa độ
const data = JSON.parse(fs.readFileSync('datachungcu.json', 'utf-8'));

// Lọc bỏ các object có latitude hoặc longitude là null
const filteredData = data.filter(room => room.latitude !== null && room.longitude !== null);

// Ghi dữ liệu đã lọc vào file mới
fs.writeFileSync('datachungcu.json', JSON.stringify(filteredData, null, 2), 'utf-8');

console.log(`Đã lọc xong. Số lượng phòng còn lại: ${filteredData.length}`);