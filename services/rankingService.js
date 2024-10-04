const { Sequelize } = require('sequelize')
const { User, Appointment, Tutor_info, sequelize } = require('../models')

const rankingService = {
  getStudentRankings: (limit = 8, studentId = null, cb) => {
    console.log('rankSerStudentId:', typeof studentId)
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
      .then(rankings => {
        if (studentId) {
          const rank = rankings.findIndex(ranking => ranking.studentId === parseInt(studentId)) + 1
          return cb(null, rank)
        }
        return cb(null, rankings)
      })
      .catch(err => cb(err))
  }
}

module.exports = { rankingService }