window.loadSKKLRepairLayer = function(){
  fetch('/api/repair/skkl').then(r=>r.json()).then(data=>{
    skklRepairLayer.clearLayers();
    const layer = L.geoJSON(data, {
      pointToLayer: (f, latlng)=> L.marker(latlng, { icon: repairIcon }),
      onEachFeature:(feature, layer)=>{
        feature.properties.kategori = 'repair2025';
        layer.bindPopup(
          `<b>${feature.properties.name || '-'}</b><br>${feature.properties.description || ''}` +
          `<br><button onclick="hapusMarker('repair2025','${feature.properties.id}')" style="margin-top:6px;background:#f44336;color:#fff;border:none;padding:5px 12px;border-radius:5px;cursor:pointer;font-size:13px;">Hapus</button>`
        );
      }
    });
    layer.addTo(skklRepairLayer);
  });
};
window.loadBackupLinkLayer = function(){
  fetch('/api/backup-link').then(r=>r.json()).then(data=>{
    backupLinkLayer.clearLayers();
    const layer = L.geoJSON(data, {
      pointToLayer:(f, latlng)=> L.marker(latlng, { icon: backupLinkIcon }),
      onEachFeature:(feature, layer)=>{
        feature.properties.kategori = 'backup';
        layer.bindPopup(
          `<b>${feature.properties.site || '-'}</b><br>${feature.properties.description || ''}` +
          `<br><button onclick="hapusMarker('backup','${feature.properties.id}')" style="margin-top:6px;background:#f44336;color:#fff;border:none;padding:5px 12px;border-radius:5px;cursor:pointer;font-size:13px;">Hapus</button>`
        );
      }
    });
    layer.addTo(backupLinkLayer);
  });
};
window.loadLinkSatelitLayer = function(){
  fetch('/api/link-satelit').then(r=>r.json()).then(data=>{
    linkSatelitLayer.clearLayers();
    const layer = L.geoJSON(data, {
      pointToLayer:(f, latlng)=> L.marker(latlng, { icon: linkSatelitIcon }),
      onEachFeature:(feature, layer)=>{
        feature.properties.kategori = 'linksatelit';
        layer.bindPopup(
          `<b>${feature.properties.site || '-'}</b><br>${feature.properties.description || ''}` +
          `<br><button onclick="hapusMarker('linksatelit','${feature.properties.id}')" style="margin-top:6px;background:#f44336;color:#fff;border:none;padding:5px 12px;border-radius:5px;cursor:pointer;font-size:13px;">Hapus</button>`
        );
      }
    });
    layer.addTo(linkSatelitLayer);
  });
};
window.loadFoCutLayer = function(){
  fetch('/api/fo-cut/paring').then(r=>r.json()).then(data=>{
    foCutLayer.clearLayers();
    const layer = L.geoJSON(data, {
      pointToLayer:(f, latlng)=> L.marker(latlng, { icon: foCutIcon }),
      onEachFeature:(feature, layer)=>{
        feature.properties.kategori = 'fo_cut';
        layer.bindPopup(
          `<b>${feature.properties.name || '-'}</b><br>${feature.properties.description || ''}` +
          `<br><button onclick="hapusMarker('fo_cut','${feature.properties.id}')" style="margin-top:6px;background:#f44336;color:#fff;border:none;padding:5px 12px;border-radius:5px;cursor:pointer;font-size:13px;">Hapus</button>`
        );
      }
    });
    layer.addTo(foCutLayer);
  });
};

// initial + refresh berkala
loadLinkSatelitLayer(); setInterval(loadLinkSatelitLayer, 30000);
loadSKKLRepairLayer(); setInterval(loadSKKLRepairLayer, 30000);
loadBackupLinkLayer(); setInterval(loadBackupLinkLayer, 30000);
loadSKKLRepair2024Layer(); setInterval(loadSKKLRepair2024Layer, 30000);
loadFoCutLayer(); setInterval(loadFoCutLayer, 30000);
