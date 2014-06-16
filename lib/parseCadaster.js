var request = require('request')
var utils = require('../lib/utils')


function cadasterIdToGeo(cadasterId, cb) {

  // @todo 
  // http://geoportaal.maaamet.ee/est/Teenused/Poordumine-kaardirakendusse-labi-URLi-p9.html
  // http://geoportaal.maaamet.ee/url/xgis-ky.php?ky=41201:004:0067&out=json
  // http://geoportaal.maaamet.ee/url/xgis-ky.php?ky=41201:004:0067&what=bbox&out=json
  
  var url = 'http://geoportaal.maaamet.ee/url/xgis-ky.php?ky=' + cadasterId + '&what=tsentroid&out=json'
  var lest = []

  request({url:url, json:true}, function (err, res, body) {
    if (!err && body) {
        var lest = {x: body[1].X, y: body[1].Y}
        var geo = utils.LestToGeo(lest)
        return cb(null, geo)
    } else {
        return cb(err)
    } 
  });

}



exports.id = function(msg, cb) {
    
        var url = 'http://xgis.maaamet.ee/ky/FindKYByT.asp?txtCU='
        var pattern = /(\d+:\d+:\d+)/g 
        var matches = msg.description.match(pattern)
        if (matches) {            
            msg.cadasterId = matches[0]
            msg.cadasterUrl = url + msg.cadasterId 
            msg.description = msg.description.replace(pattern,'<a target="_blank" href="'+ url + '$1">$1</a>')
            cadasterIdToGeo(msg.cadasterId, function(err, geo) {
                if (err) return cb(err)
                msg.geo = geo
                return cb(null, msg)
            })
            
        } else {
            return cb(null, msg)    
        }
 
}

