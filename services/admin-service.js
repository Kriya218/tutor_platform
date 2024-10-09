const { User } = require('../models')

const adminService = {
  getUsers: (req, cb) => {
    return User.findAll({
      attributes: ['id', 'name', 'email', 'role'],
      raw: true
    })
      .then(users => {
        const name = req.user.name
        return cb(null, { users, name })
      })
      .catch(err => cb(err))
  }
}

module.exports = adminService