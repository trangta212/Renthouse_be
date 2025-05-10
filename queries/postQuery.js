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
    // Tìm RentPost để xác thực quyền và lấy room_id
    const rentPost = await db.RentPost.findOne({
      where: {
        id: postId,
        user_id: userId,
      }
    });

    if (!rentPost) {
      throw new Error('Người dùng không có quyền chỉnh sửa bài đăng này.');
    }

    // Kiểm tra trạng thái của RentPost là 'pending'
    if (rentPost.status !== 'pending') {
      throw new Error('Chỉ các bài đăng có trạng thái "pending" mới được cập nhật.');
    }

    const roomId = rentPost.room_id;

    // Tìm phòng
    const room = await db.Room.findOne({
      where: { id: roomId }
    });

    if (!room) {
      throw new Error('Không tìm thấy phòng.');
    }

    // Cập nhật thông tin phòng nếu có trường cần update
    const roomUpdateData = {};
    if (postData.room_name !== undefined) roomUpdateData.room_name = postData.room_name;
    if (postData.description !== undefined) roomUpdateData.description = postData.description;
    if (postData.price_per_month !== undefined) roomUpdateData.price_per_month = postData.price_per_month;
    if (postData.area !== undefined) roomUpdateData.area = postData.area;
    if (postData.address !== undefined) roomUpdateData.address = postData.address;
    if (postData.type !== undefined) roomUpdateData.type = postData.type;
    if (postData.room_images && postData.room_images.length > 0) roomUpdateData.room_images = postData.room_images;

    await room.update(roomUpdateData);

    // Kiểm tra có tồn tại thông tin tiện ích liên kết không
    if (room.utilities_id) {
      const utilities = await db.Utilities.findOne({
        where: { id: room.utilities_id }
      });

      if (!utilities) {
        throw new Error('Không tìm thấy thông tin tiện ích.');
      }

      // Cập nhật thông tin tiện ích nếu có trường cần update
      const utilitiesUpdateData = {};
      if (postData.electricity_bill !== undefined) utilitiesUpdateData.electricity_bill = postData.electricity_bill;
      if (postData.water_bill !== undefined) utilitiesUpdateData.water_bill = postData.water_bill;
      if (postData.extensions !== undefined) utilitiesUpdateData.extensions = postData.extensions;
      if (postData.full_furnishing !== undefined) utilitiesUpdateData.full_furnishing = postData.full_furnishing;

      await utilities.update(utilitiesUpdateData);
    } else {
      // Nếu không có tiện ích liên kết, có thể xử lý theo yêu cầu của bạn
      console.log('Không có thông tin tiện ích liên kết với phòng.');
      // Bạn có thể chọn tạo tiện ích mới nếu cần
    }

    return { success: true, message: 'Cập nhật thông tin phòng thành công.' };

  } catch (error) {
    console.error('Lỗi cập nhật phòng:', error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  createPost,
  updatePost,
  getPostByUser,
  UpdatePostInformationByUser
};
