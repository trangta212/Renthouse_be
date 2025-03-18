const fs = require('fs');
const path = require('path');
const { Room } = require('../models');
const sequelize = require('../models').sequelize;

// Đang ở trong thư mục gốc 
const dataFolder = __dirname; // Đường dẫn đến thư mục chứa các file JSON

// Hàm ánh xạ tên file sang type
function getTypeFromFilename(filename) {
    const nameWithoutExt = path.basename(filename, '.json'); // Bỏ phần .json
    if (nameWithoutExt.includes('datacanhodichvu')) return 'canhodichvu';
    if (nameWithoutExt.includes('datachungcu')) return 'chungcu';
    if (nameWithoutExt.includes('datamini')) return 'chungcumini';
    if (nameWithoutExt.includes('datanhanguyencan')) return 'nhanguyencan';
    if (nameWithoutExt.includes('dataphongtro')) return 'phongtro';
    return ''; // Mặc định nếu không khớp
}

// Hàm để lưu dữ liệu từ tất cả file JSON vào database
async function importRooms() {
    try {
        await sequelize.sync(); // Đảm bảo bảng đã tồn tại

        // Lấy danh sách file trong thư mục crawl_data
        const files = fs.readdirSync(dataFolder);

        for (const file of files) {
            const filePath = path.join(dataFolder, file);

            // Kiểm tra nếu file là JSON
            if (path.extname(file) === '.json') {
                const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                const type = getTypeFromFilename(file);
                console.log(`Đang xử lý file: ${file}, type: ${type}`);

                for (const roomData of jsonData) {
                    await Room.create({
                        room_name: roomData.room_name,
                        description: roomData.description.join(' '), 
                        price_per_month: parseFloat(roomData.price_per_month.replace(/[^0-9.]/g, '')),
                        room_images: roomData.room_images,
                        rating: roomData.rating && !isNaN(parseInt(roomData.rating))
                            ? parseInt(roomData.rating)
                            : Math.floor(Math.random() * 5) + 1, 
                        area: roomData.area ? parseInt(roomData.area.replace(/m²/g, '').trim(), 10) : null,
                        status: 'available',
                        type: type ,
                        address: roomData.address.replace(/\s*-\s*Xem bản đồ$/, '') // Xóa "- Xem bản đồ"
                    });
                }
                console.log(`Import dữ liệu từ ${file} thành công!`);
            }
        }

    } catch (error) {
        console.error('Lỗi khi import dữ liệu:', error);
    } finally {
        await sequelize.close();
    }
}

// Gọi hàm import dữ liệu 
module.exports = importRooms;
