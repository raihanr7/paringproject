// Toggle label
window.toggleLabels = function(){
  window.labelOn = !window.labelOn;
  window.allLabelLayers.forEach(l => {
    if (!l.getTooltip) return;
    if (window.labelOn) l.openTooltip(); else l.closeTooltip();
  });
};

// Tombol History
L.Control.HistoryIcon = L.Control.extend({
  onAdd: function(){
    const btn = L.DomUtil.create('a', '');
    btn.href = '/history'; btn.innerHTML = '⏳'; btn.title = 'Update History';
    btn.style.fontSize = '20px'; btn.style.padding = '4px';
    const c = L.DomUtil.create('div', 'leaflet-bar leaflet-control'); c.appendChild(btn);
    return c;
  }
});
new L.Control.HistoryIcon({ position:'topleft' }).addTo(map);

// Tombol Label
L.Control.LabelIcon = L.Control.extend({
  onAdd: function(){
    const btn = L.DomUtil.create('a', '');
    btn.href = '#'; btn.innerHTML = '🏷️'; btn.title = 'On/Off Label';
    btn.style.fontSize = '21px'; btn.style.padding = '2px';
    btn.onclick = function(e){ e.preventDefault(); toggleLabels(); };
    const c = L.DomUtil.create('div', 'leaflet-bar leaflet-control'); c.appendChild(btn);
    return c;
  }
});
new L.Control.LabelIcon({ position:'topleft' }).addTo(map);

// SEARCH
const searchCtl = new L.Control.Search({
  position: 'topleft', layer: searchablePointsLayer, propertyName: 'title',
  marker: false, textPlaceholder: 'Cari nama lokasi...', textErr: 'Lokasi tidak ditemukan',
  moveToLocation: function (latlng, title, map) { map.setView(latlng, 10); }
});
map.addControl(searchCtl);
// Jangan tampilkan search layer di peta
if (map.hasLayer(searchablePointsLayer)) map.removeLayer(searchablePointsLayer);

// GEOMAN control minimal (draw marker + polyline, removal)
map.pm.addControls({
  position:'topleft', drawCircle:false, drawCircleMarker:false, drawMarker:true,
  drawRectangle:false, drawPolygon:false, drawText:false, drawPolyline:true,
  editMode:false, dragMode:false, cutPolygon:false, removalMode:true, rotateMode:false
});

// SCREENSHOTTER
L.simpleMapScreenshoter({
  cropImageByInnerWH:true, hidden:false, preventDownload:false,
  hideElementsWithSelectors:['body > *:not(#map)'],
  domtoimageOptions:{ bgcolor:'#ffffff', style:{ transform:'scale(1)', transformOrigin:'top left' } },
  screenName:'skkl-map', position:'topright'
}).addTo(map);
