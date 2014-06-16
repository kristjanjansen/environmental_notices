### Todo

- Custom marker as in http://leafletjs.com/examples/geojson.html:

  ```
  var item = L.geoJson(null, {
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {icon: L.icon({
              iconUrl: 'images/marker-icon.png',
              iconRetinaUrl: 'images/marker-icon-2x.png',
            })
        });
      }
  }).addTo(map)
  ```

- formattedDate
- urlSource vs url