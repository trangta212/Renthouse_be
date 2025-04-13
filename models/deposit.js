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
    }
  }
  Deposit.init({
    user_id: DataTypes.INTEGER,
    post_id: DataTypes.INTEGER,
    deposit_amount: DataTypes.INTEGER,
    deposit_day: DataTypes.STRING,
    status: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Deposit',
    tableName: 'deposit',
  });
  return Deposit;
};