'use strict';

const appointment = require('../models/appointment');
const { faker } = require('@faker-js/faker')
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      const appointments = await queryInterface.sequelize.query(
        'SELECT id FROM Appointments WHERE status = \'completed\';',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
      await queryInterface.bulkInsert('Feedbacks', 
        Array.from({ length: appointments.length }, (_, i) => ({
          appointment_id: appointments[i].id,
          rating: Math.floor(Math.random() * 100) / 10,
          description: faker.lorem.paragraph(),
          created_at: new Date(),
          updated_at: new Date()
        }))
      )
    } catch (err) {
      console.log('Error:', err)
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Feedbacks', {})
  }
};
