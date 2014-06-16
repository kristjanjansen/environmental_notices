var fs = require('fs')
var moment = require('moment')
var jsonstream = require('JSONStream');
var mustache = require('mustache')
var nodemailer = require('nodemailer')

var config = require('./config/config')

moment.lang('et');

var m = moment().subtract('weeks', 1)
var key = m.year() + '-' + m.isoWeek()
var format = 'D. MMMM YYYY'

var stream = fs.createReadStream('data/' + key + '.geojson', {encoding: 'utf8'})
var parser = jsonstream.parse('features.*')

var rows = []

parser.on('data', function (msg) {
      var row = {}
      row.id = msg.properties.id
      row.url = msg.properties.url
      row.type = msg.properties.type
      row.description = msg.properties.description
      row.geo = msg.properties.geo
      row.date = moment(msg.properties.date).format(format)
      row.year = m.year()
      row.week = m.isoWeek()
      row.priority = msg.properties.priority
      rows.push(row)
});

stream.on('end',function () {
    fs.readFile('./lib/mailer.mustache', {encoding: 'utf8'}, function(err, template) {
        rows = rows.sort(function(a, b){return b.priority - a.priority});
        
        var mailOptions = {
            from: config.mailFrom,
            to: config.mailTo, 
            subject: 'Keskkonnateated ' + m.startOf('week').format(format) + ' - ' + m.endOf('week').format(format),
            html: mustache.render(template, {rows: rows})
          }
          
          //console.log(mailOptions.html)
         
          
          var mailTransport = nodemailer.createTransport("SMTP", {
              service: "Gmail",
              auth: {
                  user: config.mailUsername,
                  pass: config.mailPassword
              }
          });        
        
          mailTransport.sendMail(mailOptions, function(err, res) {
            if (err) throw err
            console.log(res)
            mailTransport.close();
          });
        
        
    })
}).pipe(parser)
