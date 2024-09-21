'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('Tutor_infos', 'course_duration', {
        type: Sequelize.ENUM('30', '60')
      }),
      queryInterface.addColumn('Tutor_infos', 'days', {
        type: Sequelize.JSON
      })
    ])
  },

  async down (queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.removeColumn('Tutor_infos', 'course_duration'),
      queryInterface.removeColumn('Tutor_infos', 'days')
    ])
  }
};
