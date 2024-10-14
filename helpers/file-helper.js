const fs = require('fs')
const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const axios = require('axios')

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})



const localFileHandler = file => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)
    const fileName = `upload/${file.originalname}`
    return fs.promises.readFile(file.path)
      .then(data => fs.promises.writeFile(fileName, data))
      .then(() => resolve(`/${fileName}`))
      .catch(err => reject(err))
  })
}

const s3FileHandler = multerS3({
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET_NAME,
  acl: 'public-read',
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname })
  },
  key: function (req, file, cb) {
    cb(null, 'uploads/'+ Date.now().toString() + '-' + file.originalname)
  }
})

const upload = process.env.NODE_ENV === 'production' ? multer({ storage: s3FileHandler }) : multer({ dest: 'temp/' })

const fileHandler = file => {
  if (!file) return Promise.resolve(null)
  if (process.env.NODE_ENV === 'production') {
    return  Promise.resolve(file.location)
  } else if (process.env.NODE_ENV === 'development') {
    return  localFileHandler(file)
  } else {
    return null
  }
}
const defaultAvatar = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ12lYNi9ON02p9zySLVYzHFAkvMdJtDiT2oA&s'
const checkFile = async url => {
  try {
    const response = await axios.get(url)
    if (response.status === 200) {
      return url
    }
  } catch (err) {
    return defaultAvatar
  }
}
  

module.exports = { fileHandler, upload, checkFile }
