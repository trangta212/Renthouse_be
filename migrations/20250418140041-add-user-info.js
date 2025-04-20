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
    await queryInterface.addColumn('user', 'fullNameIndentify', {
      type: Sequelize.STRING,
      allowNull: true, // Cột này có thể là null nếu không bắt buộc
    });
    await queryInterface.addColumn('user', 'identifyNumber', {
      type: Sequelize.INTEGER,
      allowNull: true, // Cột này có thể là null nếu không bắt buộc
    });
    await queryInterface.addColumn('user', 'date_of_birth', {
      type: Sequelize.DATE,
      allowNull: true, // Cột này có thể là null nếu không bắt buộc
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('user', 'fullNameIndentify');
    await queryInterface.removeColumn('user', 'identifyNumber');
    await queryInterface.removeColumn('user', 'date_of_birth');
  }
};
