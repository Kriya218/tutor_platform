'use strict';
const bcrypt = require('bcryptjs')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let transaction

    try {
      transaction = await queryInterface.sequelize.transaction()
      
      await queryInterface.bulkInsert('Tutor_infos', [
        {
          id: 1,
          about_me: '自我介紹',
          course_name: '生活英語會話',
          introduction: '課程介紹',
          teaching_style: '教學風格',
          meeting_link: 'http://google_meeting/test',
          created_at: new Date(),
          updated_at: new Date()
        }
      ], { transaction })
      
      await queryInterface.bulkInsert('Users', [
        {
          id: 6,
          name: 'root',
          email: 'root@example.com',
          password: await bcrypt.hash('12345678', 10),
          role: 'admin',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 7,
          name: 'user1',
          email: 'user1@example.com',
          password: await bcrypt.hash('12345678', 10),
          role: 'student',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 8,
          name: 'user2',
          email: 'user2@example.com',
          password: await bcrypt.hash('12345678', 10),
          role: 'tutor',
          tutor_info_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ], { transaction })

      await transaction.commit()
      console.log('Data inserted.')
    } catch (err) {      
      if (transaction) await transaction.rollback()
      console.error('Error:', err)
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {})
  }
};
