const { Appointment } = require('../models')
// const { isOverlap } = require('../helpers/time-helper')

const appointmentService = {
  postAppointment: (req, cb) => {
    const { appointmentDate, courseTime } = req.body
    // const reqStartTime = courseTime.match(/(\d{2}:\d{2})/g)[0]
    // const reqEndTime = courseTime.match(/(\d{2}:\d{2})/g)[1]
    return Appointment.findAll({
      where: { tutorId: req.params.id, appointmentDate },
      attributes: ['id', 'appointmentDate', 'startTime', 'endTime'],
      raw: true
    })
      .then(appointment => {
        if (isOverlap(reqStartTime, reqEndTime, appointment.startTime, appointment.endTime)) {
          const result_msg = '時段已無法預約，請選擇其他時段'
          return cb(null, { result_msg, reqStartTime, reqEndTime })
        }
        return Appointment.create({
          studentId: req.user.id,
          tutorId: req.params.id,
          appointmentDate,
          startTime: reqStartTime,
          endTime: reqEndTime,
          status: 'booked'
        })
      })
      .then(appointment => cb(null, appointment))
      .catch(err => cb(err))
  }
}

// module.exports = appointmentService
