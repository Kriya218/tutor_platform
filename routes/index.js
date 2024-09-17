const express = require('express')
const router = express.Router()

const userController = require('../controllers/user-controller')
const { generalErrorHandler } = require('../middlewares/error-handler')

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', userController.signIn)

router.get('/', (req, res) => res.redirect('/'))
router.use('/', generalErrorHandler)

module.exports = router
