'use strict';
const {
  Model
} = require('sequelize');
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
    profile_picture: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'user',
  });
  return User;
};