var express = require('express');
var router = express.Router();
var models = require('../models');
var User = models.User;
var Filter = require('bad-words')
var filter = new Filter();


//////////////////// LANDING PAGE WITH OPTIONS FOR SIGNUP AND LOGIN ////////////////////////////////
// Users who are not logged in can see these routes

router.get('/', function(req, res, next) {
  res.render('landing');
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
router.get('/user', function(req, res) {
  var threads = [];
  threads.push(Thread.find({participant2: req.user._id}).populate("participant1"));
  threads.push(Thread.find({participant1: req.user._id}).populate("participant2"));
  Promise.all(threads)
  .then(function(threads) {
    res.render('user', {
      user: req.user,
      received: threads[0],
      sent: threads[1]
    });
  })
});

router.post('/messages/:friendid', function(req, res) {
  var friendid = req.params.friendid;
  var content = req.body.content;
  var createdAt = new Date();
  var anonymousSender = req.body.anonymous
  new Message({
    sender: req.user._id,
    reciever: friendid,
    content: content,
    createdAt: createdAt,
    read: false
  }).save(function(err, message) {
    if (err) {
      console.log("Error while sending message", err)
    } else {
      new Thread({
        participant1: req.user._id,
        anonymousSender: anonymousSender
        participant2: friendid,
        messages: [message]
      }).save(function(err) {
        if (err) {
          console.log("Error while creating thread", err)
        }
      })
    }
  })
})

router.get('/messages/:friendid') {
  res.render()
}


///////////////////////////// END OF PRIVATE ROUTES /////////////////////////////

module.exports = router;
