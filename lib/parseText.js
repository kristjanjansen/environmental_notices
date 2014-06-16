var $ = require('cheerio')
var moment = require('moment')
var types = require('../lib/types')


exports.shortDescription = function(msg, cb) {
    
    var max = 250
    msg.description_short = ''

    if (msg.type !== 'Maa riigi omandisse jätmise teated') {
        msg.description_short = msg.description.split('\n')[0]
        if (msg.description_short.length > max) {
            var el = msg.description_short.substr(0, max).split(' ')
            el.pop()
            msg.description_short = el.join(' ') + '...'
        }
    }

    cb(null, msg);

}


exports.importance = function(msg, cb) {
 
 if (msg.type == 'Keskkonnamõju hindamise teated') {
   var matches = msg.description.match(/algatamata/g)
   if (matches) {
    msg.type = 'Keskkonnamõju hindamise algatamata jätmine'
    msg.priority = 8
   }
 } 
 return cb(null, msg)    
 
}


exports.businessRegister = function(msg, cb) {
 
   var pattern = /(\d{8})/g
    var matches = msg.description.match(pattern)
    if (matches) {
        msg.description = msg.description.replace(pattern, '<a target="_blank" href="https://ariregister.rik.ee/ettevotja.py?ark=$1">$1</a>')    
    }
    return cb(null, msg)    

}


exports.linebreaks = function(msg, cb) {
 
    msg.description = msg.description.replace(/\n+/g,'\n')    
    msg.description = msg.description.replace(/\n/g,'<br /><br />')    
    return cb(null, msg)    

}

// @todo cleanup 
// replace(/\t/g,' ')