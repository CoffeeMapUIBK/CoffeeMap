document.addEventListener('DOMContentLoaded', function () {
    if (typeof countries === 'undefined') {
        console.error('Countries data is not loaded.');
        return;
    }

    if (typeof refills === 'undefined') {
        console.error('Refills data is not loaded.');
        return;
    }

    var map = L.map('map').setView([20, 0], 2); // Center the map for a global view

    // Add a basic tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Variables for the selected year and data type
    var selectedYear = '2016';
    var selectedData = 'Total.Cup.Points';

    // Function to get data for a specific year and data type
    function getDataForYear(ratings, year, dataType) {
        if (!ratings || !Array.isArray(ratings)) {
            return null;
        }
        var dataEntry = ratings.find(r => r.Year == year);
        if (!dataEntry) {
            return null;
        }
        return dataEntry.Data[dataType] || null;
    }

    // Function to get the min and max values for the selected data type and year
    function getMinMaxValues(countries, year, dataType) {
        var values = countries.features.map(function (feature) {
            return getDataForYear(feature.properties.ratings, year, dataType);
        }).filter(function (value) {
            return value !== null;
        });

        if (values.length === 0) {
            return { min: 0, max: 0 }; // Default to 0 to avoid errors
        }

        var min = Math.min.apply(Math, values);
        var max = Math.max.apply(Math, values);

        return { min: min, max: max };
    }

    // Color based on data value and dynamically calculated scale
    function getColor(value, min, max) {
        if (value === null) return '#FFEDA0'; // Default color for NA
        var scale = (value - min) / (max - min);
        return scale > 0.8 ? '#800026' :
            scale > 0.6 ? '#BD0026' :
                scale > 0.4 ? '#E31A1C' :
                    scale > 0.2 ? '#FC4E2A' :
                        scale > 0.1 ? '#FD8D3C' :
                            '#FEB24C';
    }

    // Function to update the map with new data
    function updateMap() {
        var minMax = getMinMaxValues(countries, selectedYear, selectedData);
        coffeeStatsLayer.eachLayer(function (layer) {
            var feature = layer.feature;
            var value = getDataForYear(feature.properties.ratings, selectedYear, selectedData);
            layer.setStyle({
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7,
                fillColor: getColor(value, minMax.min, minMax.max)
            });
            layer.bindPopup('Country: ' + (feature.properties.ADMIN || 'Unknown') + '<br>Value (' + selectedYear + '): ' + (value !== null ? value : 'NA'));
        });
    }

    // GeoJSON layer for coffee statistics
    var coffeeStatsLayer = L.geoJson(countries, {
        style: function (feature) {
            var minMax = getMinMaxValues(countries, selectedYear, selectedData);
            var value = getDataForYear(feature.properties.ratings, selectedYear, selectedData);
            return {
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7,
                fillColor: getColor(value, minMax.min, minMax.max)
            };
        },
        onEachFeature: function (feature, layer) {
            var value = getDataForYear(feature.properties.ratings, selectedYear, selectedData);
            layer.bindPopup('Country: ' + (feature.properties.ADMIN || 'Unknown') + '<br>Value (' + selectedYear + '): ' + (value !== null ? value : 'NA'));
        }
    }).addTo(map);

    // Placeholder layers for coffee shops and cup exchanges
    var coffeeShopsLayer = L.layerGroup().addTo(map);

    // Define a custom coffee icon for the refill stations
    var coffeeIcon = L.icon({
        iconUrl: 'icons/coffee.png', // Replace with the path to your coffee icon image
        iconSize: [32, 37], // Size of the icon
        iconAnchor: [16, 37], // Point of the icon which will correspond to marker's location
        popupAnchor: [0, -28] // Point from which the popup should open relative to the iconAnchor
    });

    // MarkerCluster group for cup exchanges
    var cupExchangesCluster = L.markerClusterGroup();

    // GeoJSON layer for cup exchanges with enhanced popup information
    var cupExchangesLayer = L.geoJson(refills, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, { icon: coffeeIcon });
        },
        onEachFeature: function (feature, layer) {
            var props = feature.properties;
            var popupContent = '<b>' + (props.name || 'Unknown Station') + '</b><br>' +
                'Address: ' + (props.Straße || 'No Address') + '<br>' +
                'URL: ' + (props.URL || "No Link");
            layer.bindPopup(popupContent);
        }
    });

    // Add the cup exchanges layer to the cluster group
    cupExchangesCluster.addLayer(cupExchangesLayer);
    map.addLayer(cupExchangesCluster);

    // Layers control to toggle on and off the coffee statistics and places layers
    var baseLayers = {};
    var overlays = {
        "Coffee Statistics": coffeeStatsLayer,
        "Nearby Coffee Shops": coffeeShopsLayer,
        "Nearby Cup Exchanges": cupExchangesCluster
    };

    L.control.layers(baseLayers, overlays).addTo(map);

    // Event listeners for the dropdown and slider
    document.getElementById('dataSelector').addEventListener('change', function (e) {
        selectedData = e.target.value;
        updateMap();
    });

    document.getElementById('yearSlider').addEventListener('input', function (e) {
        selectedYear = e.target.value;
        document.getElementById('yearLabel').innerText = selectedYear;
        updateMap();
    });

    // Initial map update
    updateMap();
});
