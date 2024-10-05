const { User } = require('../models')

const adminService = {
  getUsers: (req, cb) => {
    return User.findAll({
      attributes: ['id', 'name', 'email', 'role'],
      raw: true
    })
      .then(users => {
        return cb(null, { users })
      })
      .catch(err => cb(err))
  }
}

module.exports = adminService