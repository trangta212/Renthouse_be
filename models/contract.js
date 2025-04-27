'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contract extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Contract.belongsTo(models.Deposit, {
        foreignKey: 'deposit_id',
        as: 'deposit',
      });
      Contract.belongsTo(models.RentPost, {
        foreignKey: 'post_id',
      });
    }
  }
  Contract.init({
    deposit_id: DataTypes.INTEGER,
    post_id: DataTypes.INTEGER,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    contract_file: DataTypes.TEXT,
    created_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Contract',
    tableName: 'contract',

  });
  return Contract;
};
