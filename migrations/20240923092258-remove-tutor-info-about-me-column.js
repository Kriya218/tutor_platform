'use strict';

const { query } = require('express');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Tutor_infos', 'about_me', {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Tutor_infos', 'about_me', {
        type: Sequelize.TEXT
    })
  }
};
