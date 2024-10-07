'use strict';

const { sequelize } = require('../models');
const dayjs = require('dayjs')
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      const students = await queryInterface.sequelize.query(
        'SELECT id FROM Users WHERE role = \'student\';',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
      const tutors = await queryInterface.sequelize.query(
        'SELECT id FROM Users WHERE role = \'tutor\';',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
      const pastStartDate = dayjs('2024-09-01')
      const futureStartDate = dayjs('2024-10-14')
      const slots = [
        { start_time: '18:00', end_time: '18:30' },
        { start_time: '19:00', end_time: '19:30' }
      ]
      const feedbackSlots = [
        { start_time: '18:30', end_time: '19:00' },
        { start_time: '19:30', end_time: '20:00' }
      ]

      await queryInterface.bulkInsert('Appointments', [
        ...Array.from({ length: students.length }, (_, i) => 
        slots.map(slot => ({
          student_id: students[i].id,
          tutor_id: tutors[i].id,
          appointment_date: pastStartDate.add(i, 'day').format('YYYY-MM-DD'),
          start_time: slot.start_time,
          end_time: slot.end_time,
          course_duration: '30',
          status: 'booked',
          created_at: new Date(),
          updated_at: new Date()
        }))
      ).flat(),
      ...Array.from({ length: tutors.length }, (_, i) => 
        slots.map(slot => ({
          student_id: students[Math.floor(Math.random() * students.length)].id,
          tutor_id: tutors[i].id,
          appointment_date: futureStartDate.add(i, 'day').format('YYYY-MM-DD'),
          start_time: slot.start_time,
          end_time: slot.end_time,
          course_duration: '30',
          status: 'booked',
          created_at: new Date(),
          updated_at: new Date()
        })
      )).flat(),
      ...Array.from({ length: tutors.length }, (_, i) => 
        feedbackSlots.map(slot => ({
          student_id: students[Math.floor(Math.random() * students.length)].id,
          tutor_id: tutors[i].id,
          appointment_date: pastStartDate.add(i, 'day').format('YYYY-MM-DD'),
          start_time: slot.start_time,
          end_time: slot.end_time,
          course_duration: '30',
          status: 'completed',
          created_at: new Date(),
          updated_at: new Date()
        })
      )).flat()
      ])
    } catch (err) {
      console.log('Error:', err)
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Appointments', {})
  }
};
