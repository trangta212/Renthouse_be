'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // // define association here
      // FavoriteRoom.belongsTo(models.User, {
      //   foreignKey: 'user_id'
      // });
      // FavoriteRoom.belongsTo(models.Room, {
      //   foreignKey: 'room_id'
      // });
    }
  }
  Review.init({
    user_id: DataTypes.INTEGER,
    room_id: DataTypes.INTEGER,
    rating: DataTypes.INTEGER,
    comment: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Review',
    tableName: 'review'
  });
  return Review;
};