const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const { User } = require('../models')

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passReqToCallback: true
  },
  (req, email, password, cb) => {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) { 
          req.flash('error_msg', 'email或密碼錯誤')
          return cb(null, false)
        }
        bcrypt.compare(password, user.password).then(res => {
          console.log('密碼錯誤')
          if (!res) { 
            req.flash('error_msg', 'email或密碼錯誤')
            return cb(null, false)
          }
          return cb(null, user)
        })
      })
      .catch(err => cb(err))
  }
))

passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
  return User.findByPk(id)
    .then(user => cb(null, user.toJSON()))
    .catch(err => cb(err))
})

module.exports = passport
