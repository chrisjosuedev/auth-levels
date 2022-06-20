require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const ejs = require('ejs')

// Cookies & Sessions
const session = require('express-session')
const passport = require('passport')
// (En Schema) const passportLocalMongoose = require('passport-local-mongoose')

// Google OAuth
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

// Hash MD5 
//const md5 = require('md5')

// Salt + Hash BCrypt
//const bcrypt = require('bcrypt')
//const salt = bcrypt.genSaltSync(10)

app.use(express.static(path.join(__dirname, 'public')))
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

// Local
// passport.serializeUser(User.serializeUser())
// passport.deserializeUser(User.deserializeUser())

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, user);
  });
});

// Google Strategy Config
passport.use(new GoogleStrategy({
  clientID:     process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  passReqToCallback   : true
},
(request, accessToken, refreshToken, profile, done) => {
  User.findOrCreate({ username: profile.email }, (err, user) => {
    return done(err, user);
  });
}
));

// Port
app.set('port', process.env.PORT || 3000)
const port = app.get('port')

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/secrets')
  } else {
    res.render('home')
  }
})

// Google
app.get('/auth/google',
  passport.authenticate("google", { scope: ["profile", "email"] }
));

app.get('/auth/google/secrets',
    passport.authenticate( 'google', {
        successRedirect: '/secrets',
        failureRedirect: '/login'
}));

app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/secrets')
  } else {
    res.render('login')
  }  
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