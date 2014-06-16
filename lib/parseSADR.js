var request = require('request')
var $ = require('cheerio')

exports.getUrls = function(msg, cb) {
  
  var pattern = /http:\/\/www\.keskkonnaamet\.ee\/sadr\/\?id=(\d{4,})\&?/g
  var matches = msg.description.match(pattern)

  if (matches) {
    var id = matches[0].split('=')[1]
    if (id.substr(id.length - 1) == '&') {
      id = id.substr(0, id.length - 1)
    }
    msg.id = id
    var site_url = 'http://www.keskkonnaamet.ee/sadr'
    var url = site_url + '/index.php?id=' + msg.id
  
    request.get(url,
      function (err, res, body) {     
        //  res.statusCode == 200  
        if (err) return cb(err, msg)    
        var body = $.load(body)
        msg.url_sadr = site_url + '/' + body('#ADR_search_result_data tr').first().find('td').first().attr('onclick').split("'")[1]           
        msg.description = msg.description.replace(pattern,'<a target="_blank" href="' + msg.url_sadr + '">'+site_url+'</a>')
        return cb(null, msg)
    })
  
  } else {
    return cb(null, msg)    
  }

}