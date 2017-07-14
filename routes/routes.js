var express = require('express');
var router = express.Router();
var models = require('../models');
var User = models.User;
var Filter = require('bad-words')
var filter = new Filter();


//////////////////// LANDING PAGE WITH OPTIONS FOR SIGNUP AND LOGIN ////////////////////////////////
// Users who are not logged in can see these routes

router.get('/', function(req, res, next) {
  res.render('home');
});

///////////////////////////// THE WALL /////////////////////////////

router.use(function(req, res, next){
  if (!req.user) {
    res.redirect('/login');
  } else {
    return next();
  }
});

//////////////////////////////// PRIVATE ROUTES ////////////////////////////////
// Only logged in users can see these routes

// home page with threads
router.get('/threads', function(req, res, next) {
  res.render('threads');
});

router.get('/messages/:friendid') {
  res.render()
}

///////////////////////////// END OF PRIVATE ROUTES /////////////////////////////

module.exports = router;
