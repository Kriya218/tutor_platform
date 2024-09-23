const bcrypt = require('bcryptjs')
const { User, Tutor_info } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const { Op } = require('sequelize')
const { raw } = require('express')

const userService = {
  signUp: (req, cb) => {
    return User.findOne({ where: { email: req.body.email } })
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
    const keywords = req.query.keywords?.toLowerCase()
    const whereCond = keywords ? {
      [Op.or]: [
        { courseName: { [Op.like]: `%${keywords}%` } },
        { introduction: { [Op.like]: `%${keywords}%` } },
        { '$user.name$': { [Op.like]: `%${keywords}%` } }
      ]
    } : {}
    return Promise.all([
      Tutor_info.findAndCountAll({
        attributes: ['id', 'courseName', 'introduction'],
        where: whereCond,
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
        return cb(null, { 
          id, 
          name, 
          role, 
          tutors, 
          students,
          pagination: getPagination(limit, page, tutorInfos.count)
        })
      })
      .catch(err => cb(err))
  } ,
  tutorApply: (req, cb) => {
    const { aboutMe, courseName, introduction, teachingStyle, meetingLink, courseDuration, days } = req.body
    return User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'role']
    })
      .then(user => {
        if (user.role === 'tutor') throw new Error('身分已為老師')
        return Tutor_info.create({
          aboutMe, 
          courseName, 
          introduction,
          teachingStyle, 
          meetingLink, 
          courseDuration, 
          days
        })
      })
      .then(tutor => {
        User.update(
          { tutor_info_id: tutor.id, role: 'tutor' }, 
          { where: { id: req.user.id } }
        )
        return cb(null, tutor.toJSON())
      })
      .catch(err => cb(err))
  },
  getTutorProfile: (req, cb) => {
    const tutorId = req.params.id

    return User.findByPk(tutorId, {
      attributes: ['id', 'name', 'image', 'tutor_info_id', 'role'],
      include: [{model: Tutor_info}],
      raw: true,
      nest: true
    })
      .then(user => {
        if (!user) throw new Error('此使用者不存在')
        if (user.role !== 'tutor') throw new Error('使用者身分非老師')
        console.log('User:', user)
        return cb(null, { user })
      })
      .catch(err => cb(err))
  }
}

module.exports = userService
