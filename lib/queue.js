var fs = require('fs')
var async = require('async')
var moment = require('moment')
var jsonstream = require('JSONStream')

var parseText = require('../lib/parseText')
var parseCadaster = require('../lib/parseCadaster')
var parsePermit = require('../lib/parsePermit')
var parseSADR = require('../lib/parseSADR')

var q = async.queue(function (task, cb) {
    async.waterfall([
            function(cb){cb(null, task)}, 
                parseText.shortDescription, 
                parseText.importance, 
                parseCadaster.id,
                parseText.businessRegister,
                parsePermit.waste,
                parsePermit.complex,
                parsePermit.air,
                parsePermit.water,
                parseSADR.getUrls, 
                parseText.linebreaks,
        ], function (err, result) {
            if (err) cb(err)
            saveData(result, cb)
    });
}, 10);

var writers = {}

function saveData(data, cb) {
    var m = moment(data.date)
    var key = m.year() + '-' + m.isoWeek()
    if (!writers[key]) {
        writers[key] = jsonstream.stringify('{"type":"FeatureCollection","features":[', ',\n', ']}')
        writers[key].pipe(fs.createWriteStream('data/' + key + '.geojson', {encoding: 'utf8'}))
    }
    var feature = {}
    feature.type = 'Feature'
    feature.properties = data
    var coord = (data.geo && data.geo.lng && data.geo.lat) ? [data.geo.lng, data.geo.lat] : [0,0]
    feature.geometry = {'type': 'Point', 'coordinates': coord}
    writers[key].write(feature)
    cb()
}

q.drain = function() {
    for (var key in writers) {
        if (writers.hasOwnProperty(key)) {
            writers[key].end()
        }
    }
}


module.exports = q