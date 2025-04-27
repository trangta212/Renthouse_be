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
    await Promise.all([
      queryInterface.addColumn('deposit', 'payment_method', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'momo | vnpay',
      }),
      queryInterface.addColumn('deposit', 'trans_id', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Transaction ID từ MoMo hoặc VNPay',
      }),
      queryInterface.addColumn('deposit', 'order_id', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Mã đơn hàng gửi đi',
      }),
      queryInterface.addColumn('deposit', 'request_id', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Chỉ dùng với MoMo',
      }),
      queryInterface.addColumn('deposit', 'payment_time', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Thời gian thanh toán thành công',
      }),
      queryInterface.addColumn('deposit', 'refund_status', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'not_refunded',
        comment: 'Trạng thái hoàn tiền: not_refunded | refunded | refund_failed',
      }),
      queryInterface.addColumn('deposit', 'refund_reason', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Lý do hoàn tiền',
      }),
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await Promise.all([
      queryInterface.removeColumn('deposit', 'payment_method'),
      queryInterface.removeColumn('deposit', 'trans_id'),
      queryInterface.removeColumn('deposit', 'order_id'),
      queryInterface.removeColumn('deposit', 'request_id'),
      queryInterface.removeColumn('deposit', 'payment_time'),
      queryInterface.removeColumn('deposit', 'refund_status'),
      queryInterface.removeColumn('deposit', 'refund_reason'),
    ]);
  }
};
