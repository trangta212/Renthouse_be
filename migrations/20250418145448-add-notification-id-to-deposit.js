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
    await queryInterface.addColumn('deposit', 'notification_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Notification', // Tên bảng Notification
        key: 'id', // Cột khóa chính trong bảng Notification
      },
      allowNull: true, // Cho phép null vì không phải tất cả Deposit đều có thông báo
      onDelete: 'SET NULL', // Nếu Notification bị xóa, giá trị trong cột này sẽ được set NULL
    });

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('deposit', 'id');
  }
};
