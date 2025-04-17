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
    await queryInterface.addConstraint('rentpost', {
      fields: ['room_id'],
      type: 'foreign key',
      name: 'fk_rentpost_room', // Tên ràng buộc
      references: {
        table: 'room',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('rentpost', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_rentpost_user', // Tên ràng buộc
      references: {
        table: 'user',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeConstraint('rentpost', 'fk_rentpost_room');
    await queryInterface.removeConstraint('rentpost', 'fk_rentpost_user');
  }
};
