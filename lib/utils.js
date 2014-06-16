var p4js = require("proj4")
require('proj4js-defs')(p4js)

exports.LestToGeo = function(lest) {
  
      var src = new p4js.Proj(p4js.defs['EPSG:3301'])
      var dst = new p4js.Proj(p4js.defs['EPSG:4326'])
      var geo = p4js.transform(src, dst, lest)
      return ({lat: geo.y, lng: geo.x})

}
