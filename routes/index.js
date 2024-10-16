const express = require('express')
const router = express.Router()

const passport = require('../config/passport')
const admin = require('./modules/admin')

const userController = require('../controllers/user-controller')
const appointmentController = require('../controllers/appointment-controller')

const { authenticated, authenticatedAdmin } = require('../middlewares/auth')
const { upload } = require('../helpers/file-helper')
const { generalErrorHandler } = require('../middlewares/error-handler')

router.use('/admin', authenticatedAdmin, admin)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', {
  failureRedirect:'/signin',
  failureFlash: true 
}), userController.signIn)
router.get('/oauth/login/google', passport.authenticate('google', { scope:['email'] }))
router.get('/oauth/redirect/google', passport.authenticate('google', {
  failureRedirect:'/signin',
  failureFlash: true
}), userController.signIn)
router.get('/logout', userController.logout)

router.post('/appointments/:id', authenticated, appointmentController.postAppointment)

router.post('/feedbacks/:id', authenticated, appointmentController.postFeedback)

router.get('/tutors/apply', authenticated, userController.getApplyPage)
router.post('/tutors/apply', authenticated, userController.tutorApply)
router.get('/tutors/:id/profile', authenticated, userController.getTutorProfile)
router.get('/tutors/:id/edit', authenticated, userController.editTutor)
router.put('/tutors/:id/edit', authenticated, upload.single('image'), userController.putTutor)
router.get('/tutors/:id', authenticated, userController.getTutorPage)
router.get('/tutors', authenticated, userController.getTutors)

router.get('/user/:id/edit', authenticated, userController.editUser)
router.put('/user/:id/edit', authenticated, upload.single('image'), userController.putUser)
router.get('/user/:id', authenticated, userController.getUser)

router.get('/', (req, res) => res.redirect('/tutors'))
router.use('/', generalErrorHandler)

module.exports = router
