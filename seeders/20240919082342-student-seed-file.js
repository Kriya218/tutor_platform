'use strict'
const { faker } = require('@faker-js/faker')
const bcrypt = require('bcryptjs')
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashPwd = await bcrypt.hash('12345678', 10)
    await queryInterface.bulkInsert('Users', 
      Array.from({ length: 10 }, () => ({
        name: faker.internet.userName(),
        email: faker.internet.email(),
        password: hashPwd,
        image: faker.image.avatar(),
        created_at: new Date(),
        updated_at: new Date()
      }))
    )
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {})
  }
}
