let tempMarker = null, tempLatLng = null;

// Saat gambar marker/polyline
map.on('pm:create', function(e){
  if (e.layer instanceof L.Marker){
    tempMarker = e.layer; tempLatLng = e.layer.getLatLng();
    document.getElementById('markerModal').style.display = '';
    document.getElementById('kategoriInput').value = '';
    document.getElementById('siteInput').value = '';
    document.getElementById('descInput').value = '';
  }
  if (e.layer instanceof L.Polyline){
    const latlngs = e.layer.getLatLngs();
    let total = 0; for (let i=1;i<latlngs.length;i++) total += latlngs[i-1].distanceTo(latlngs[i]);
    e.layer.bindPopup("Jarak total: " + (total/1000).toFixed(2) + " km").openPopup();
  }
});

// Submit modal tambah marker
document.getElementById('markerForm').onsubmit = function(ev){
  ev.preventDefault();
  const kategori = document.getElementById('kategoriInput').value;
  const site = document.getElementById('siteInput').value;
  const description = document.getElementById('descInput').value;
  if (!kategori || !site || !description){ alert('Semua field wajib diisi.'); return; }

  fetch('/api/tambah-marker', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ kategori, lat: tempLatLng.lat, lng: tempLatLng.lng, site, description })
  }).then(r=>r.json()).then(data=>{
    document.getElementById('markerModal').style.display = 'none';
    if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
    if (data.success){
      alert('Marker berhasil ditambah!');
      if      (kategori==='linksatelit') loadLinkSatelitLayer();
      else if (kategori==='backup')      loadBackupLinkLayer();
      else if (kategori==='repair2025')  loadSKKLRepairLayer();
      else if (kategori==='fo_cut')      loadFoCutLayer();
    }else alert('Gagal menambah marker!');
  }).catch(()=> alert('Gagal koneksi ke server!'));
};

// Batal modal
document.getElementById('batalMarker').onclick = function(){
  document.getElementById('markerModal').style.display = 'none';
  if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
};

// Hapus marker via tombol popup
window.hapusMarker = function(kategori, id){
  if (!confirm('Yakin ingin menghapus marker ini?')) return;
  fetch('/api/delete-marker', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ kategori, id })
  }).then(r=>r.json()).then(data=>{
    if (data.success){
      alert('Berhasil dihapus!');
      if      (kategori==='linksatelit') loadLinkSatelitLayer();
      else if (kategori==='backup')      loadBackupLinkLayer();
      else if (kategori==='repair2025')  loadSKKLRepairLayer();
      else if (kategori==='fo_cut')      loadFoCutLayer();
    }else alert('Gagal hapus marker!');
  });
};

// Drag end update posisi marker
map.on('pm:dragend', async e=>{
  if (!(e.layer instanceof L.Marker)) return;
  const { feature } = e.layer;
  if (!feature?.properties?.id) return;
  const kategori = feature.properties.kategori;
  const { lat, lng } = e.layer.getLatLng();
  try{
    const res = await fetch('/api/update-marker', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ kategori, id: feature.properties.id, lat, lng })
    });
    const data = await res.json();
    if (data.success){
      alert('Posisi marker berhasil diperbarui!');
      if      (kategori==='linksatelit') loadLinkSatelitLayer();
      else if (kategori==='backup')      loadBackupLinkLayer();
      else if (kategori==='repair2025')  loadSKKLRepairLayer();
      else if (kategori==='fo_cut')      loadFoCutLayer();
    } else alert('Gagal update lokasi di database: ' + (data.error || ''));
  }catch{ alert('Gagal koneksi ke server'); }
});
