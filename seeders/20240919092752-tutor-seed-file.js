'use strict'
const bcrypt = require('bcryptjs')
const { faker } = require('@faker-js/faker')

module.exports = {
  async up (queryInterface, Sequelize) {
    let transaction

    try {
      transaction = await queryInterface.sequelize.transaction()
      const hashPwd = await bcrypt.hash('12345678', 10)

      await queryInterface.bulkInsert('Tutor_infos', 
        Array.from({ length: 10 }, () => ({
          about_me: faker.lorem.paragraph(),
          course_name: faker.internet.displayName() ,
          introduction: faker.lorem.paragraph(),
          teaching_style: faker.lorem.paragraph(),
          meeting_link: faker.internet.url(),
          created_at: new Date(),
          updated_at: new Date()
        }))
      , { transaction })
      
      await queryInterface.bulkInsert('Users', 
        Array.from({ length: 10 }, () => ({
          name: faker.internet.userName(),
          email: faker.internet.email(),
          password: hashPwd,
          image: faker.image.avatar(),
          role: 'tutor',
          created_at: new Date(),
          updated_at: new Date()
        }))
      , { transaction })

      await transaction.commit()
      console.log('Data inserted.')
    } catch (err) {      
      if (transaction) await transaction.rollback()
      console.error('Error:', err)
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('User', {})
  }
}
