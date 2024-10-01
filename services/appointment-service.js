const { User, Tutor_info, Appointment } = require('../models')
const { isOverlap } = require('../helpers/time-helper')

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
            attributes: ['id', 'courseName', 'meetingLink'],
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
        const { courseName, meetingLink } = user.tutorInfo

        return Appointment.create({
          studentId: req.user.id,
          tutorId: user.id,
          appointmentDate,
          startTime: reqStartTime,
          endTime: reqEndTime
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
  }
}

module.exports = appointmentService
