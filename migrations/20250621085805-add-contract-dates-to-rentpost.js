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
    await queryInterface.addColumn('rentpost', 'start_date_contract', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('rentpost', 'end_date_contract', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('rentpost', 'start_date_contract');
    await queryInterface.removeColumn('rentpost', 'end_date_contract');
  }
};
