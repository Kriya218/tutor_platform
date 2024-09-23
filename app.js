if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
  console.log('env=dev')
}

const express = require('express')
const flash = require('connect-flash')
const session = require('express-session')

const { engine } = require('express-handlebars')
const passport = require('./config/passport')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const methodOverride = require('method-override')

const app = express()
const routes = require('./routes')
const path = require('path')
const port = process.env.PORT || 3000

app.engine('.hbs', engine({ extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', '.hbs')
app.set('views', './views')

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(express.json())
app.use(methodOverride('_method'))
app.use('/upload', express.static(path.join(__dirname, 'upload')))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  next()
})

app.use(routes)


app.listen(port, () => {
  console.info(`Server is running on http//localhost:${port}`)
})

module.exports = app
