// ===== E2E SKKL (points only) =====
window.e2ePointsLayer = L.featureGroup();

// --- pane khusus supaya titik selalu di atas garis submarine ---
if (window.map && !map.getPane('e2ePointsPane')) {
  map.createPane('e2ePointsPane');
  map.getPane('e2ePointsPane').style.zIndex = 650; // di atas polyline
}

const e2ePointStyle = {
  pane: 'e2ePointsPane',
  radius: 6,
  fillColor: '#00bcd4',
  color: '#004b56',
  weight: 1,
  opacity: 1,
  fillOpacity: 0.95
};

async function loadE2EPoints(){
  try{
    const res = await fetch('/api/skkl/e2e-points');
    if (!res.ok) throw new Error('HTTP '+res.status);
    const gj  = await res.json();

    e2ePointsLayer.clearLayers();

    const lyr = L.geoJSON(gj, {
      pointToLayer: (f, latlng) => L.circleMarker(latlng, e2ePointStyle),
      onEachFeature: (f, layer) => {
        const nm = f?.properties?.name;
        if (nm) {
          layer.bindTooltip(nm, { permanent:true, direction:'top', className:'label-nama' });
          if (window.labelOn) layer.openTooltip(); else layer.closeTooltip();
          (window.allLabelLayers || (window.allLabelLayers = [])).push(layer);
          if (window.searchablePointsLayer) window.searchablePointsLayer.addLayer(layer);
        }
        layer.on('click', () => {
          window.currentFeature = f;
          window.currentLayer = layer;
          window.currentTableName = 'e2e_skkl';
          const fieldOrder = { field_order: ['name','dokumen_url','fid'] };
          if (typeof buildSidebarContent === 'function' && typeof showSidebar === 'function') {
            const html = buildSidebarContent(f, fieldOrder, layer, 'e2e_skkl');
            showSidebar(html);
          }
          map.setView(layer.getLatLng(), Math.max(map.getZoom(), 8));
        });
      }
    });

    lyr.addTo(e2ePointsLayer);
    setTimeout(()=>{ try{ e2ePointsLayer.bringToFront(); }catch(e){} }, 0);

    console.log('E2E points drawn:', (gj.features||[]).length);
  }catch(e){
    console.error('loadE2EPoints error:', e);
  }
}

// ===== Sinkronkan dengan checkbox "Submarine Cable" (tanpa jadi child) =====
(function attachToSubmarineOverlay(){
  // Pastikan groupLayers.submarineCable sudah ada
  window.groupLayers = window.groupLayers || {};
  if (!groupLayers.submarineCable) groupLayers.submarineCable = L.layerGroup();

  // Saat overlay "Submarine Cable" ditampilkan → tambahkan titik E2E
  map.on('overlayadd', (e)=>{
    if (e.layer === groupLayers.submarineCable) {
      map.addLayer(e2ePointsLayer);
      e2ePointsLayer.bringToFront();
    }
  });
  // Saat overlay disembunyikan → buang titik E2E
  map.on('overlayremove', (e)=>{
    if (e.layer === groupLayers.submarineCable) {
      map.removeLayer(e2ePointsLayer);
    }
  });

  // Kalau saat load awal submarine sudah ON, ikut tampilkan titik
  if (map.hasLayer(groupLayers.submarineCable)) {
    map.addLayer(e2ePointsLayer);
    e2ePointsLayer.bringToFront();
  }
})();

// initial + ikut siklus refresh (jalankan SETELAH refresh lain)
loadE2EPoints();
if (typeof refreshAllLayers === 'function') {
  const _orig = refreshAllLayers;
  window.refreshAllLayers = function(){
    _orig();            // refresh garis dulu
    loadE2EPoints();    // lalu muat titik → tetap di atas & tidak kehapus
  };
} else {
  setInterval(loadE2EPoints, 60000);
}
