
var map = L.map('map').setView([20, 0], 2); // Center the map for a global view

// Add a basic tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Basic style for each country
function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.production)
    };
}

// Color based on production value
function getColor(production) {
    return production > 50000 ? '#800026' :
        production > 20000 ? '#BD0026' :
            production > 10000 ? '#E31A1C' :
                production > 5000 ? '#FC4E2A' :
                    production > 1000 ? '#FD8D3C' :
                        production > 500 ? '#FEB24C' :
                            '#FFEDA0';
}

// Assign random production values to each country, hacking for now :) 
countries.features.forEach(function (feature) {
    feature.properties.production = Math.floor(Math.random() * 60000);
});

L.geoJson(countries, {
    style: style,
    onEachFeature: function (feature, layer) {
        layer.bindPopup('Country: ' + (feature.properties.ADMIN || 'Unknown') + '<br>Production: ' + feature.properties.production);
    }
}).addTo(map);
