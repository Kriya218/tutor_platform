if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
  console.log('env=dev')
}

const express = require('express')
const flash = require('connect-flash')
const session = require('express-session')
const app = express()


const { engine } = require('express-handlebars')

const routes = require('./routes')
const port = process.env.PORT || 3000

app.engine('.hbs', engine({ extname: '.hbs' }))
app.set('view engine', '.hbs')
app.set('views', './views')

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  next()
})


app.use(routes);


app.listen(port, () => {
  console.info(`Server is running on http//localhost:${port}`)
})

module.exports = app
