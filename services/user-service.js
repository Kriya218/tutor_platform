const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')
const dayjs = require('dayjs')
const { User, Tutor_info, Appointment, Feedback } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const { localFileHandler } = require('../helpers/file-helper')
const { getAvailableDate, isFinished }  = require('../helpers/time-helper')
const { getAvg } = require('../helpers/calculate-helper')
const { rankingService } = require('../services/rankingService')

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
    return Tutor_info.findAndCountAll({
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
    })    
      .then(tutorInfos => {
        const { id, name, role } = req.user
        const tutors = tutorInfos.rows
          .map(tutorInfo => ({
            ...tutorInfo,
            introduction: tutorInfo.introduction ? tutorInfo.introduction.substring(0, 60) : ''
        }))
        let results
        if (tutors.length === 0 ) {
          results = '查詢無結果，請輸入其他關鍵字'
        } else {
          results = tutors
        }
        rankingService.getStudentRankings(8 , null, (err, rankings) => {
          if (err) cb(err)
          return cb (null, {
            id, 
            name, 
            role, 
            results,
            pagination: getPagination(limit, page, tutorInfos.count),
            rankings,
            keywords
          })
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
        if (user.id !== req.user.id) {
          const err = new Error('無變更身分權限')
          err.status = 403
          return cb(err)
        }
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
        console.log('tutor:', tutor)
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
    const now = dayjs()
    return Promise.all([
      User.findByPk(tutorId, {
        attributes: ['id', 'name', 'image', 'tutor_info_id', 'role', 'aboutMe'],
        include: [{model: Tutor_info, as: 'tutorInfo'}],
        raw: true,
        nest: true
      }),
      Appointment.findAll({
        where: { 
          tutorId, 
          status:'booked',
          [Op.or]: [
            { appointmentDate: { [Op.gt]: now.format('YYYY-MM-DD') } },
            { appointmentDate: now.format('YYYY-MM-DD'), startTime: { [Op.gt]: now.format('HH:mm') } }
          ]
        },
        attributes: ['appointmentDate', 'startTime', 'endTime'],
        raw: true
      }),
      Appointment.findAll({
        where: { tutorId, status:'completed' },
        attributes: ['id'],
        include: [{
          model: Feedback,
          as: 'feedback',
          attributes: [ 'rating', 'description'],
        }],
        order: [[{ model: Feedback, as: 'feedback' }, 'rating', 'DESC']],
        limit:2,
        raw: true,
        nest: true
      }),
      Appointment.findAll({
        where: { tutorId, status:'completed' },
        attributes: ['id'],
        include: [{
          model: Feedback,
          as: 'feedback',
          attributes: ['rating', 'description'],          
        }],
        order: [[{ model: Feedback, as: 'feedback' }, 'rating']],
        limit:2,
        raw: true,
        nest: true
      }),
      Appointment.findAll({
        where: { tutorId, status:'completed' },
        attributes: ['id'],
        include: [{
          model: Feedback,
          as: 'feedback',
          attributes: ['rating'],          
        }],
        raw: true,
        nest: true
      })
    ])
    
      .then(([user, appointment, feedbackH, feedbackL, ratings]) => {
        if (!user) {
          const err = new Error('使用者不存在')
          err.status = 404
          return cb(err)
        }
        if (user.role !== 'tutor') {
          const err = new Error('使用者身分非老師')
          err.status = 403
          return  cb(err)
        }
        const opendays = 14
        const courseDuration = user.tutorInfo.courseDuration
        const days = user.tutorInfo.days
        const availableTimeSlots = getAvailableDate(opendays, courseDuration, days, appointment)
        const orderedFeedbacks = [...feedbackH, ...feedbackL]
        const filteredFeedback = Array.from(new Set(orderedFeedbacks.map(feedback => feedback.id)))
          .map(id => {
            return orderedFeedbacks.find(feedback => feedback.id === id)
          })
        const ratingArr = ratings.map(rating => rating.feedback.rating)
        const ratingAvg = Math.round(getAvg(ratingArr) * 10) / 10
        
        cb(null, { user, availableTimeSlots:JSON.stringify(availableTimeSlots), filteredFeedback, ratingAvg })
      })
      .catch(err => {
        console.error('Error:', err)
        return cb(err)
      })
  },
  getTutorPage: (req, cb) => {
    return Promise.all([
      User.findByPk(req.user.id, {
        attributes: ['id', 'name', 'image', 'role', 'tutor_info_id', 'aboutMe'],
        include:[{ 
          model: Tutor_info,
          as: 'tutorInfo'
        }],
        raw: true,
        nest: true
      }),
      Appointment.findAll({
        where:{tutorId: req.user.id, status: 'booked'},
        include: [{
          model: User,
          as: 'student',
          attributes: ['id', 'name']
        }],
        order: [['appointmentDate'], ['startTime']],
        limit: 6,
        raw: true,
        nest: true
      }),
      Appointment.findAll({
        where: {tutorId: req.user.id, status: 'completed'},
        attributes: ['id', 'studentId'],
        include: [
          {
          model: User,
          as: 'student',
          attributes: ['id', 'name'],
          },
          {
            model: Feedback,
            as: 'feedback',
            attributes: ['appointmentId', 'rating', 'description'],
          }
        ],
        raw: true,
        nest: true
      }),
      Appointment.findAll({
        where: { tutorId: req.user.id, status:'completed' },
        attributes: ['id'],
        include: [{
          model: Feedback,
          as: 'feedback',
          attributes: ['rating'],          
        }],
        raw: true,
        nest: true
      })
    ])
      .then(([user, appointments, feedbacks, ratings]) => {
        const ratingArr = ratings.map(rating => rating.feedback.rating)
        const ratingAvg = Math.round(getAvg(ratingArr) * 10) / 10
        if (user.role !== 'tutor') {
          const err = new Error('身分非老師無法檢視')
          err.status = 403
          throw err
        }
        cb(null, { user, appointments, feedbacks, ratingAvg })
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
    const { name, aboutMe, introduction, teachingStyle, courseName, meetingLink, courseDuration, days } = req.body
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
    return Promise.all([
      User.findByPk(req.params.id, { 
        attributes: ['id', 'name', 'image', 'role', 'aboutMe'],
        raw: true 
      }),
      Appointment.findAll({
        where: {studentId: req.params.id, status:'booked'},
        include: [{ 
          model: User,
          as: 'tutor',
          attributes: ['id', 'name', 'image', 'tutorInfoId'],
          include: [{
            model: Tutor_info,
            attributes: ['id', 'courseName', 'meetingLink'],
            as: 'tutorInfo',
            raw: true
          }],
          raw: true,
          nest: true
        }],

        order: [['appointmentDate'], ['startTime']],
        raw: true,
        nest: true
      })
    ])
      .then(([user, appointments]) => {
        const bookedCourses = []
        const finishedCourses = []
        if (!user || user.role === 'tutor') {
          const err = new Error('此頁面不存在')
          err.status = 404
          throw err
        }
        appointments.forEach(appointment => {
          if(isFinished(appointment.appointmentDate, appointment.endTime)) {
            finishedCourses.push(appointment)
          } else {
            bookedCourses.push(appointment)
          }
        })
        rankingService.getStudentRankings(20 , req.params.id, (err, rankings) => {
          if (err) throw new Error(err)
          return cb (null, {
            user,
            userId,
            appointments: bookedCourses,
            finishedCourses,
            rankings
          })
        })
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
