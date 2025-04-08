const { Op } = require('sequelize');
const { Room } = require('../models');

// Hàm chuyển slug thành chuỗi chuẩn để so sánh (vd: ho-chi-minh -> Hồ Chí Minh)
const normalizeLocation = (locationSlug) => {
  return locationSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getFilteredRooms = async ({ location, type, priceRange, area, q }) => {
  const where = {};

  // Xử lý location
  if (location !== 'all') {
    const normalizedLocation = normalizeLocation(location);
    where.address = { [Op.like]: `%${normalizedLocation}%` };
  }

  // Xử lý loại phòng
  if (type !== 'all') {
    where.type = type;
  }

  // Xử lý khoảng giá
  if (priceRange !== 'all') {
    const [minPrice, maxPrice] = priceRange.split('-').map(Number);
    where.price_per_month = { [Op.between]: [minPrice, maxPrice] };
  }

  // Xử lý diện tích
  if (area !== 'all') {
    const [minArea, maxArea] = area.split('-').map(Number);
    where.area = { [Op.between]: [minArea, maxArea] };
  }

  // Tìm kiếm bằng từ khóa (q)
  if (q && q.trim() !== '') {
    where[Op.or] = [
      { room_name: { [Op.like]: `%${q}%` } },
      { description: { [Op.like]: `%${q}%` } },
      {address: { [Op.like]: `%${q}%` } },
        { type: { [Op.like]: `%${q}%` } },
    ];
  }

  // Trả về kết quả phòng lọc theo điều kiện
  return await Room.findAll({
    where,
    include: [
      {
        association: 'RentPost',
        include: ['User'],
      },
    ],
  });
};

module.exports = {
  getFilteredRooms,
};
