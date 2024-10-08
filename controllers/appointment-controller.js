const appointmentService = require('../services/appointment-service')

const appointmentController = {
  postAppointment: (req, res, next) => {
    if (req.user.role === 'tutor') {
      return res.json({
        success: false,
        error_msg: '教師身分無法預約'
      })
    }
    appointmentService.postAppointment(req, (err, data) => {
      if (err) return next(err)
      if (data.fail) {
        res.json({
          success: false,
          courseTime: data.courseTime,
        })
      } else {
        res.json({
          success: true,
          tutorId: data.appointment.tutorId,
          tutorName: data.tutorName, 
          courseName: data.courseName,
          appointmentDate: data.appointment.appointmentDate,
          courseTime: `${data.appointment.startTime} - ${data.appointment.endTime}`,
          meetingLink: data.meetingLink
        })
      }
    })
  },
  postFeedback: (req, res, next) => {
    appointmentService.postFeedback(req, (err, data) => {
      if (err) next(err)
      res.json({
        success: true,
        tutorName: data.tutorName,
        rating: data.feedback.rating,
        description: data.feedback.description
      })
    })
  }
}

module.exports = appointmentController
