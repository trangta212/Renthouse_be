'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Notification.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Notification.belongsTo(models.Room, {
        foreignKey: 'room_id',
        as: 'room'
      });
      Notification.hasMany(models.Deposit, {
        foreignKey: 'notification_id',
        as: 'deposit'
      });
    }
  }
  Notification.init({
    user_id: DataTypes.INTEGER,
    room_id: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    is_read: DataTypes.BOOLEAN,
    time: DataTypes.DATE,
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notification',
  });
  return Notification;
};