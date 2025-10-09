// Basemap 
// Basemap yang digunakan yayaya
// Berikut sudah disediakan beberapa basemap. Silakan hapus tanda "//" untuk mengappply layer basemap yang akan digunakan
window.baseLayers = {
  "Google Satellite": L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { attribution: 'Google Satellite' }),
  "OpenStreetMap":   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }), 
  //"CartoDB Positron": L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { attribution: '&copy; OSM contributors &copy; CARTO', subdomains: "abcd" }),
  //"CartoDB Dark Matter": L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { attribution: '&copy; OSM contributors &copy; CARTO', subdomains: "abcd" }),
  //"Esri World Imagery": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { attribution: 'Tiles &copy; Esri — Sources: Esri, Maxar, Earthstar Geographics, and others' }),
  //"Esri World StreetMap": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", { attribution: 'Tiles &copy; Esri — Sources: Esri, HERE, Garmin, (c) OSM contributors, and others' }),
  //"Esri World TopoMap": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", { attribution: 'Tiles &copy; Esri — Sources: Esri, HERE, Garmin, (c) OSM contributors, and others' }),
  //"OpenTopoMap": L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", { attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (&copy; OSM contributors)', subdomains: "abc" }),

};
