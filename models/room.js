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
      User.hasMany(models.FavoriteRoom, {
        foreignKey: 'room_id'
      });
      User.hasMany(models.Review, {
        foreignKey: 'room_id'
      });

    }
  }
  Room.init({
    room_name: DataTypes.STRING,
    description: DataTypes.STRING,
    price_per_month: DataTypes.BIGINT,
    area: DataTypes.INTEGER,
    status: DataTypes.STRING,
    room_images: DataTypes.TEXT,
    rating: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Room',
  });
  return Room;
};