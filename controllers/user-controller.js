const { logout } = require('../../forum-express-grading-github-actions/controllers/pages/user-controller')
const userService = require('../services/user-service')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    userService.signUp(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '註冊成功')
      return res.redirect('/signin')
    })
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
      req.flash('success_msg', '登入成功')
      res.redirect('/tutors')
  },
  logout: (req, res) => {
    req.logout(err => {
      if (err) return next(err)
      req.flash('success_msg', '登出成功')
      return res.redirect('/signin')
    })
  },
  getTutors: (req, res) => {
    res.render('index')
  }
}

module.exports = userController
