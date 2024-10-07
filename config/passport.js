const passport = require('passport')
const LocalStrategy = require('passport-local')
const GoogleStrategy = require('passport-google-oauth20')
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

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true,
  scope: ['email', 'profile']
}, (req, accessToken, refreshToken, profile, cb) => {
  const email = profile.emails[0].value
  const name = profile.displayName || `${email}`
  const image = profile.photos[0].value
  return User.findOne({where: { email }})
    .then(user => {
      if (user) {
        return cb(null, user)
      }
      const randomPwd = Math.random().toString(36).slice(-8)
      return bcrypt.hash(randomPwd, 10)
        .then(hash => User.create({ 
          name,
          email,
          password: hash,
          image
        }))
        .then(user => cb(null, { id: user.id, name: user.name, email: user.email}))
        .catch(err => {
          req.flash('error_msg', '登入失敗')
          cb(err)
        })
      })
}))

passport.serializeUser((user, cb) => {
  cb(null, {
    id: user.id,
    tutorInfoId: user.tutor_info_id
  })
})

passport.deserializeUser((data, cb) => {
  return User.findByPk(data.id)
    .then(user => cb(null, user.toJSON()))
    .catch(err => cb(err))
})

module.exports = passport
