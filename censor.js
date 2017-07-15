var Filter = require('bad-words')
var filter = new Filter({ placeHolder: '~'});
filter.addWords(['ugly', 'gross']);
var sentiment = require('sentiment')

var User = require('./models').User

module.exports = function (text, userid) {
  User.update({_id: userid}, {$inc: {postivityScore: sentiment(text).comparitives}}, function(err) {
    if (err) {
      console.log(err)
    }
  })
  var words = text.split(' ')
  var bundles = [];
  words.forEach(function(word) {
    if (words[words.indexOf(word)+2]) {
      bundles.push([word, words[words.indexOf(word)+1], words[words.indexOf(word)+2]].join(' '))
    }
  })

  if (filter.clean(text).includes('~')) {
    // emit dirty event
    return "bad word"

  }
  if (sentiment(text).score < 0) {
    // emit non-positive event
    return "general negativity"
  } else {
  }
  var bundle;
  for (var i = 0; i < bundles.length; i++) {
    bundle = bundles[i]
    if (sentiment(bundle).score < -2) {
      return "section of high negativity"
    }
  }
  return "all good"
}
