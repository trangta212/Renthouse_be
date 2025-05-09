'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Utilities extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Utilities.hasOne(models.Room, {
        foreignKey: 'utilities_id',  // cột FK trong bảng Room
      });
    }
  }
  
  Utilities.init({
    electricity_bill: DataTypes.INTEGER,
    water_bill: DataTypes.INTEGER,
    extensions: DataTypes.TEXT,
    full_furnishing: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Utilities',
    tableName: 'utilities',
  });
  return Utilities;
};