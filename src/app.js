const express = require('express')
const app = express()
const path = require('path')
const ejs = require('ejs')

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

app.get('/register', (req, res) => {
  res.render('register')
})

// Run Server
app.listen(port, () => {
  console.log('Server on port', port)
})