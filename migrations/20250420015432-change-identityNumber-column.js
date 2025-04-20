'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn('user', 'identifyNumber', {
      type: Sequelize.BIGINT, // Hoặc Sequelize.STRING nếu bạn muốn lưu dưới dạng chuỗi
      allowNull: true, // Cập nhật nếu cần thiết
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn('user', 'identifyNumber', {
      type: Sequelize.INTEGER,
      allowNull: true, // Cập nhật nếu cần thiết
    });
  }
};
