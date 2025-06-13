'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LlmQuery extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LlmQuery.belongsTo(models.User, {
        foreignKey: 'user_id',
      });
    }
  }
  LlmQuery.init({
    user_id: DataTypes.STRING,
    query: DataTypes.TEXT,
    response: DataTypes.TEXT('long'),
    status: DataTypes.STRING,
    timestamp: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'LlmQuery',
    tableName: 'llmqueries',
  });
  return LlmQuery;
};
