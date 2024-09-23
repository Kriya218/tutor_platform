const express = require('express')
const router = express.Router()

const passport = require('../config/passport')

const userController = require('../controllers/user-controller')

const { authenticated } = require('../middlewares/auth')
const upload = require('../middlewares/multer')
const { generalErrorHandler } = require('../middlewares/error-handler')



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

router.get('/tutors/apply', authenticated, userController.getApplyPage)
router.post('/tutors/apply', authenticated, userController.tutorApply)
router.get('/tutors/:id/profile', authenticated, userController.getTutorProfile)
router.get('/tutors/:id/edit', authenticated, userController.editTutor)
router.put('/tutors/:id/edit', authenticated, upload.single('image'), userController.putTutor)
router.get('/tutors/:id', authenticated, userController.getTutorPage)
router.get('/tutors', authenticated, userController.getTutors)


router.get('/', (req, res) => res.redirect('/tutors'))
router.use('/', generalErrorHandler)

module.exports = router
