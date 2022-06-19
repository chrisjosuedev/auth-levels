require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const ejs = require('ejs')

// Cookies & Sessions
const session = require('express-session')
const passport = require('passport')
// (En Schema) const passportLocalMongoose = require('passport-local-mongoose')

// Hash MD5 
//const md5 = require('md5')

// Salt + Hash BCrypt
//const bcrypt = require('bcrypt')
//const salt = bcrypt.genSaltSync(10)

app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))

// View Engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Configure Session
app.use(session({
  secret: process.env.SESSION,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

// Database
require('./db')

const User = require('./models/Users')

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Port
app.set('port', process.env.PORT || 3000)
const port = app.get('port')

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', (req, res) => {
  const { username, password } = req.body

  const user = new User({
    username,
    password
  })

  req.login(user, (err) => {
    if (err) {
      console.log(err)
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect('/secrets')
      })
    }
  })
})

app.get('/register', (req, res) => {
  res.render('register')
})

app.post('/register', (req, res) => {
  const { username, password } = req.body

  User.register({username}, password, (err, user) => {
    if (err) {
      console.log(err)
      res.redirect('/register')
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect('/secrets')
      })
    }
  })
})

app.get('/secrets', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('secrets')
  } else {
    res.redirect('/login')
  }
})

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err)
    }
    res.redirect('/')
  })
})

// Run Server
app.listen(port, () => {
  console.log('Server on port', port)
})