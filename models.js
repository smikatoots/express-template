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
  friends: [{
    type: mongoose.Schema.ObjectId,
    ref: "User"
  }],
});

var messageSchema = mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  reciever: {
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
  participant1Anonymous: Boolean,
  participant2: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  participant2Anonymous: Boolean,
  messages: [{
    type: mongoose.Schema.ObjectId,
    ref: "Message"
  }],
})



User = mongoose.model('User', userSchema);
Message = mongoose.model('Message', messageSchema);

module.exports = {
    User:User
};
