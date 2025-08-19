// Basemap
window.baseLayers = {
  "Google Satellite": L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { attribution: 'Google Satellite' }),
  "OpenStreetMap":   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' })
};
