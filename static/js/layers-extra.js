// ===== layers-extra.js (tidy single-image popup, v2 strict block layout) =====

function safe(val, d='-'){ return (val===undefined || val===null || val==='') ? d : val; }
function nameFromProps(p){ return p.name || p.site || p.Site || p.Link || p["Link"] || p["name"] || p["site"] || '-'; }
function descFromProps(p){ return p.description || p.Deskripsi || p["description"] || p["Deskripsi"] || ''; }

function tableNameByKategoriFallback(k){
  switch(k){
    case 'backup': return 'Backup Link';
    case 'linksatelit': return 'Link_Satelit';
    case 'repair2025': return 'SKKL_Repair_2025_BY_DCS';
    case 'fo_cut': return 'Palapa_Ring_FO_Cut';
    default: return '';
  }
}
function getTableNameByKategori(k){
  if (typeof window.tableNameByKategori === 'function') return window.tableNameByKategori(k);
  return tableNameByKategoriFallback(k);
}

function buildPopupHtml(feature, kategori){
  const p = feature.properties || {};
  const id = p.id || p.fid || '';
  const dok = p.dokumen_url || '';
  const name = nameFromProps(p);
  const desc = descFromProps(p);

  const inputId = `img_${kategori}_${id}`;
  const imgWrapId = `imgWrap_${kategori}_${id}`;
  const statusId = `status_${kategori}_${id}`;

  const imgBlock = dok ? `
    <div id="${imgWrapId}" style="margin:12px 0 8px 0;">
      <a href="${dok}" target="_blank" rel="noopener" style="display:block;">
        <img src="${dok}" alt="evidence" style="width:100%;max-height:220px;object-fit:contain;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);display:block;">
      </a>
      <button onclick="popupDelete('${kategori}','${id}','${dok}','${imgWrapId}','${statusId}')"
              style="display:block;width:100%;margin-top:10px;padding:8px 10px;border-radius:10px;border:1px solid #b91c1c;background:#ef4444;color:#fff;cursor:pointer;">
        Hapus Gambar
      </button>
    </div>` : `<div id="${imgWrapId}" style="margin:12px 0 8px 0;"></div>`;

  return `
  <div style="min-width:280px;max-width:340px;">
    <div style="font-weight:800;font-size:16px;line-height:1.2;">${safe(name)}</div>
    ${desc ? `<div style="margin-top:4px;color:#4b5563;font-size:13px;">${desc}</div>` : ''}

    ${imgBlock}

    <div style="display:block;">
      <input type="file" id="${inputId}" accept="image/*" style="display:block;width:100%;"/>
      <button onclick="popupUpload('${kategori}','${id}','${inputId}','${imgWrapId}','${statusId}')"
              style="display:block;width:100%;margin-top:8px;padding:10px;border-radius:10px;border:1px solid #2563eb;background:#3b82f6;color:#fff;cursor:pointer;">
        Upload / Ganti Gambar
      </button>
    </div>

    <div id="${statusId}" style="margin-top:8px;font-size:12px;color:#6b7280;"></div>

    <hr style="margin:12px 0;">
    <button onclick="hapusMarker('${kategori}','${id}')"
            style="display:block;width:100%;padding:8px 10px;border-radius:10px;border:1px solid #374151;background:#fff;cursor:pointer;">Hapus Marker</button>
  </div>`;
}

// ===== Upload/Delete handlers =====
window.popupUpload = async function(kategori, id, inputId, imgWrapId, statusId){
  try{
    const input = document.getElementById(inputId);
    const st = document.getElementById(statusId);
    if (!input || !input.files || !input.files[0]) { alert('Pilih file gambar terlebih dahulu.'); return; }

    const f = input.files[0];
    if (!/\.(png|jpe?g|webp|gif)$/i.test(f.name)) { alert('Format harus png/jpg/jpeg/webp/gif.'); return; }
    if (st) st.textContent = 'Mengunggah gambar...';

    const tableName = getTableNameByKategori(kategori);
    if (!tableName){ alert('Kategori tidak dikenal.'); return; }

    const result = await uploadFileToSupabase(id, tableName, inputId, { noReload: true });
    if (!result || !result.publicUrl) { if (st) st.textContent = ''; return; }

    const { publicUrl } = result;
    const res = await fetch('/api/update-marker-doc', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ table: tableName, id, dokumen_url: publicUrl })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Gagal update dokumen_url');

    const wrap = document.getElementById(imgWrapId);
    if (wrap){
      wrap.innerHTML = `
        <a href="${publicUrl}" target="_blank" rel="noopener" style="display:block;">
          <img src="${publicUrl}" alt="evidence" style="width:100%;max-height:220px;object-fit:contain;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);display:block;">
        </a>
        <button onclick="popupDelete('${kategori}','${id}','${publicUrl}','${imgWrapId}','${statusId}')"
                style="display:block;width:100%;margin-top:10px;padding:8px 10px;border-radius:10px;border:1px solid #b91c1c;background:#ef4444;color:#fff;cursor:pointer;">
          Hapus Gambar
        </button>`;
    }
    if (input) input.value = '';
    if (st) st.textContent = 'Upload selesai.';
  }catch(e){
    console.error(e);
    alert('Upload gagal: ' + (e.message || e));
  }
};

window.popupDelete = async function(kategori, id, publicUrl, imgWrapId, statusId){
  if (!confirm('Hapus gambar ini?')) return;
  const st = document.getElementById(statusId);
  try{
    if (st) st.textContent = 'Menghapus gambar...';
    try { await deleteFileFromSupabase(publicUrl); } catch(e){ console.warn('Delete storage warning:', e); }
    const tableName = getTableNameByKategori(kategori);
    const res = await fetch('/api/clear-marker-doc', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ table: tableName, id })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Gagal clear dokumen_url');

    const wrap = document.getElementById(imgWrapId);
    if (wrap) wrap.innerHTML = ''; // kosongkan preview
    if (st) st.textContent = 'Gambar dihapus.';
  }catch(e){
    console.error(e);
    alert('Gagal hapus gambar: ' + (e.message || e));
    if (st) st.textContent = '';
  }
};

// ====== LAYER LOADERS ======
window.loadSKKLRepairLayer = function(){
  fetch('/api/repair/skkl')
    .then(r=>r.json())
    .then(data=>{
      skklRepairLayer.clearLayers();
      L.geoJSON(data, {
        pointToLayer: (f, latlng)=> L.marker(latlng, { icon: repairIcon }),
        onEachFeature:(feature, layer)=>{
          feature.properties.kategori = 'repair2025';
          layer.bindPopup(buildPopupHtml(feature, 'repair2025'), { maxWidth: 340 });
        }
      }).addTo(skklRepairLayer);
    });
};
window.loadBackupLinkLayer = function(){
  fetch('/api/backup-link')
    .then(r=>r.json())
    .then(data=>{
      backupLinkLayer.clearLayers();
      L.geoJSON(data, {
        pointToLayer: (f, latlng)=> L.marker(latlng, { icon: backupLinkIcon }),
        onEachFeature:(feature, layer)=>{
          feature.properties.kategori = 'backup';
          layer.bindPopup(buildPopupHtml(feature, 'backup'), { maxWidth: 340 });
        }
      }).addTo(backupLinkLayer);
    });
};
window.loadLinkSatelitLayer = function(){
  fetch('/api/link-satelit')
    .then(r=>r.json())
    .then(data=>{
      linkSatelitLayer.clearLayers();
      L.geoJSON(data, {
        pointToLayer: (f, latlng)=> L.marker(latlng, { icon: linkSatelitIcon }),
        onEachFeature:(feature, layer)=>{
          feature.properties.kategori = 'linksatelit';
          layer.bindPopup(buildPopupHtml(feature, 'linksatelit'), { maxWidth: 340 });
        }
      }).addTo(linkSatelitLayer);
    });
};
window.loadFoCutLayer = function(){
  fetch('/api/fo-cut/paring')
    .then(r=>r.json())
    .then(data=>{
      foCutLayer.clearLayers();
      L.geoJSON(data, {
        pointToLayer: (f, latlng)=> L.marker(latlng, { icon: foCutIcon }),
        onEachFeature:(feature, layer)=>{
          feature.properties.kategori = 'fo_cut';
          layer.bindPopup(buildPopupHtml(feature, 'fo_cut'), { maxWidth: 340 });
        }
      }).addTo(foCutLayer);
    });
};

// initial + refresh berkala
loadLinkSatelitLayer(); setInterval(loadLinkSatelitLayer, 30000);
loadSKKLRepairLayer(); setInterval(loadSKKLRepairLayer, 30000);
loadBackupLinkLayer(); setInterval(loadBackupLinkLayer, 30000);
loadFoCutLayer(); setInterval(loadFoCutLayer, 30000);
