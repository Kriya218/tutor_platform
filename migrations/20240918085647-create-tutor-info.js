'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tutor_infos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      about_me: {
        type: Sequelize.TEXT
      },
      course_name: {
        type: Sequelize.STRING
      },
      introduction: {
        type: Sequelize.TEXT
      },
      teaching_style: {
        type: Sequelize.TEXT
      },
      meeting_link: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tutor_infos')
  }
}