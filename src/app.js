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
const GoogleStrategy = require('passport-google-oauth2').Strategy

// Facebook OAuth
const FacebookStrategy = require('passport-facebook').Strategy

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
const Secret = require('./models/Secrets')

passport.use(User.createStrategy())

// Local
// passport.serializeUser(User.serializeUser())
// passport.deserializeUser(User.deserializeUser())

// Serialize & Desearialize Session
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
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://ask-app.onrender.com/auth/google/secrets",
  passReqToCallback   : true
},
(request, accessToken, refreshToken, profile, done) => {
  User.findOrCreate({ username: profile.email }, (err, user) => {
    return done(err, user);
  });
}
));

// Facebook Strategy Config
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/secrets"
},
(accessToken, refreshToken, profile, cb) => {
  User.findOrCreate({ facebookId: profile.id }, (err, user) => {
    return cb(err, user);
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

// Facebook
app.get('/auth/facebook',
  passport.authenticate('facebook')
);

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { 
      successRedirect: '/secrets',
      failureRedirect: '/login'
   })
);

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
      res.redirect('/login')
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

// Secrets
app.get('/secrets', (req, res) => {
  if (req.isAuthenticated()) {
    Secret.find((err, result) => {
      if (err) {
        res.redirect('/')
      } else {
        res.render('secrets', {listOfSecrets: result})
      }
    })
  } else {
    res.redirect('/login')
  }
})

// Submit Secret
app.get('/submit', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('submit')
  } else {
    res.redirect('/login')
  }
})

app.post('/submit', (req, res) => {
  const secrets = new Secret({
    secret: req.body.secret
  })

  secrets.save((err, result) => {
    if (err) {
      res.redirect('/submit')
    } else {
      res.redirect('/secrets')
    }
  })
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