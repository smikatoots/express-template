var express = require('express');
var router = express.Router();
var models = require('../models');
var app = require('../app');
var User = models.User;
var Thread = models.User;
var Filter = require('bad-words')
var filter = new Filter({ placeHolder: '~'});
var sentiment = require('sentiment')

var http = require('http').Server(router);
var io = require('socket.io')(http);

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

io.on('connection', function(socket) {

  socket.on('newMessage', function(data) {
    User.findOne({ username: data.username }, function(err, user) {
      if (err) {
        res.send(err)
      } else if (!user) {
        socket.emit('badUser', data.username)
      } else {
        var friendid = user._id
        var content = data.content;
        var createdAt = new Date();
        var anonymousSender = data.anon
        if (filter.clean(content).includes('~')) {
          // emit dirty event
          socket.emit("dirtyMessage")
        }
        if (sentiment(content).score < 5) {
          // emit non-positive event
          socket.emit("negativeMessage")
        }

        new Message({
          sender: req.user._id,
          receiver: friendid,
          content: content,
          createdAt: createdAt,
          read: false
        }).save(function(err, message) {
          if (err) {
            console.log("Error while sending message", err)
          } else {
            new Thread({
              participant1: req.user._id,
              anonymousSender: anonymousSender,
              participant2: friendid,
              firstMessage: message,
              replies: []
            }).save(function(err, thread) {
              if (err) {
                console.log("Error while creating thread", err)
              } else {
                // emit new message event
                socket.emit('newMessage', thread)
              }
            })
          }
        })
      }
    })
  })

  socket.on('newReply', function(data) {
    var threadid = data.threadid;
    var content = data.content;
    if (filter.clean(content).includes('~')) {
      // emit dirty event
      socket.emit("dirtyReply")
    }
    if (sentiment(content).score < 5) {
      // emit non-positive event
      socket.emit("negativeReply")
    }
    Thread.findById(threadid, function(err, thread) {
      if (err) {
        console.log("Could not identify thread to post reply for", err)
      } else if (!thread) {
        console.log("Invalid thread id")
      } else {
        new Message({
          sender: req.user._id,
          receiver: thread.participant2,
          content: content,
          createdAt: new Date(),
          read: false
        }).save(function(err, message) {
          thread.replies.push(message)
          socket.emit('newReply', message)
        })
      }
    })
  })
});

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



router.get('/messages/:friendid', function(req, res) {
  res.render()
})


///////////////////////////// END OF PRIVATE ROUTES /////////////////////////////

module.exports = router;
