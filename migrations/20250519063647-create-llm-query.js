'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('llmqueries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.STRING
      },
      query: {
        type: Sequelize.TEXT
      },
      response: {
        type: Sequelize.TEXT('long'), // Hỗ trợ LONGTEXT trong MySQL
      },
      status: {
        type: Sequelize.STRING
      },
      timestamp: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('llmqueries');
  }
};
