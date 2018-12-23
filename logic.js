var API_quakes = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
//console.log (API_quakes)
var API_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
//console.log (API_plates)

//multiply the marker size by const
function markerSize(magnitude) {
    return magnitude * 3.5;
};

// create eq layer
var earthquakes = new L.LayerGroup();


d3.json(API_quakes, function (geoJson) {
    L.geoJSON(geoJson.features, {
        pointToLayer: function (geoJsonPoint, latlng) {
            return L.circleMarker(latlng, { radius: markerSize(geoJsonPoint.properties.mag) });
        },

        style: function (geoJsonFeature) {
            return {
                fillColor: Color(geoJsonFeature.properties.mag),
                fillOpacity: 0.8,
                weight: 0.1,
                color: 'gray'

            }
        },

        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "<h4 style='text-align:center;'>" + new Date(feature.properties.time) +
                "</h4><hr><h5 style='text-align:center;'>" + feature.properties.title + "</h5>");
        }
    }).addTo(earthquakes);
    createMap(earthquakes);
});

var plateBoundary = new L.LayerGroup();

// fraxen data - outlines the tectonic plates
d3.json(API_plates, function (geoJson) {
    L.geoJSON(geoJson.features, {
        style: function (geoJsonFeature) {
            return {
                weight: 3,
                color: 'hotpink'
            }
        },
    }).addTo(plateBoundary);
})

function Color(magnitude) {
    if (magnitude >= 5) {
        return 'red'
    } else if (magnitude >= 4) {
        return 'darkorange'
    } else if (magnitude >= 3) {
        return 'yellow'
    } else if (magnitude >= 2) {
        return 'limegreen'
    } else if (magnitude >= 1) {
        return 'green'
    } else {
        return 'aqua'
    }
};

function createMap() {

    var streetMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Maps Created with: <a href="http://openstreetmap.org">OpenStreetMap</a>,<a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 20,
        id: 'mapbox.streets',
        accessToken: API_KEY
    });

    var ContrastMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Maps Created with: <a href="http://openstreetmap.org">OpenStreetMap</a>,<a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 20,
        id: 'mapbox.high-contrast',
        accessToken: API_KEY
    });

    var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Maps Created with: <a href="http://openstreetmap.org">OpenStreetMap</a>,<a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 20,
        id: 'mapbox.satellite',
        accessToken: API_KEY
    });

    var nightMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Maps Created with: <a href="http://openstreetmap.org">OpenStreetMap</a>,<a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 20,
        id: 'mapbox.dark',
        accessToken: API_KEY
    });

    var baseLayers = {
        "Contrast": ContrastMap,
        "Street Level": streetMap,
        "Night Map": nightMap,
        "Satellite": satellite
    };

    var overlays = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": plateBoundary,
    };

    var mymap = L.map('mymap', {
        center: [40, -100],
        zoom: 4.3,
        layers: [streetMap, earthquakes, plateBoundary]
    });

    L.control.layers(baseLayers, overlays).addTo(mymap);

    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        // DomUtil.create creates an HTML element with tagName, sets its class to className, 
        // and optionally appends it to container element
        var div = L.DomUtil.create('div', 'info legend'),
            magnitude = [0, 1, 2, 3, 4, 5],
            labels = [];

        div.innerHTML += "<h4 style='margin:5px'>Magnitude</h4>"

        for (var i = 0; i < magnitude.length; i++) {
            div.innerHTML +=
                '<i style="background:' + Color(magnitude[i] + 1) + '"></i> ' +
                magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
        }

        return div;
    };
    legend.addTo(mymap);
}