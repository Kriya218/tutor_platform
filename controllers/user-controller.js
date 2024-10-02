const userService = require('../services/user-service')
const getAvailableDate  = require('../helpers/time-helper')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    if (req.body.password !== req.body.passwordCheck) throw new Error('密碼與確認密碼需一致')
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
  getTutors: (req, res, next) => {
    userService.getTutors(req, (err, data) => {
      if (err) next(err)
      if (req.user.role === 'admin') {
        req.flash('error_msg', '管理者無檢視前台權限')
        return res.redirect('/signin')
      }
      return res.render('index', data)
    }) 
  },
  getApplyPage: (req, res) => {
    res.render('apply')
  },
  tutorApply: (req, res, next) => {
    userService.tutorApply(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '老師資格申請成功')
      return res.redirect('/tutors')
    })
  },
  getTutorProfile: (req, res, next) => {
    userService.getTutorProfile(req, (err, data) => {
      if (err) {
        req.flash('error_msg', err.message)
        req.flash('status_code', err.status)
        res.redirect('/tutors')
      }
      
      res.render('tutor-profile', { ...data })
    })
  },
  getTutorPage: (req, res, next) => {
    if (req.user.id !== Number(req.params.id)) {
      req.flash('error_msg', '無檢視頁面權限')
      req.flash('status_code', 403)
      res.redirect('/tutors')
      }
    userService.getTutorPage(req, (err, data) => {
      if (err) {
        req.flash('error_msg', err.message)
        req.flash('status_code', err.status)
        res.redirect('/tutors')
      }
      return res.render('tutor', {...data})
    })
  },
  editTutor: (req, res, next) => {
    userService.editTutor(req, (err, data) => err ? next(err) : res.render('tutor-edit', data))
  },
  putTutor: (req, res, next) => {
    userService.putTutor(req, (err, data) => {
      if (err) next(err)
      req.flash('success_msg', '編輯成功')
      return res.redirect(`/tutors/${req.user.id}`)
    })
  },
  getUser: (req, res, next) => {
    userService.getUser(req, (err, data) => {
      if (err) {
        req.flash('error_msg', err.message)
        req.flash('status_code', err.status)
        return res.redirect('/tutors')
      }
      res.render('student', {...data})
    })
  },
  editUser: (req, res, next) => {
    if (req.user.id !== Number(req.params.id)) throw new Error('無編輯權限')
    userService.editUser(req, (err, data) => err ? next(err) : res.render('student-edit', data))
  },
  putUser: (req, res, next) => {
    userService.putUser(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '編輯成功')
      return res.redirect(`/user/${req.user.id}`)
    })
  }
}

module.exports = userController
