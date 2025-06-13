'use strict';

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const inputFilePath = path.join(__dirname, '/data/grouped_users.json'); // chỉnh lại đường dẫn đúng với file JSON

module.exports = {
  async up(queryInterface, Sequelize) {
    // đọc dữ liệu từ file JSON
    const rawData = fs.readFileSync(inputFilePath, 'utf-8');
    const data = JSON.parse(rawData);

    // Lặp tạo dữ liệu theo từng bảng qua queryInterface.bulkInsert

    // Tuy nhiên do bạn tạo quan hệ phức tạp (User, Utilities, Room, RentPost) và cần lấy id mới,
    // bạn phải gọi models trực tiếp hoặc chia nhỏ seeder.

    // Giải pháp: Dùng db models trực tiếp để tạo dữ liệu (thường trong seeders cũng được)
    const db = require('../models');

    for (const userData of data.users) {
      // Tạo user
      const user = await db.User.create({
        lastName: userData.lastName,
        phone_number: userData.phone_number,
        profile_picture: userData.profile_picture,
        email: userData.email,
        password: userData.password, // đã hash trong JSON
      });

      // Tạo utilities và rooms cho user
      for (const roomData of userData.rooms) {
        const utilities = await db.Utilities.create({
          electricity_bill: roomData.electricity_bill,
          water_bill: roomData.water_bill,
          extensions: JSON.stringify(roomData.extensions),
          full_furnishing: roomData.full_furnishing,
        });

        const room = await db.Room.create({
          room_name: roomData.room_name,
          room_images: roomData.room_images || [],
          address: roomData.address,
          price_per_month: roomData.price_per_month,
          area: roomData.area,
          description: Array.isArray(roomData.description) 
          ? roomData.description.join('\n') 
          : roomData.description,
          latitude: roomData.latitude,
          longitude: roomData.longitude,
          type: roomData.type,
          utilities_id: utilities.id,
        });

        await db.RentPost.create({
          user_id: user.id,
          room_id: room.id,
          start_date: roomData.start_date,
          expire: roomData.expire,
        });
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const db = require('../models');
  
    // Xóa dữ liệu theo thứ tự tránh lỗi ràng buộc
    await db.RentPost.destroy({ where: {}, force: true });
    await db.Room.destroy({ where: {}, force: true });
    await db.Utilities.destroy({ where: {}, force: true });
    await db.User.destroy({ where: {}, force: true });
  }  
};
