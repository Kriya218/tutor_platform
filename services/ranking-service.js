const { Sequelize } = require('sequelize')
const { User, Appointment, Tutor_info, sequelize } = require('../models')
const { checkFile } = require('../helpers/file-helper')

const rankingService = {
  getStudentRankings: (limit = 8, studentId = null, cb) => {
    Appointment.findAll({
      include: [{
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'image'],
          where: { role: 'student' }
      }],
      where: { status: 'completed' },
      attributes: [
        'studentId',
        [Sequelize.fn('SUM', Sequelize.col('course_duration')), 'totalDuration']
      ],
      group: ['studentId'],
      order: [[Sequelize.literal('totalDuration'), 'DESC']],
      ...(limit && { limit }), 
      raw: true,
      nest: true
    })
      .then(async rankings => {
        if (studentId) {
          const rank = rankings.findIndex(ranking => ranking.studentId === parseInt(studentId)) + 1
          return cb(null, rank)
        }
        const updatedRankings = await Promise.all(rankings.map(async ranking => {
            const validImg = await checkFile(ranking.student.image)
            ranking.student.image = validImg
            return ranking
          }))
        return cb(null, updatedRankings)
      })
      .catch(err => cb(err))
  }
}

module.exports = { rankingService }