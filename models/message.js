"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Message.belongsTo(models.User, {
        foreignKey: "senderId",
        as: "sender", // alias cho ràng buộc này
      });

      // Ràng buộc Message với User qua receiverId
      Message.belongsTo(models.User, {
        foreignKey: "receiverId",
        as: "receiver", // alias cho ràng buộc này
      });
    }
  }
  Message.init(
    {
      senderId: DataTypes.INTEGER,
      receiverId: DataTypes.INTEGER,
      content: DataTypes.TEXT,
      isRead: DataTypes.BOOLEAN,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      senderEmail: DataTypes.STRING,
      receiverEmail: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Message",
      tableName: "messages",
    }
  );
  return Message;
};
