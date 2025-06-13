const { Op } = require('sequelize');
const { Room, RentPost, User, Utilities } = require('../models');
const moment = require('moment');

// Hàm chuyển slug thành chuỗi chuẩn để so sánh (vd: ho-chi-minh -> Hồ Chí Minh)
const normalizeLocation = (locationSlug) => {
  const locationMap = {
    'ho-chi-minh': 'Hồ Chí Minh',
    'ha-noi': 'Hà Nội',
    'da-nang': 'Đà Nẵng',
    'hai-phong': 'Hải Phòng',
    'hue': 'Huế',
    'can-tho': 'Cần Thơ',
    'nha-trang': 'Nha Trang',
    'buon-ma-thuot': 'Buôn Ma Thuột',
    'quy-nhon': 'Quy Nhơn',
    'hai-duong': 'Hải Dương',
    'nam-dinh': 'Nam Định',
    'thanh-hoa': 'Thanh Hóa',
    'vung-tau': 'Vũng Tàu',
    'binh-duong': 'Bình Dương',
    'dong-nai': 'Đồng Nai',
    'long-an': 'Long An',
    'tien-giang': 'Tiền Giang',
    'ben-tre': 'Bến Tre',
    'vinh-long': 'Vĩnh Long',
    'soc-trang': 'Sóc Trăng',
    'an-giang': 'An Giang',
    'kien-giang': 'Kiên Giang',
    'ca-mau': 'Cà Mau',
    'bac-lieu': 'Bạc Liêu',
    'tra-vinh': 'Trà Vinh',
    'vinh-phuc': 'Vĩnh Phúc',
    'bac-ninh': 'Bắc Ninh',
    'hai-duong': 'Hải Dương',
    'hung-yen': 'Hưng Yên',
    'thai-binh': 'Thái Bình',
    'ha-nam': 'Hà Nam',
    'nghe-an': 'Nghệ An',
    'ha-tinh': 'Hà Tĩnh',
    'quang-binh': 'Quảng Bình',
    'quang-tri': 'Quảng Trị',
    'thua-thien-hue': 'Thừa Thiên Huế',
    'quang-nam': 'Quảng Nam',
    'quang-ngai': 'Quảng Ngãi',
    'binh-dinh': 'Bình Định',
    'phu-yen': 'Phú Yên',
    'khanh-hoa': 'Khánh Hòa',
    'ninh-thuan': 'Ninh Thuận',
    'binh-thuan': 'Bình Thuận',
    'kon-tum': 'Kon Tum',
    'gia-lai': 'Gia Lai',
    'dak-lak': 'Đắk Lắk',
    'dak-nong': 'Đắk Nông',
    'lam-dong': 'Lâm Đồng',
    'binh-phuoc': 'Bình Phước',
    'tay-ninh': 'Tây Ninh',
    'binh-dinh': 'Bình Định',
    'phu-yen': 'Phú Yên',
    'khanh-hoa': 'Khánh Hòa',
    'ninh-thuan': 'Ninh Thuận',
    'binh-thuan': 'Bình Thuận',
    'kon-tum': 'Kon Tum',
    'gia-lai': 'Gia Lai',
    'dak-lak': 'Đắk Lắk',
    'dak-nong': 'Đắk Nông',
    'lam-dong': 'Lâm Đồng',
    'binh-phuoc': 'Bình Phước',
    'tay-ninh': 'Tây Ninh',
  };

  return locationMap[locationSlug] || locationSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Hàm chuyển đổi type nhà từ slug sang giá trị trong database
const normalizeRoomType = (typeSlug) => {
  const typeMap = {
    'nhatro': 'nhatro',
    'canhodichvu': 'canhodichvu',
    'chungcu': 'chungcu',
    'chungcumini': 'chungcumini',
    'nhanguyencan': 'nhanguyencan',
    'phongtro': 'nhatro',
    'canho': 'chungcu',
  };

  return typeMap[typeSlug] || typeSlug;
};

const getFilteredRooms = async ({ location, type, priceRange, area, q }) => {
  const whereClause = {};
  const today = moment().startOf('day').toDate();

  // Xử lý location
  if (location && location !== 'all') {
    const normalizedLocation = normalizeLocation(location);
    whereClause.address = { [Op.like]: `%${normalizedLocation}%` };
  }

  // Xử lý loại phòng
  if (type && type !== 'all') {
    const normalizedType = normalizeRoomType(type);
    whereClause.type = normalizedType;
  }

  // Xử lý khoảng giá
  if (priceRange && priceRange !== 'all') {
    const [minPrice, maxPrice] = priceRange.split('-').map(Number);
    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
      whereClause.price_per_month = { [Op.between]: [minPrice * 1000000, maxPrice * 1000000] };
    }
  }

  // Xử lý diện tích
  if (area && area !== 'all') {
    const [minArea, maxArea] = area.split('-').map(Number);
    if (!isNaN(minArea) && !isNaN(maxArea)) {
      whereClause.area = { [Op.between]: [minArea, maxArea] };
    }
  }

  // Tìm kiếm bằng từ khóa (q)
  if (q && q.trim() !== '' && q !== 'all') {
    const searchTerm = q.trim();
    whereClause[Op.or] = [
      { room_name: { [Op.like]: `%${searchTerm}%` } },
      { description: { [Op.like]: `%${searchTerm}%` } },
      { address: { [Op.like]: `%${searchTerm}%` } },
      { type: { [Op.like]: `%${searchTerm}%` } },
      { '$Utility.extensions$': { [Op.like]: `%${searchTerm}%` } }
    ];
  }

  // Trả về kết quả phòng lọc theo điều kiện + lọc theo RentPost
  return await Room.findAll({
    where: whereClause,
    include: [
      {
        model: RentPost,
        required: true,
        where: {
          status: 'pending',
          start_date: { [Op.lte]: today },
          expire: { [Op.gte]: today },
        },
        include: [
          {
            model: User,
            attributes: ['id', 'lastName', 'email', 'profile_picture', 'phone_number'],
          },
        ],
      },
      {
        model: Utilities,
        as: 'Utility',
        attributes: ['extensions']
      }
    ],
    order: [[RentPost, 'priority', 'ASC']],
  });
};

module.exports = {
  getFilteredRooms,
};