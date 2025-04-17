"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FavoriteRoom extends Model {
    static associate(models) {
      // Define associations here
      FavoriteRoom.belongsTo(models.User, {
        foreignKey: "user_id", // Changed from userId to user_id
        as: "user",
      });

      FavoriteRoom.belongsTo(models.Room, {
        foreignKey: "room_id", // Changed from roomId to room_id
        as: "room",
      });
    }
  }

  FavoriteRoom.init(
    {
      user_id: {
        // Changed from userId to user_id
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      room_id: {
        // Changed from roomId to room_id
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "FavoriteRoom",
      tableName: "favoriteRoom", // Add explicit table name
    }
  );

  return FavoriteRoom;
};
