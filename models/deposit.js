'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Deposit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Deposit.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Deposit.belongsTo(models.RentPost, {
        foreignKey: 'post_id',
        as: 'rentPost'
      });
      Deposit.belongsTo(models.Notification, {
        foreignKey: 'notification_id',
        as: 'notification'
      });
    }
  }
  Deposit.init({
    user_id: DataTypes.INTEGER,
    post_id: DataTypes.INTEGER,
    deposit_amount: DataTypes.INTEGER,
    deposit_day: DataTypes.STRING,
    status: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    notification_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Notification', // Tên bảng Notifications
        key: 'id', // Khóa chính của bảng Notifications
      },
      allowNull: true, // Cho phép null vì không phải lúc nào cũng có thông báo
    },
  }, {
    sequelize,
    modelName: 'Deposit',
    tableName: 'deposit',
  });
  return Deposit;
};