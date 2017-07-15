var Filter = require('bad-words')
var filter = new Filter({ placeHolder: '~'});
filter.addWords(['ugly', 'gross']);
var sentiment = require('sentiment')



module.export = function (text) {
  var words = text.split(' ')
  var bundles = [];
  words.forEach(function(word) {
    if (words[words.indexOf(word)+2]) {
      bundles.push([word, words[words.indexOf(word)+1], words[words.indexOf(word)+2]].join(' '))
    }
  })

  if (filter.clean(text).includes('~')) {
    // emit dirty event
    console.log("bad word")
    return false
  }
  if (sentiment(text).score < 0) {
    // emit non-positive event
    console.log("general negativity (score: " + sentiment(text).score + ")")
    return false
  } else {
  }
  var bundle;
  for (var i = 0; i < bundles.length; i++) {
    bundle = bundles[i]
    if (sentiment(bundle).score < -2) {
      console.log("section of high negativity: \"" + bundle + "\" (score: " + sentiment(bundle).score + ')')
      return false
    }
  }
  console.log("all good")
  return true
}
