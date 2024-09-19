const bcrypt = require('bcryptjs')
const { User, Tutor_info } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const userService = {
  signUp: (req, cb) => {
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
  },
  getTutors: (req, cb) => {
    const limit = 9
    const page = Number(req.query.page) || 1
    return Promise.all([
      Tutor_info.findAndCountAll({
        attributes: ['id', 'courseName', 'introduction'],
        include: [{ 
          model: User, 
          as: 'user',
          attributes: ['id', 'name', 'image', 'tutor_info_id']
        }],
        limit: limit,
        offset: getOffset(limit, page),
        raw: true,
        nest: true
      }),
      User.findAll({
        where: { role: 'student' },
        attributes: ['id', 'name', 'image', 'totalStudyHours'],
        limit: 8,
        order: [['totalStudyHours', 'DESC']],
        raw: true
      })
    ])
    
      .then(([tutorInfos, students]) => {
        const { id, name, role } = req.user
        const tutors = tutorInfos.rows
          .map(tutorInfo => ({
            ...tutorInfo,
            introduction: tutorInfo.introduction ? tutorInfo.introduction.substring(0, 60) : ''
        }))
        console.log('tutors:', tutors)
        return cb(null, { 
          id, 
          name, 
          role, 
          tutors, 
          students,
          pagination: getPagination(limit, page, tutorInfos.count)
        })
      })
  } 
}

module.exports = userService
