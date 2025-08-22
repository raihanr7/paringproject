// ===== markers.js (versi dengan upload evidence di modal) =====

let tempMarker = null, tempLatLng = null;

// (opsional) status teks kecil di modal kalau kamu pakai <div id="markerFileStatus">
function setMarkerStatus(msg) {
  const el = document.getElementById('markerFileStatus');
  if (!el) return;
  if (!msg) { el.style.display = 'none'; el.textContent = ''; return; }
  el.style.display = 'block'; el.textContent = msg;
}

// mapping kategori → nama tabel DB (dipakai fallback kalau server tidak mengembalikan "table")
function tableNameByKategori(kategori) {
  switch (kategori) {
    case 'linksatelit': return 'Link_Satelit';
    case 'backup':      return 'Backup Link';
    case 'repair2025':  return 'SKKL_Repair_2025_BY_DCS';
    case 'fo_cut':      return 'Palapa_Ring_FO_Cut';
    default:            return null;
  }
}

// Saat gambar marker/polyline
map.on('pm:create', function(e){
  if (e.layer instanceof L.Marker){
    tempMarker = e.layer; 
    tempLatLng = e.layer.getLatLng();

    // buka modal & reset field
    document.getElementById('markerModal').style.display = '';
    document.getElementById('kategoriInput').value = '';
    document.getElementById('siteInput').value = '';
    document.getElementById('descInput').value = '';

    // reset file input + status (kalau ada di HTML)
    const fileInput = document.getElementById('markerFileInput');
    if (fileInput) fileInput.value = '';
    setMarkerStatus('');
  }

  if (e.layer instanceof L.Polyline){
    const latlngs = e.layer.getLatLngs();
    let total = 0; 
    for (let i=1;i<latlngs.length;i++) total += latlngs[i-1].distanceTo(latlngs[i]);
    e.layer.bindPopup("Jarak total: " + (total/1000).toFixed(2) + " km").openPopup();
  }
});

// Submit modal tambah marker (+ upload evidence opsional)
document.getElementById('markerForm').onsubmit = async function(ev){
  ev.preventDefault();

  const kategori    = document.getElementById('kategoriInput').value;
  const site        = document.getElementById('siteInput').value;
  const description = document.getElementById('descInput').value;
  const fileInput   = document.getElementById('markerFileInput'); // opsional di HTML

  if (!kategori || !site || !description){ 
    alert('Semua field wajib diisi.'); 
    return; 
  }
  if (!tempLatLng){ 
    alert('Koordinat belum dipilih. Klik peta untuk menaruh marker.'); 
    return; 
  }

  try{
    // 1) Buat row baru di DB
    const res = await fetch('/api/tambah-marker', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ 
        kategori, 
        lat: tempLatLng.lat, 
        lng: tempLatLng.lng, 
        site, 
        description 
      })
    });
    const data = await res.json();

    // tutup modal & hapus marker sementara
    document.getElementById('markerModal').style.display = 'none';
    if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
    setMarkerStatus('');

    if (!data.success){
      alert('Gagal menambah marker!');
      return;
    }

    // 2) Jika user memilih file → upload ke Supabase → update dokumen_url via Flask
    if (fileInput && fileInput.files && fileInput.files.length){
      // validasi ringan (opsional)
      const f = fileInput.files[0];
      const allowed = /\.(jpg|jpeg|png|webp|gif|pdf)$/i;
      if (!allowed.test(f.name)) {
        alert('Tipe file harus gambar/PDF'); 
      } else {
        // siapkan id & tableName
        const newId     = data.id;                // diharapkan dari server
        const tableName = data.table || tableNameByKategori(kategori);

        if (newId && tableName) {
          try{
            setMarkerStatus('Mengunggah evidence...');
            // fungsi global dari upload.js yang sudah kita pasang sebelumnya
            const ok = await uploadFileToSupabase(newId, tableName, 'markerFileInput', { noReload: true });
            if (!ok) console.warn('Upload evidence batal/gagal.');
          } catch (e) {
            console.error(e);
            alert('Gagal upload evidence: ' + (e?.message || e));
          } finally{
            setMarkerStatus('');
          }
        } else {
          // jika server belum mengembalikan id/table, kita tidak bisa update dokumen_url
          alert('Marker berhasil dibuat, tetapi evidence tidak dapat disimpan (id/table tidak tersedia dari server).');
        }
      }
      // kosongkan file input supaya tidak re-upload tanpa sengaja
      fileInput.value = '';
    }

    // 3) Refresh layer sesuai kategori
    alert('Marker berhasil ditambahkan!');
    if      (kategori==='linksatelit') loadLinkSatelitLayer();
    else if (kategori==='backup')      loadBackupLinkLayer();
    else if (kategori==='repair2025')  loadSKKLRepairLayer();
    else if (kategori==='fo_cut')      loadFoCutLayer();

  } catch(err){
    console.error(err);
    alert('Gagal koneksi ke server!');
  }
};

// Batal modal
document.getElementById('batalMarker').onclick = function(){
  document.getElementById('markerModal').style.display = 'none';
  if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
  setMarkerStatus('');
  const fileInput = document.getElementById('markerFileInput');
  if (fileInput) fileInput.value = '';
  tempLatLng = null;
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
  }).catch(()=> alert('Gagal koneksi ke server!'));
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
