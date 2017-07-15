// Add Passport-related auth routes here.
var express = require('express');
var router = express.Router();
var models = require('../models');

module.exports = function(passport) {

  // GET registration page
  router.get('/signup', function(req, res) {
    res.render('signup');
  });

  router.post('/signup', function(req, res) {
    if (req.body.password!==req.body.passwordRepeat) {
      return res.render('signup', {
        error: "Passwords don't match."
      });
    }
    var pic = req.file.path
    if (pic.substring(0,7) === "public\\" || pic.substring(0,7) === "public/") {
      new models.Pic({
        url: req.file.path.substring(7),
        username: req.body.username
      }).save();
    }

    var u = new models.User({
      username: req.body.username,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      birthday: req.body.birthday,
      email: req.body.email,
      location: req.body.location,
      affiliation: req.body.affiliation,
      picture: req.file.path.substring(7),
      bio: req.body.bio,
      friends: [],
      positivityScore: 0
    });
    u.save(function(err, user) {
      if (err) {
        console.log(err);
        res.status(500).redirect('/signup');
        return;
      }
      res.redirect('/login');
    });
  });

  // GET Login page
  router.get('/login', function(req, res) {
    res.render('login');
  });

  // POST Login page
  router.post('/login', passport.authenticate('local',{
    successRedirect: '/user',
    failureRedirect: '/user'
  }));

  // GET Logout page
  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  return router;
};
