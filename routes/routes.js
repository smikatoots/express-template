var express = require('express');
var router = express.Router();
var models = require('../models');
var app = require('../app');
var User = models.User;
var Message = models.Message;
var Thread = models.Thread;
var censor = require('../censor')

//////////////////// LANDING PAGE WITH OPTIONS FOR SIGNUP AND LOGIN ////////////////////////////////
// Users who are not logged in can see these routes

module.exports = function(io) {

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
    User.find().then(function(allUsers) {
      var threads = [];
      threads.push(Thread.find({participant2: req.user._id}).populate("participant1").populate("participant2").populate("firstMessage"))
      threads.push(Thread.find({participant1: req.user._id}).populate("participant2").populate("participant1").populate("firstMessage"))


      // User.populate()
      Promise.all(threads)
      .then(function(threads) {
        res.render('user', {
          user: req.user,
          received: threads[0].reverse(),
          sent: threads[1].reverse(),
          friends: allUsers,
        });
      })
      .catch(function(err) {
        console.log(err)
      })
    });
  })

  io.on('connection', function(socket) {

    socket.on('newMessage', function(data) {
      console.log("MESSAGE COMING IN")
      User.findOne({ username: data.receiver }, function(err, user) {
        if (err) {
          res.send(err)
        } else if (!user) {
          socket.emit('badUser', data.receiver)
        } else {
          var friendid = user._id
          var content = data.content;
          var createdAt = new Date();
          var anonymousSender = data.anon
          console.log('censor(content): ' + censor(content))
          if (censor(content) === "bad word") {
            socket.emit("dirtyMessage");
          } else if (censor(content) === "general negativity") {
            socket.emit("negativeMessage");
          } else if (censor(content) === "section of high negativity") {
            socket.emit("negativeMessage");
          } else if (censor(content) === "all good") {
            new Message({
              sender: data.user,
              receiver: friendid,
              content: content,
              createdAt: createdAt,
              read: false
            }).save(function(err, message) {
              if (err) {
                console.log("Error while sending message", err)
              } else {
                new Thread({
                  participant1: data.user,
                  anonymousSender: anonymousSender,
                  participant2: friendid,
                  firstMessage: message._id,
                  replies: []
                }).save(function(err, thread) {
                  if (err) {
                    console.log("Error while creating thread", err)
                  } else {
                    // emit new message event
                    console.log("EMIT IT BACK BABY")
                    Thread.findById(thread._id).populate("participant2").populate("participant1").populate('firstMessage').exec(function(err, populatedThread) {
                      console.log("HI?")
                      socket.emit('newMessage', populatedThread)
                      socket.broadcast.emit('newReceivedMessage', populatedThread)
                    })
                  }
                })
              }
            })
          }
        }
      })
    })

    socket.on('newReply', function(data) {
      var threadid = data.threadid; // getting the thread to attach mesage on
      var content = data.content; // getting reply content
      var replySenderId = data.user;
      if (censor(content) === "bad word") {
        socket.emit("dirtyReply");
      } else if (censor(content) === "general negativity") {
        socket.emit("negativeReply");
      } else if (censor(content) === "section of high negativity") {
        socket.emit("negativeReply");
      } else if (censor(content) === "all good") {
        Thread.findById(threadid, function(err, thread) {
          if (err) {
            console.log("Could not identify thread to post reply for", err)
          } else if (!thread) {
            console.log("Invalid thread id")
          } else {

            User.findById(replySenderId, function(err, replySender) {
                if (err) {
                    res.send(err)
                }
                else {
                    if (thread.participant1 === replySenderId) {
                        var replyReceiverId = thread.participant2;
                        var you = true;
                    } else {
                        var replyReceiverId = thread.participant1;
                        var you = false;
                    }
                    User.findById(replyReceiverId, function(err, replyReceiver) {
                      console.log(data.user)
                      console.log(replySenderId)
                      console.log(replyReceiverId)
                      console.log(data.user === replySenderId)
                      console.log(thread.anonymousSender)
                      var reply = {
                          receiver: replyReceiver.username,
                          sender: replySender.username,
                          content: content,
                          picture: replySender.picture,
                          createdAt: new Date(),
                          anon: thread.anonymousSender,
                          you: you
                      }

                      console.log("thread", thread)

                      Thread.update({_id: thread._id}, {$push:{replies: reply}}, function(err, update) {
                          if (err) {
                            res.send(err)
                          } else {
                            console.log('thread._id being sent to front-end: ' + thread._id)
                            socket.emit('newReply', {reply: reply, thread: thread})
                          }
                        })
                    })
                }
            })
          }
        })
      }
    });
  })

  return router
}
  ///////////////////////////// END OF PRIVATE ROUTES /////////////////////////////
