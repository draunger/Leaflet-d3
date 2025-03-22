 // Initialize the map
 var map = L.map('map').setView([14.0860746, 100.608406], 12);

 // Add OSM Tile Layer
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
 }).addTo(map);

 // Check if Geolocation is supported
 if (!navigator.geolocation) {
     console.log("Your browser doesn't support geolocation!");
 } else {
     setInterval(() => {
         navigator.geolocation.getCurrentPosition(getPosition);
     }, 5000);
 }

 let marker, circle;

 // Path tracking array
 let path = [];
 let pathLine;

 // Function to update location
 function getPosition(position) {
     const lat = position.coords.latitude;
     const lng = position.coords.longitude;
     const accuracy = position.coords.accuracy;

     // Remove previous layers
     if (marker) map.removeLayer(marker);
     if (circle) map.removeLayer(circle);
     if (pathLine) map.removeLayer(pathLine);

     // Add marker and circle
     marker = L.marker([lat, lng], { draggable: true }).addTo(map);
     circle = L.circle([lat, lng], { radius: accuracy, color: 'blue', fillOpacity: 0.2 }).addTo(map);

     // Path tracking
     path.push([lat, lng]);
     pathLine = L.polyline(path, { color: 'red' }).addTo(map);

     // Update map view and info panel
     var featureGroup = L.featureGroup([marker, circle, pathLine]);
     map.fitBounds(featureGroup.getBounds());

     updateInfoPanel(lat, lng, accuracy);

     // D3.js circle animation
     animateD3Circle(lat, lng, accuracy);

     // Update coordinates on drag
     marker.on('dragend', (event) => {
         const newCoords = event.target.getLatLng();
         updateInfoPanel(newCoords.lat, newCoords.lng, accuracy);
     });

     console.log(`Location: Lat: ${lat}, Lng: ${lng}, Accuracy: ${accuracy}`);
 }

 // Function to update info panel
 function updateInfoPanel(lat, lng, accuracy) {
     const infoPanel = document.getElementById('coordinates');
     infoPanel.innerHTML = `
         <strong>φ (Latitude):</strong> ${lat.toFixed(6)}<br>
         <strong>λ (Longitude):</strong> ${lng.toFixed(6)}<br>
         <strong>Accuracy:</strong> ${accuracy.toFixed(2)} meters
     `;
 }

 // D3.js Circle Animation
 function animateD3Circle(lat, lng, accuracy) {
     d3.select("#d3-circle").remove();

     // Map projection
     const point = map.latLngToLayerPoint([lat, lng]);

     // Add SVG Layer
     const svg = d3.select(map.getPanes().overlayPane)
         .append("svg")
         .attr("id", "d3-circle")
         .style("position", "absolute")
         .style("left", "0px")
         .style("top", "0px")
         .style("width", map.getSize().x + "px")
         .style("height", map.getSize().y + "px");

     const g = svg.append("g")
         .attr("transform", `translate(${point.x}, ${point.y})`);

     // Animated circle
     g.append("circle")
         .attr("r", 0)
         .attr("fill", "rgba(0, 255, 0, 0.5)")
         .transition()
         .duration(2000)
         .attr("r", accuracy / 2)
         .style("opacity", 0)
         .on("end", () => svg.remove());
 }