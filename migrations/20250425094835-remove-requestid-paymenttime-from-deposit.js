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
    await queryInterface.removeColumn('deposit', 'request_id');
    await queryInterface.removeColumn('deposit', 'payment_time');
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.addColumn('deposit', 'request_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('deposit', 'payment_time', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }
};
