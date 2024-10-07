'use strict'
const { faker } = require('@faker-js/faker')
const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPwd = await bcrypt.hash('12345678', 10)
    await queryInterface.bulkInsert('Users', [
      {
        id: 1,
        name: 'root',
        email: 'root@example.com',
        password: hashedPwd,
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'user1',
        email: 'user1@example.com',
        password: hashedPwd,
        role: 'student',
        created_at: new Date(),
        updated_at: new Date()
      },
      ...Array.from({ length: 10 }, (_, i) => ({
        name: `user${i+2}`,
        email: faker.internet.email(),
        password: hashedPwd,
        role: 'student',
        image: faker.image.avatar(),
        about_me: faker.lorem.paragraph(),
        created_at: new Date(),
        updated_at: new Date()
      }))
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {
      role: { [Op.or]: ['admin', 'student'] }
    })
  }
}
