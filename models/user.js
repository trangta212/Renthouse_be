'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.FavoriteRoom, {
        foreignKey: 'user_id'
      });
      User.hasMany(models.Review, {
        foreignKey: 'user_id'
      });
      User.hasMany(models.RentPost, {
         foreignKey: 'user_id'
         }); 
        User.hasMany(models.Message, {
          foreignKey: "senderId",
          as: "sentMessages",
        });
        User.hasMany(models.Message, {
          foreignKey: "receiverId",
          as: "receivedMessages",
        });
      User.hasMany(models.Notification, {
        foreignKey: 'user_id'
      });
      User.hasMany(models.Deposit, {
        foreignKey: 'user_id',
        as: 'deposit'
      });
    }
  }
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    role: DataTypes.STRING,
    phone_number: DataTypes.BIGINT,
    address: DataTypes.STRING,
    profile_picture: DataTypes.TEXT,
    fullNameIndentify: DataTypes.STRING,
    identifyNumber: DataTypes.BIGINT,
    date_of_birth: DataTypes.DATE,
    cccd_images: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'user',
  });
  User.addHook("beforeCreate", async (user) => {
    const saltRounds = 10;
    user.password = await bcrypt.hash(user.password, saltRounds);
  });
  return User;
};