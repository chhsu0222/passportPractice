const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

var {Todo} = require('./../models/todo');
var {User} = require('./../models/user');

var frontView = express.Router();

// Login
frontView.get('/login', (req, res) => {
	res.render('index');
});

passport.use(new LocalStrategy(
  function (username, password, done) {
    User.findByCredentials(username, password).then((user) => {
      return done(null, user);
    }, (e) => {
      return done(null, false);
    })

  }
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

frontView.post('/login',
  passport.authenticate('local', { successRedirect:'/', failureRedirect:'/login'}),
  (req, res) => {
	  res.redirect('/');
  });

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()) {
    return next();
  } else {
  	res.redirect('/login');
  }
}

// Get Homepage
frontView.get('/', ensureAuthenticated, function(req, res){
	res.render('home', {account: req.user.account});
});

module.exports = {frontView};
