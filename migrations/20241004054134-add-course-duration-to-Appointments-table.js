'use strict';

const { QueryInterface } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Appointments', 'course_duration', {
      type: Sequelize.FLOAT
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Appointments', 'course_duration', {})
  }
};
