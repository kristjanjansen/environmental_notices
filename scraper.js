var async = require('async')
var request = require('request')
var moment = require('moment')
var $ = require('cheerio')

var types = require('./lib/types')
var queue = require('./lib/queue')

var site = 'http://www.ametlikudteadaanded.ee/'
var start = (((5 || 1) - 1) * 10) + 1
var stop = (((8 || 1) - 1) * 10) + 11 + (start - 1)
var urls = []
for (var i = start; i < stop; i = i + 10) {
  urls.push(site + '/' + 'index.php?act=1&salguskpvavald=' + moment().subtract('M', 1).format('DD.MM.YYYY') + '&sloppkpvavald=' + moment().format('DD.MM.YYYY') + '&steateliigid=' + types.ids() + '&srange=' + i + '-' + (i + 9));
}

async.eachLimit(urls, 1, 
    function(url, cb) {
        var i = 0        
        request({url: url, encoding: 'binary'}, function (err, r, body) {
            if (err) throw err
            body = $.load(body)
            async.eachLimit(body('table[cellpadding=3] tr').toArray(), 1, 
                function(row, cb) {
                    if (i++ % 3 == 0) {
                        var url = $(row).find('td.right a').attr('href')
                        if (url) {
                       
                            msg = {}
                            msg.url = site + url
                            msg.id = url.split('=')[url.split('=').length - 1] + '-0'
                            msg.date = moment($(row).find('td[width=85]').text().trim(), 'DD.MM.YYYY').format('YYYY-MM-DDTHH:mm:ssZ');
                            msg.type = $(row).find('td.teateliik').text().trim();
                            msg.description = $(row).next().find('td[colspan=4]').text().trim().replace("'", "''");
                            msg.priority = types.types.filter(function(item) {
                                return item.name === msg.type
                            })[0].priority
                            var pattern = /\b[1-2]?[0-9]\.\s(.+)\n/gi
                            var matches = msg.description.match(pattern)
                            if (matches && msg.type == 'Maa riigi omandisse jätmise teated') {
                              
                                matches.forEach(function(match, idx) {
                                    msg.id = msg.id.substr(0, msg.id.length - 1) + (idx + 1) // @todo fix it
                                    msg.description = match 
                                    queue.push(msg, function(err) { cb(err) })
                                })
                                
                            } else {
                                queue.push(msg, function(err) { cb(err) })
                            }
                        }  
                    }
                    cb(err)
                    
            },    
            function(err) {
                cb(err)
            })
        })  
    },
    function(err) {
        if (err) {
            console.log(JSON.stringify(err))
        }     
    }
)


