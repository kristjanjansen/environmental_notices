var request = require('request')
var $ = require('cheerio')
var utils = require('../lib/utils')

exports.waste = function(msg, cb) {
   
  var pattern = /L\.JÄ(\/|.LV-)\d{6,}/g
  
  var matches = msg.description.match(pattern)
  if (matches) {

    msg.permitId = matches[0] 
    
    getPermitPage(msg.permitId, function(err, page) {

      if (err) { cb(err) }
          
      if (page) {

       var body = $.load(page.body)    
       var permit = {}

       msg.permitUrl = page.url
       msg.description = msg.description.replace(pattern,'<a target="_blank" href="' + msg.permitUrl + '">' + msg.permitId + '</a>')
       
       url = 'http://klis2.envir.ee/' + body('.relation_heading_row').eq(2).parent().find('.list_data a').eq(0).attr('href')
           
       request.get(url, function (err, res, body) {
         
         if (err) { cb(err) }
         
         var body = $.load(body);         
         point = body('#global_table_layer td').eq(2).find('td').text().match(/(\d+)/g)
         if (point) { 
             msg.permitGeo = utils.LestToGeo([point[1],point[0]])
         }
         // @todo verify
         msg.permitAddress = body('#global_table_layer td').eq(0).find('td').text()
         msg.permitCadasterId = body('#global_table_layer td').eq(3).find('td').text()
         msg.description = msg.description.replace(pattern,'<a target="_blank" href="' + msg.permitUrl + '">' + msg.permitId + '</a> (' + msg.permitAddress + ' ' + msg.permitCadasterId + ')')
         
         
         return cb(null, msg)
       
       })                      
      } else {

        return cb(null, msg)
        
      }
      
     })
 
  } else {
   return cb(null, msg)    
 }
}


exports.complex = function(msg, cb) {
  
  var pattern = /KKL\/\d{6,}/g
  
  var matches = msg.description.match(pattern)
  if (matches) {

    msg.permitId = matches[0] 
    
    getPermitPage(msg.permitId, function(err, page) {
  
      if (err) { cb(err) }
          
      if (!err && page) {          
          var body = $.load(page.body)    
          msg.permitUrl = page.url       
          var x = body('#exp_col_layer_3048 tr:nth-child(9) td').text()
          var y = body('#exp_col_layer_3048 tr:nth-child(8) td').text()
          if (x && y) {
              var geo = utils.LestToGeo({x:x,y:y})       
              msg.permitGeo = geo
          }
          msg.description = msg.description.replace(pattern,'<a target="_blank" href="' + msg.permitUrl + '">' + msg.permitId + '</a>')
      }
       return cb(null, msg)

     })
 
  } else {
   return cb(null, msg)    
 }
}


exports.air = function(msg, cb) {
  
  var pattern = /L\.ÕV(\/|\.VÕ\-|\.HA\-)\d{6,}/g  
  var matches = msg.description.match(pattern)
  if (matches) {

    msg.permitId = matches[0] 
    
    getPermitPage(msg.permitId, function(err, page) {

      if (err) { cb(err) }
      
      if (!err && page) {

       var body = $.load(page.body)    
       var x = body('#exp_col_layer_1566 tr:nth-child(4) td').text()
       var y = body('#exp_col_layer_1566 tr:nth-child(3) td').text()
       
       if (x && y) {
         msg.permitGeo = utils.LestToGeo({x:x,y:y})
       }

       msg.permitUrl = page.url
       msg.description = msg.description.replace(pattern,'<a target="_blank" href="' + msg.permitUrl + '">' + msg.permitId + '</a>')
       
     }
       return cb(null, msg)

     })
 
  } else {
   return cb(null, msg)    
 }
}



exports.water = function(msg, cb) {
  
  // @todo Different coordinates 
  // L.VV/300213 
  // L.VV.LÄ-166343 
  // L.VV.HA-183003
  
  var matches = msg.description.match(/(põhjave|puurkaev|vee võtm)/g)
  
  if (matches) {
    msg.priority = 0
  }
  
  var pattern = /L\.(VV\/|LÄ\-|VV\.HA\-)\d{6,}/g  
  var matches = msg.description.match(pattern)
  if (matches) {

    msg.permitId = matches[0] 
    
    getPermitPage(msg.permitId, function(err, page) {
      
      if (err) { cb(err) }
      
      if (!err && page) {
       var body = $.load(page.body)    
       msg.permitUrl = page.url       
       msg.description = msg.description.replace(pattern,'<a target="_blank" href="' + msg.permitUrl + '">' + msg.permitId + '</a>')
      }
      return cb(null, msg)

     })
 
  } else {
   return cb(null, msg)    
 }
}




function getPermitPage(permitId, cb) {

var permit_site_url = 'http://klis2.envir.ee' 
  
request.post(
    permit_site_url,
    { 
      form: { 
        search: 'Otsi',
        field_674766_search_type: 'CO',
        field_1063_search_type: 'CO',
        field_1063_search_value: permitId,
        field_70599_search_type: 'CO',
        field_1066_search_type: 'CO',
        field_1077_search_type: 'CO',
        page: 'klis_pub_list_dynobj',
        tid: '1031'
      } 
    },
    function (err, res, body) {
      if (err) { cb(err) }
      
        if (!err && res.statusCode == 200) {
            var body = $.load(body)
            var link = body('.list_data td:first-child a')
            var permit_type = link.text()
            var url = permit_site_url + link.attr('href')
            
            if (permit_type) {   
              request.get(url, function (err, res, body) {
                if (err) { cb(err) }
                return cb(null, {url: url, body:body})                                
              })
            } else {
              return cb(null)
            }
        }
      })
}