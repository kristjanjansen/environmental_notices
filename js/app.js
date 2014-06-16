// Setting up map and layers

var map = L.map('map', {
  zoomControl: true,
  attributionControl: false,
  center: [0,0],
  zoom: 11
});

var gmap = new L.Google('HYBRID', {
    minZoom: 0, 
    maxZoom: 13
});
map.addLayer(gmap);

var orto = new L.tileLayer('http://kaart.maakaart.ee/orto/{z}/{x}/{y}.jpeg', {
  attribution: 'Maa-amet',
  minZoom: 14, 
  maxZoom: 19
}).addTo(map);

var item = L.geoJson().addTo(map)

// Handling frontpage route

routie('', function() { 
    $('#intro').html(Mustache.render($('#template_intro').html()))
})

// Handling notice route

routie(':year/:week/:id', function(year, week, id) {
    var file = './data/' + year + '-' + week + '.geojson'
    $.getJSON(file, function(data) {
        data.features.forEach(function(feature) {
            if (feature.properties.id == id) {
                $('#intro').hide()
                item.clearLayers()
                item.addData({"type":"FeatureCollection","features":[feature]})
                map.panTo([feature.properties.geo.lat, feature.properties.geo.lng])
                // @todo fix date
                feature.properties.date = feature.properties.date.split('T')[0]
                $('#sidebar').html(Mustache.render($('#template_sidebar').html(), {item: feature.properties}))                
            } else {
                // @todo error handl            
            }
        })
    })
    
})