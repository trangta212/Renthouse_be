const db = require("../models/index");
const { Op } = require("sequelize");


const createPost = async (postData, userId) => {
  try {
    const {
      fullNameIndentify,
      identifyNumber,
      date_of_birth,
      phone_number,
      electricity_bill,
      water_bill,
      extensions,
      full_furnishing,
      room_name,
      description,
      price_per_month,
      type,
      area,
      address,
      user_address,
      room_images,
      start_date,
      expire,
      priority,
      latitude,
      longitude,
      start_date_contract,
      end_date_contract,
      date_cccd
    } = postData;

    console.log("📦 Post postData:", postData);

    const result = await db.sequelize.transaction(async (t) => {
      // 1. Cập nhật/thêm thông tin người dùng
      let user = await db.User.findOne({ where: { id: userId }, transaction: t });

      if (!user) {
        user = await db.User.create(
          {
            fullNameIndentify:fullNameIndentify,
            identifyNumber:identifyNumber,
            date_of_birth:date_of_birth,
            address: user_address,
            phone_number:phone_number,
            password: "123456",
            date_cccd:date_cccd
          },
          { transaction: t }
        );
      } else {
        await db.User.update(
          {
            fullNameIndentify:fullNameIndentify,
            identifyNumber:identifyNumber,
            date_of_birth:date_of_birth,
            address: user_address,
            phone_number:phone_number,
            date_cccd:date_cccd,
            updated_at: new Date(),
          },
          { where: { id: userId }, transaction: t }
        );
      }

      // 2. Tạo utilities
      const utilities = await db.Utilities.create(
        {
          electricity_bill,
          water_bill,
          extensions,
          full_furnishing,
        },
        { transaction: t }
      );

      // 3. Tạo room và gán utilities_id
      const room = await db.Room.create(
        {
          room_name,
          description,
          price_per_month,
          type,
          area,
          address,
          room_images,
          latitude,
          longitude,
          utilities_id: utilities.id,
        },
        { transaction: t }
      );

      // 4. Tạo bài đăng
      const post = await db.RentPost.create(
        {
          user_id: userId,
          room_id: room.id,
          status: "pending",
          start_date: start_date,
          expire: expire,
          start_date_contract:start_date_contract,
          end_date_contract:end_date_contract,
          priority: priority,
          created_at: new Date(),
          updated_at: new Date(),
        },
        { transaction: t }
      );

      return {
        post,
        room,
        user,
        message: "Post created successfully",
      };
    });

    return result;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

const updatePost = async (id, postData) => {
  try {
    const {
      email,
      lastName,
      phone_number,
      room_name,
      description,
      price_per_month,
      type,
      area,
      address,
      status,
      room_images,
      start_date,
      expire
    } = postData;
    console.log("📦 Received postData:", postData);

    const result = await db.sequelize.transaction(async (t) => {
      // 1. Tìm post cần update
      const post = await db.RentPost.findByPk(id, {
        include: [
          {
            model: db.User,
            attributes: ["id", "email"],
          },
          {
            model: db.Room,
            attributes: ["id"],
          },
        ],
        transaction: t,
      });

      if (!post) {
        throw new Error("Post not found");
      }

      // 2. Update thông tin user nếu có thay đổi
      if (email || lastName || phone_number) {
        await db.User.update(
          {
            email: email || post.User.email,
            lastName: lastName || post.User.lastName,
            phone_number: phone_number || post.User.phone_number,
            updated_at: new Date(),
          },
          {
            where: { id: post.User.id },
            transaction: t,
          }
        );
      }

      // 3. Update thông tin room nếu có thay đổi
      if (
        room_name ||
        description ||
        price_per_month ||
        type ||
        area ||
        address ||
        room_images
      ) {
        await db.Room.update(
          {
            room_name: room_name || post.Room.room_name,
            description: description || post.Room.description,
            price_per_month: price_per_month || post.Room.price_per_month,
            type: type || post.Room.type,
            area: area || post.Room.area,
            address: address || post.Room.address,
            room_images: room_images || post.Room.room_images,
            updated_at: new Date(),
          },
          {
            where: { id: post.Room.id },
            transaction: t,
          }
        );
      }
      console.log(room_images);
      // 4. Update status của post nếu có
      if ((status || start_date || expire)) {
        await db.RentPost.update(
          {
            status,
            start_date,
            expire,
            updated_at: new Date(),
          },
          {
            where: { id },
            transaction: t,
          }
        );
      }

      // 5. Lấy thông tin post đã update
      const updatedPost = await db.RentPost.findByPk(id, {
        include: [
          {
            model: db.User,
            attributes: ["id", "email", "lastName", "phone_number"],
          },
          {
            model: db.Room,
            attributes: [
              "id",
              "room_name",
              "description",
              "price_per_month",
              "type",
              "area",
              "address",
              "room_images",
            ],
          },
        ],
        transaction: t,
      });
      return {
        post: updatedPost,
        message: "Post updated successfully",
      };
    });

    return result;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};
 const getPostByUser = async (userId) => {
  try {
    const posts = await db.RentPost.findAll({
      where: { user_id: userId },
      include: [
        {
          model: db.User,
          attributes: ["id", "email", "lastName", "phone_number"],
        },
        {
          model: db.Room,
          attributes: [
            "id",
            "room_name",
            "description",
            "price_per_month",
            "type",
            "area",
            "address",
            "room_images",
          ],
        },
      ],
    });
    const postSum = posts.length;

    const today = new Date();

    // Đếm số bài còn hạn (ngày hiện tại nằm giữa start_date và expire)
    const activePosts = posts.filter((post) => {
      const startDate = new Date(post.start_date);
      const expireDate = new Date(post.expire);
      return today >= startDate && today <= expireDate;
    });

    const activePostCount = activePosts.length;
    const expiredPostCount = postSum - activePostCount;

    return { posts, postSum, activePostCount, expiredPostCount };
  } catch (error) {
    console.error("Error fetching posts by user:", error);
    throw error;
  }
 }
const UpdatePostInformationByUser = async (userId, postId, postData) => {
  try {
    console.log('Debug - User ID:', userId);
    console.log('Debug - Room ID:', postId);

    // Tìm RentPost dựa trên room_id và user_id
    const rentPost = await db.RentPost.findOne({
      where: {
        room_id: postId,
        user_id: userId,
      }
    });

    console.log('Debug - Found RentPost:', rentPost ? {
      id: rentPost.id,
      room_id: rentPost.room_id,
      user_id: rentPost.user_id,
      status: rentPost.status
    } : 'Not found');

    if (!rentPost) {
      throw new Error('Người dùng không có quyền chỉnh sửa bài đăng này.');
    }

    // Kiểm tra trạng thái bài đăng
    if (rentPost.status !== 'pending') {
      throw new Error('Chỉ các bài đăng có trạng thái "pending" mới được cập nhật.');
    }

    const roomId = rentPost.room_id;

    // Tìm phòng
    const room = await db.Room.findOne({ where: { id: roomId } });
    if (!room) {
      throw new Error('Không tìm thấy phòng.');
    }

    // Cập nhật thông tin phòng
    const roomUpdateData = {};
    if (postData.room_name !== undefined) roomUpdateData.room_name = postData.room_name;
    if (postData.description !== undefined) roomUpdateData.description = postData.description;
    if (postData.price_per_month !== undefined) roomUpdateData.price_per_month = postData.price_per_month;
    if (postData.area !== undefined) roomUpdateData.area = postData.area;
    if (postData.address !== undefined) roomUpdateData.address = postData.address;
    if (postData.type !== undefined) roomUpdateData.type = postData.type;
    if (postData.room_images && postData.room_images.length > 0) roomUpdateData.room_images = postData.room_images;

    await room.update(roomUpdateData);

    // Cập nhật tiện ích nếu có
    if (room.utilities_id) {
      const utilities = await db.Utilities.findOne({ where: { id: room.utilities_id } });
      if (!utilities) {
        throw new Error('Không tìm thấy thông tin tiện ích.');
      }

      // Chuẩn bị dữ liệu update tiện ích
      const utilitiesUpdateData = {};

      if (
        postData.electricity_bill !== undefined &&
        postData.electricity_bill !== null &&
        postData.electricity_bill !== 'undefined'
      ) {
        utilitiesUpdateData.electricity_bill = Number(postData.electricity_bill);
      }

      if (
        postData.water_bill !== undefined &&
        postData.water_bill !== null &&
        postData.water_bill !== 'undefined'
      ) {
        utilitiesUpdateData.water_bill = Number(postData.water_bill);
      }

      if (
        postData.extensions !== undefined &&
        postData.extensions !== null &&
        postData.extensions !== 'undefined'
      ) {
        utilitiesUpdateData.extensions = Number(postData.extensions);
      }

      if (
        postData.full_furnishing !== undefined &&
        postData.full_furnishing !== null &&
        postData.full_furnishing !== 'undefined'
      ) {
        utilitiesUpdateData.full_furnishing = postData.full_furnishing ? 1 : 0;
      }

      if (Object.keys(utilitiesUpdateData).length > 0) {
        await utilities.update(utilitiesUpdateData);
      } else {
        console.log("Không có dữ liệu tiện ích nào hợp lệ để cập nhật.");
      }

    } else {
      console.log('Không có thông tin tiện ích liên kết với phòng.');
    }

    return { success: true, message: 'Cập nhật thông tin phòng thành công.' };

  } catch (error) {
    console.error('Lỗi cập nhật phòng:', error);
    return { success: false, message: error.message };
  }
};

const getMonthlyPostCount = async (userId) => {
  try {
    const posts = await db.RentPost.findAll({
      where: { user_id: userId },
      include: [
        {
          model: db.User,
          attributes: ["id", "email", "lastName", "phone_number"],
        },
        {
          model: db.Room,
          attributes: [
            "id",
            "room_name",
            "description",
            "price_per_month",
            "type",
            "area",
            "address",
            "room_images",
          ],
        },
      ],
    });

    // Initialize an object to store the count of posts for each month
    const monthlyPostCount = {};

    // Iterate through each post
    posts.forEach((post) => {
      if (!post.start_date || !post.expire) return; // Skip if dates are missing

      const startDate = new Date(post.start_date);
      const expireDate = new Date(post.expire);

      // Skip if dates are invalid
      if (isNaN(startDate.getTime()) || isNaN(expireDate.getTime())) return;

      // Iterate through each month between start_date and expire
      const currentDate = new Date(startDate);
      while (currentDate <= expireDate) {
        const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        monthlyPostCount[monthKey] = (monthlyPostCount[monthKey] || 0) + 1;
        
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    });

    // Sort months chronologically
    const sortedMonths = Object.entries(monthlyPostCount)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    return { monthlyPostCount: sortedMonths };
  } catch (error) {
    console.error("Error fetching monthly post count:", error);
    throw error;
  }
};

const deletePost = async (userId, roomId) => {
  try {
    console.log('Debug - User ID:', userId);
    console.log('Debug - Room ID:', roomId);

    // Tìm RentPost dựa trên room_id và user_id
    const rentPost = await db.RentPost.findOne({
      where: {
        room_id: roomId,
        user_id: userId,
      },
      include: [
        {
          model: db.Room,
          attributes: ['id', 'utilities_id']
        }
      ]
    });

    console.log('Debug - Found RentPost:', rentPost ? {
      id: rentPost.id,
      room_id: rentPost.room_id,
      user_id: rentPost.user_id,
      status: rentPost.status
    } : 'Not found');

    if (!rentPost) {
      throw new Error('Người dùng không có quyền xóa bài đăng này.');
    }

    // Kiểm tra trạng thái bài đăng
    if (rentPost.status !== 'pending') {
      throw new Error('Chỉ các bài đăng có trạng thái "pending" mới được xóa.');
    }

    const result = await db.sequelize.transaction(async (t) => {
      // 1. Xóa RentPost
      await db.RentPost.destroy({
        where: { room_id: roomId },
        transaction: t
      });

      // 2. Xóa Room
      if (rentPost.Room) {
        await db.Room.destroy({
          where: { id: roomId },
          transaction: t
        });

        // 3. Xóa Utilities nếu có
        if (rentPost.Room.utilities_id) {
          await db.Utilities.destroy({
            where: { id: rentPost.Room.utilities_id },
            transaction: t
          });
        }
      }

      return { success: true, message: 'Xóa bài đăng thành công.' };
    });

    return result;

  } catch (error) {
    console.error('Lỗi xóa bài đăng:', error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  createPost,
  updatePost,
  getPostByUser,
  UpdatePostInformationByUser,
  getMonthlyPostCount,
  deletePost
};
