/* eslint-disable */
export const displayMap = locations => {
    mapboxgl.accessToken =
        'pk.eyJ1IjoidXpvY2hpMSIsImEiOiJjbGtjbm93dGswcXV0M3FtdHl4bjN2cGVqIn0.8fbfZBPKJZZ_eDioZiyCYg';

    var map = new mapboxgl.Map({
        container: 'map',
        scrollZoom: false,
        style: 'mapbox://styles/mapbox/streets-v11',
        // center: [8.6753, 9.0820], // Center coordinates for Nigeria
        // zoom: 6 // Adjust the zoom level as needed
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // Create marker
        const el = document.createElement('div');
        el.className = 'marker';

        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(loc.coordinates)
            .addTo(map);

        // Add popup
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        // Extend map bounds to include current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
};
