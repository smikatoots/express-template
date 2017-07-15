var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  email: String,
  location: String,
  affiliation: String,
  birthday: Date,
  picture: String,
  bio: String,
  friends: [{
    type: mongoose.Schema.ObjectId,
    ref: "User"
  }],
  positivityScore: Number
});

var picSchema = mongoose.Schema({
  url: String,
  username: String
})

var messageSchema = mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  content: String,
  createdAt: Date,
  read: Boolean
});

var threadSchema = mongoose.Schema({
  participant1: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  anonymousSender: Boolean,
  participant2: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  firstMessage: {
    type: mongoose.Schema.ObjectId,
    ref: "Message"
  },
  replies: [{
    sender: String,
    receiver: String,
    createdAt: Date,
    content: String,
    picture: String,
    anon: Boolean,
    you: Boolean
  }]
})

var User = mongoose.model('User', userSchema);
var Message = mongoose.model('Message', messageSchema);
var Thread = mongoose.model('Thread', threadSchema)
var Pic = mongoose.model('Pic', picSchema)

module.exports = {
    User:User,
    Message:Message,
    Thread:Thread,
    Pic:Pic
};
