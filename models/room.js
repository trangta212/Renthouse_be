'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // User.hasMany(models.FavoriteRoom, {
      //   foreignKey: 'room_id'
      // });
      // User.hasMany(models.Review, {
      //   foreignKey: 'room_id'
      // });
      Room.hasMany(models.RentPost, {
        foreignKey: 'room_id'
      });
    }
  }
  Room.init({
    room_name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price_per_month: DataTypes.FLOAT,
    area: DataTypes.INTEGER,
    status: DataTypes.STRING,
    room_images: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('room_images');
        // Nếu rawValue không tồn tại hoặc là chuỗi rỗng, trả về mảng rỗng
        if (!rawValue) return [];
        try {
          return JSON.parse(rawValue);
        } catch (error) {
          // Nếu xảy ra lỗi khi parse, trả về mảng rỗng để tránh crash
          return [];
        }
      },
      set(value) {
        this.setDataValue('room_images', JSON.stringify(value));
      }
    }
    ,    
    rating: DataTypes.INTEGER,
    type: DataTypes.STRING,
    address : DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Room',
    tableName: 'room'
  });
  return Room;
};