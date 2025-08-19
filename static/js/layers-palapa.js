function styleTitik(feature){
  let warna = "#cccccc";
  if (feature.properties.Keterangan === "Kota Interkoneksi") warna = "#00bfff";
  else if (feature.properties.Keterangan === "Kota Layanan") warna = "#ffff00";
  return { radius:6, fillColor:warna, color:"#000", weight:1, opacity:1, fillOpacity:.8 };
}
function styleAlur(feature){
  if (feature.properties.Description) return { color:"#ff9800", weight:2, opacity:.7 };
  const v = parseFloat(feature.properties["Okupansi Telkom (%)"]);
  let warna = "gray";
  if (!isNaN(v)) warna = (v>80) ? "red" : (v>=50) ? "yellow" : "green";
  return { color:warna, weight:3, opacity:.8 };
}

window.loadGeoJsonFromAPI = function(url, type='point', targetGroup){
  fetch(url).then(r=>r.json()).then(data=>{
    targetGroup.clearLayers();
    const kotaMicrowave = ["Sami","Burmeso","Elelim","Wamena","Kenyam","Sumohai","Dekai","Oksibil","Kobagma","Tiom","Karubaga","Mulia","Kepi Tower","Ilaga","Sugapa","Enarotali"];

    const layer = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => {
        if (type==='point' && kotaMicrowave.includes(feature.properties.Nama)) return L.marker(latlng, { icon: microwaveIcon });
        if (type==='point') return L.circleMarker(latlng, styleTitik(feature));
      },
      style: type==='alur' ? styleAlur : undefined,
      onEachFeature: function(feature, layer){
        // klik: buka sidebar + simpan context
        layer.on('click', (e)=>{
          L.DomEvent.stopPropagation(e);
          window.currentFeature = feature; window.currentLayer = layer;
          if (type==='alur'){
            if (url.includes('/alur/barat')) window.currentTableName = 'Palapa_Ring_Barat_Alur';
            else if (url.includes('/alur/tengah')) window.currentTableName = 'Palapa_Ring_Tengah_Alur';
            else if (url.includes('/alur/timur'))  window.currentTableName = 'Palapa_Ring_Timur_Alur';
          }
          showSidebar(buildSidebarContent(feature, data, layer, window.currentTableName));
          if (layer.getBounds) map.fitBounds(layer.getBounds(), { maxZoom: 9 });
          else if (layer.getLatLng) map.setView(layer.getLatLng(), 9);
        });

        // label titik
        if (type==='point' && feature.properties.Nama){
          layer.bindTooltip(feature.properties.Nama, { permanent:true, direction:'top', className:'label-nama' });
          if (window.labelOn) layer.openTooltip(); else layer.closeTooltip();
          window.allLabelLayers.push(layer);
          layer.options.title = feature.properties.Nama;
        }
      }
    });

    layer.addTo(targetGroup);
    layer.eachLayer(l => searchablePointsLayer.addLayer(l));
  })
  .catch(err => console.error("Failed to load:", url, err));
};

window.refreshAllLayers = function(){
  searchablePointsLayer.clearLayers();
  window.allLabelLayers = [];
  ['Barat','Tengah','Timur'].forEach(proj=>{
    const group = groupLayers[`PalapaRing${proj}`];
    loadGeoJsonFromAPI(`${BASE}/alur/${proj.toLowerCase()}`,  "alur",  group.alur);
    loadGeoJsonFromAPI(`${BASE}/point/${proj.toLowerCase()}`, "point", group.point);
    setTimeout(()=>{ group.all.clearLayers(); group.all.addLayer(group.alur); group.all.addLayer(group.point); }, 200);
  });
  loadGeoJsonFromAPI(`${BASE}/alur/submarine`, "alur", groupLayers.submarineCable);
};

// First load + interval refresh
refreshAllLayers(); setInterval(refreshAllLayers, 30000);
