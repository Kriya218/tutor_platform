const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')
const { User, Tutor_info, Appointment } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const { localFileHandler } = require('../helpers/file-helper')
const { getAvailableDate }  = require('../helpers/time-helper')

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
          { tutor_info_id: tutor.id, role: 'tutor', aboutMe }, 
          { where: { id: req.user.id } }
        )
        return cb(null, tutor.toJSON())
      })
      .catch(err => cb(err))
  },
  getTutorProfile: (req, cb) => {
    const tutorId = req.params.id
    // const { appointmentDate = '', courseTime = '' } = req.body || {}
    // return User.findByPk(tutorId, {
    //     attributes: ['id', 'name', 'image', 'tutor_info_id', 'role', 'aboutMe'],
    //     include: [{ model: Tutor_info, as: 'tutorInfo' }],
    //     raw: true,
    //     nest: true
    //   })
    
    return Promise.all([
      User.findByPk(tutorId, {
        attributes: ['id', 'name', 'image', 'tutor_info_id', 'role', 'aboutMe'],
        include: [{model: Tutor_info, as: 'tutorInfo'}],
        raw: true,
        nest: true
      }),
      Appointment.findAll({
        where: { tutorId },
        attributes: ['appointmentDate', 'startTime', 'endTime'],
        raw: true
      })
    ])
    
      .then(([user, appointment]) => {
        const opendays = 14
        const courseDuration = user.tutorInfo.courseDuration
        const days = user.tutorInfo.days
        const availableTimeSlots = getAvailableDate(opendays, courseDuration, days, appointment)
        
        if (!user) {
          const err = new Error('使用者不存在')
          err.status = 404
          throw err
        }
        if (user.role !== 'tutor') {
          const err = new Error('使用者身分非老師')
          err.status = 403
          throw err
        }
        cb(null, { user, availableTimeSlots:JSON.stringify(availableTimeSlots) })
      })
      .catch(err => {
        console.error('Error getProfile:', err)
        return cb(err)
      })
  },
  getTutorPage: (req, cb) => {
    return User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'image', 'role', 'tutor_info_id', 'aboutMe'],
      include:[{ 
        model: Tutor_info,
        as: 'tutorInfo'
      }],
      raw: true,
      nest: true
    })
      .then(user => {
        if (user.role !== 'tutor') {
          const err = new Error('身分非老師無法檢視')
          err.status = 403
          throw err
        }
        cb(null, { user })
      })
      .catch(err => cb(err))
  },
  editTutor: (req, cb) => {
    return User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'tutor_info_id', 'aboutMe'],
      include: [{ 
        model: Tutor_info,
        as:'tutorInfo'
      }],
      raw: true,
      nest: true
    })
      .then(user => {
        if (!user) throw new Error('此用戶不存在')
        if (user.id !== req.user.id) throw new Error('無編輯權限')
        return cb(null, { user })
      })
      .catch(err => cb(err))
  },
  putTutor: (req, cb) => {
    const { file } = req
    const { name, image, aboutMe, introduction, teachingStyle, courseName, meetingLink, courseDuration, days } = req.body
    return Promise.all([
      User.findByPk(req.user.id),
      Tutor_info.findByPk(req.user.tutorInfoId),
      localFileHandler(file)
    ])
      .then(([user, tutorInfo, filePath]) => {
        if (!user) throw new Error('使用者不存在')
        user.update({
          name,
          aboutMe,
          image: filePath || user.image
        })
        tutorInfo.update({
          introduction, 
          teachingStyle,
          courseName,
          meetingLink,
          courseDuration,
          days
        })
        return cb(null, { user: user.toJSON(), tutorInfo: tutorInfo.toJSON() })
      })
      .catch(err => cb(err))
  },
  getUser: (req, cb) => {
    const userId = req.user.id

    return User.findByPk(req.params.id, { 
      attributes: ['id', 'name', 'image', 'role', 'aboutMe'],
      raw: true 
    })
      .then(user => {
        if (!user) throw new Error('此用戶不存在')
        if (user.role === 'tutor') {
          const err = new Error('此頁面不存在')
          err.status = 404
          throw err
        }
        
        cb(null, { user, userId })
      })
      .catch(err => cb(err))
  },
  editUser: (req, cb) => {
    return User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'image', 'aboutMe', 'role'],
      raw: true
    })
      .then(user => {
        if (!user) throw new Error('使用者不存在')
        if (user.role !== 'student') throw new Error('頁面不存在')
        return cb(null, { user })
      })
      .catch(err => cb(err))
  },
  putUser: (req, cb) => {
    const { name, image, aboutMe } = req.body
    const { file } = req
    return Promise.all([
      User.findByPk(req.params.id),
      localFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error('使用者不存在')
        user.update({
          name,
          image: filePath || user.image,
          aboutMe
        })
        return cb(null, { user: user.toJSON() })
      })
      .catch(err => cb(err))
  }
}

module.exports = userService



//  getTutorProfile: (req, cb) => {
//     const tutorId = req.params.id
//     return User.findByPk(tutorId, {
//       attributes: ['id', 'name', 'image', 'tutor_info_id', 'role', 'aboutMe'],
//       include: [{model: Tutor_info, as: 'tutorInfo'}],
//       raw: true,
//       nest: true
//     })
//       .then(user => {
//         if (!user) {
//           const err = new Error('使用者不存在')
//           err.status = 404
//           throw err
//         }
//         if (user.role !== 'tutor') {
//           const err = new Error('使用者身分非老師')
//           err.status = 403
//           throw err
//         }
//         cb(null, { user })
//       })
//       .catch(err => cb(err))
//   },