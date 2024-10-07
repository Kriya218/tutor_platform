'use strict';
const bcrypt = require('bcryptjs')
const { faker } = require('@faker-js/faker')
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      const hashPwd = await bcrypt.hash('12345678', 10)
      const tutor_infos = await queryInterface.sequelize.query(
        'SELECT id FROM Tutor_infos;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )

      await queryInterface.bulkInsert('Users', 
          Array.from({ length: 20 }, (_, i) => ({
            name: `tutor${i+1}`,
            email: faker.internet.email(),
            password: hashPwd,
            image: faker.image.avatar(),
            role: 'tutor',
            about_me: faker.lorem.paragraph(),
            tutor_info_id: tutor_infos[i].id,
            created_at: new Date(),
            updated_at: new Date()
          }))
      )
    } catch(err) {
      console.log('Error:', err)
    }  
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { role: 'tutor' })
  }
};
