'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'total_study_hours', {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'total_study_hours', {
      type: Sequelize.FLOAT,
      defaultValue: 0
    })
  }
};
