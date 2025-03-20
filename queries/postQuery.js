const db = require("../models/index");

const createPost = async (postData) => {
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
      } = postData;
  
      const result = await db.sequelize.transaction(async (t) => {
        let user = await db.User.findOne({ where: { email }, transaction: t });
  
        if (!user) {
          // Nếu không tìm thấy user, tạo mới
          user = await db.User.create(
            {
              email,
              lastName,
              phone_number,
              password :"123456",
            },
            { transaction: t }
          );
        } else {
          // Nếu đã có user, cập nhật thông tin
          await db.User.update(
            {
              lastName,
              phone_number,
              updated_at: new Date(),
            },
            { where: { id: user.id }, transaction: t }
          );
        }
  
        // 2. Tạo phòng mới
        const room = await db.Room.create(
          {
            room_name,
            description,
            price_per_month,
            type,
            area,
            address,
          },
          { transaction: t }
        );
  
        // 3. Tạo bài đăng
        const post = await db.RentPost.create(
          {
            user_id: user.id, // Gán user_id từ user đã tìm hoặc tạo mới
            room_id: room.id,
            status: "active",
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

// // Query để lấy thông tin post với đầy đủ thông tin liên quan
// const getPostDetails = async (postId) => {
//   try {
//     const post = await db.RentPost.findOne({
//       where: { id: postId },
//       include: [
//         {
//           model: db.User,
//           attributes: ["id", "email", "lastName", "phone_number"],
//         },
//         {
//           model: db.Room,
//           attributes: [
//             "id",
//             "room_name",
//             "description",
//             "price_per_month",
//             "type",
//             "area",
//             "address",
//           ],
//         },
//       ],
//     });

//     return post;
//   } catch (error) {
//     console.error("Error getting post details:", error);
//     throw error;
//   }
// };

// // Query để lấy danh sách posts của một user
// const getUserPosts = async (userId) => {
//   try {
//     const posts = await db.RentPost.findAll({
//       where: { user_id: userId },
//       include: [
//         {
//           model: db.Room,
//           attributes: [
//             "room_name",
//             "description",
//             "price_per_month",
//             "type",
//             "area",
//             "address",
//           ],
//         },
//       ],
//       order: [["created_at", "DESC"]],
//     });

//     return posts;
//   } catch (error) {
//     console.error("Error getting user posts:", error);
//     throw error;
//   }
// };

module.exports = {
  createPost,
//   getPostDetails,
//   getUserPosts,
};
