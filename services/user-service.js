const bcrypt = require('bcryptjs')
const { User } = require('../models')

const userService = {
  signUp: (req, cb) => {
    if (req.body.password !== req.body.passwordCheck) throw new Error('密碼與確認密碼需一致')
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('此 email 已註冊')

        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({
          name: req.body.name,
          email: req.body.email,
          password: hash
        })
      )
      .then(user => cb(null, user))
      .catch(err => cb(err))
  }
}

module.exports = userService
