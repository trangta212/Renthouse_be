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
      // address,
      room_images = [],
    } = postData;
console.log("📦 Post postData:", postData)
    const result = await db.sequelize.transaction(async (t) => {
      let user = await db.User.findOne({ where: { email }, transaction: t });

      if (!user) {
        // Nếu không tìm thấy user, tạo mới
        user = await db.User.create(
          {
            email,
            lastName,
            phone_number,
            password: "123456",
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
          // address,
          room_images
        },
        { transaction: t }
      );

      // 3. Tạo bài đăng
      const post = await db.RentPost.create(
        {
          user_id: user.id,
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
      // address,
      status,
      room_images,
      start_date,
      expire,
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
        // address ||
        room_images
      ) {
        await db.Room.update(
          {
            room_name: room_name || post.Room.room_name,
            description: description || post.Room.description,
            price_per_month: price_per_month || post.Room.price_per_month,
            type: type || post.Room.type,
            area: area || post.Room.area,
            // address: address || post.Room.address,
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
      if ((status, start_date, expire)) {
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
              // "address",
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
  updatePost,
  //   getPostDetails,
  //   getUserPosts,
};
