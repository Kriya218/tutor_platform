const appointmentService = require('../services/appointment-service')

const appointmentController = {
  postAppointment: (req, res, next) => {
    if (req.user.tutorInfoId) throw new Error('教師身分無法預約課程')
    appointmentService.postAppointment(req, (err, cb) => {
      if (err) next(err)
      res.redirect(`/tutors/${req.params.id}/profile`)
    })
  }
}

module.exports = appointmentController
