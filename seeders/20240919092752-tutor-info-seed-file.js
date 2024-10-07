'use strict'
const { faker } = require('@faker-js/faker')

module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      await queryInterface.bulkInsert('Tutor_infos', 
        Array.from({ length: 20 }, (_, i) => ({
          id: i+1,
          course_name: faker.internet.displayName() ,
          introduction: faker.lorem.paragraph(),
          teaching_style: faker.lorem.paragraph(),
          meeting_link: faker.internet.url(),
          course_duration: '30',
          days: JSON.stringify(["Monday", "Friday", "Saturday"]),
          created_at: new Date(),
          updated_at: new Date()
        }))
      )
    } catch (err) {      
      console.error('Error:', err)
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tutor_infos', {})
  }
}
