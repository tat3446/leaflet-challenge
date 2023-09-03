// Create the base layers for map
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

let sat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    attribution: 'Copyright Google Maps. ThanksToGoogleMap',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Create our map, giving it the streetmap and topography layers to display on load
let myMap = L.map("map", {
    center: [40.7, -94.5],
    zoom: 3,
    layers: [street, topo, sat]
});

// Create a baseMaps object
let baseMaps = {
    "Street Map": street,
    "Satellite": sat,
    "Topographic Map": topo
};

//set variables
let earthquakes = new L.LayerGroup();
let tectonicplates = new L.LayerGroup();

// Create an overlay object to hold our overlay
let overlayMaps = {
    "Tectonic Plates": tectonicplates,
    Earthquakes: earthquakes
};

// Create a layer control & pass it our baseMaps and overlayMaps.
// Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);

// Store our API endpoint as queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
    // Create function for style
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }
    // Create function for style
    function getColor(magnitude) {
        if (magnitude > 90) {
            return "#ea2c2c";
        }
        if (magnitude > 70) {
            return "#ea822c";
        }
        if (magnitude > 50) {
            return "#ee9c00";
        }
        if (magnitude > 30) {
            return "#eecc00";
        }
        if (magnitude > 10) {
            return "#d4ee00";
        }
        return "#98ee00";
    }

    // Define a function that will give each earthquake a different size based on its magnitude.
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }

        return magnitude * 4;
    }

    // Binding a circle marker and popup to each layer
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },

        style: styleInfo,

        onEachFeature: function (feature, layer) {
            layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><h3>Magnitude: ${feature.properties.mag}</h3><hr><h3>Depth: ${(feature.geometry.coordinates[2])}</h3>`);
        }
    }).addTo(earthquakes);

    // Adding markers to map
    earthquakes.addTo(myMap)

    // Creating legend for map
    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");

        let grades = [-10, 10, 30, 50, 70, 90];

        let colors = [
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c"];

        for (let i = 0; i < grades.length; i++) {
            div.innerHTML += "<i style='background: "
                + colors[i]
                + "'></i> "
                + grades[i]
                + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };



    // Adding the legend to the map
    legend.addTo(myMap);

    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (platedata) {

        L.geoJson(platedata, {
            color: "orange",
            weight: 2
        }).addTo(tectonicplates);

        tectonicplates.addTo(myMap);
    });

});

