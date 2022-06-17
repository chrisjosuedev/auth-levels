const express = require('express')
const app = express()
const path = require('path')
const ejs = require('ejs')

// Hash MD5 
const md5 = require('md5')

// Salt + Hash BCrypt
const bcrypt = require('bcrypt')
const salt = bcrypt.genSaltSync(10)

// Database
require('./db')

const User = require('./models/Users')

app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))

// View Engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Port
app.set('port', process.env.PORT || 3000)
const port = app.get('port')

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const userFound = await User.findOne({email: email})

    // MD5 Hash -> if (userFound.password === md5(password)) {
    
    // Salt + Hash Check Password
    const validPassword = bcrypt.compareSync(password, userFound.password)
    
    if (validPassword) { 
      res.render('secrets')
    }
    else {
      res.redirect('/login')
      console.log('Wrong Password')
    }
    
  } catch (err) {
    console.log(err)
    res.redirect('/login')
  }

})

app.get('/register', (req, res) => {
  res.render('register')
})

app.post('/register', async (req, res) => {
  const { email, password } = req.body

  const passwordHash = bcrypt.hashSync(password, salt)

  const newUser = new User({
    email,
    /* Hash MD5 -> password: md5(password) <- */
    password: passwordHash
  })

  try {
    await newUser.save()
    res.render('secrets')
  } catch (err) {
    console.log(err)
    res.redirect('/register')
  }

})

// Run Server
app.listen(port, () => {
  console.log('Server on port', port)
})