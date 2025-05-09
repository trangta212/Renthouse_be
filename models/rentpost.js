'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RentPost extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RentPost.belongsTo(models.User, { foreignKey: 'user_id' }); // Khóa ngoại trong bảng RentPost
      RentPost.belongsTo(models.Room, { foreignKey: 'room_id'}); // Khóa ngoại trong bảng RentPost
      RentPost.hasOne(models.Deposit, {
        foreignKey: 'post_id', // Khóa ngoại trong bảng Deposit
        as: 'deposit' // Alias để truy vấn khi tìm Deposit từ RentPost
      });
      RentPost.hasOne(models.Contract, {
        foreignKey: 'post_id', // Khóa ngoại trong bảng Contract
      });
    }
  }
  RentPost.init({
    post_id: DataTypes.INTEGER,
    room_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    start_date: DataTypes.DATEONLY,
    expire: DataTypes.DATEONLY,
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending", // Giá trị mặc định cho bản ghi mới
    },
    priority: {
      type: DataTypes.STRING,  // Dạng chuỗi
    }
  }, {
    sequelize,
    modelName: 'RentPost',
    tableName: 'rentpost'
  });
  return RentPost;
};