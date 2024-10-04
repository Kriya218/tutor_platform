const { User, Tutor_info, Appointment, Feedback } = require('../models')
const { isOverlap } = require('../helpers/time-helper')
const { where } = require('sequelize')
const feedback = require('../models/feedback')

const appointmentService = {
  postAppointment: (req, cb) => {
    const { appointmentDate, courseTime } = req.body
    const [reqStartTime, reqEndTime] = courseTime.match(/(\d{2}:\d{2})/g)

    return Promise.all([
      Appointment.findAll({
        where: { tutorId: req.params.id, appointmentDate },
        attributes: ['id', 'appointmentDate', 'startTime', 'endTime'],
        raw: true
      }),
      User.findByPk(req.params.id, {
        attributes:['id', 'role', 'name', 'tutorInfoId'],
        include: [
          { 
            model: Tutor_info,
            as: 'tutorInfo',
            attributes: ['id', 'courseName', 'meetingLink', 'courseDuration'],
          }
        ],
        raw: true,
        nest: true
      })
    ]) 
    
      .then(([appointment, user]) => {
        const isTimeConflict = appointment.some(book => 
          isOverlap(reqStartTime, reqEndTime, book.startTime, book.endTime, book.appointmentDate)
        )
        if (user.role !== 'tutor' || !user) throw new Error('教師不存在')
        if (isTimeConflict) return cb(null, { courseTime, fail: true })
        
        const { name: tutorName } = user
        const { courseName, meetingLink, courseDuration } = user.tutorInfo
        const durationTransform = parseInt(courseDuration) / 60

        return Appointment.create({
          studentId: req.user.id,
          tutorId: user.id,
          appointmentDate,
          startTime: reqStartTime,
          endTime: reqEndTime,
          courseDuration: durationTransform
        })
          .then(appointment => cb(null, {
            appointment: appointment.toJSON(),
            tutorName,
            courseName,
            meetingLink
          }))
      })
      .catch(err => {
        console.error('Error creating appointment:', err)
        return cb(err)
      })
  },
  postFeedback: (req, cb) => {
    const { rating, description } = req.body
    return Promise.all([
      Feedback.findOne({
        where: { appointmentId: req.params.id },
      }),
      Appointment.findOne({
        where: { id: req.params.id },
        include: [{
          model: User,
          attributes: ['id', 'name'],
          as: 'tutor'
        }],
        nest: true
      })
    ])
      .then(([feedback, appointment]) => {
        if (feedback) throw new Error('此次課程已提交過回饋')
        if (req.user.id !== appointment.studentId) throw new Error('無回饋權限')
        appointment.update({ status: 'completed' })
        return Feedback.create({
          appointmentId: req.params.id,
          rating,
          description
        })
          .then(feedback => cb(null, {
            feedback: feedback.toJSON(),
            tutorName: appointment.tutor.name
          }))
      })
      .catch(err => cb(err))
  }
}

module.exports = appointmentService
