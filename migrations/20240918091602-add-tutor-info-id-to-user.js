'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'tutor_info_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Tutor_infos',
        key: 'id'
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'tutor_info_id')
  }
}
