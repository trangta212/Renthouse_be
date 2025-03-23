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
      RentPost.belongsTo(models.User, { foreignKey: 'user_id' }); 
      RentPost.belongsTo(models.Room, { foreignKey: 'room_id' }); 
    }
  }
  RentPost.init({
    post_id: DataTypes.INTEGER,
    room_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    start_date: DataTypes.DATEONLY,
    expire: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'RentPost',
    tableName: 'rentpost'
  });
  return RentPost;
};