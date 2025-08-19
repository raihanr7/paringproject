// ========== HISTORY MODAL ========== //
window.showHistoryModal = function(linkName){
  document.getElementById('historyModal').style.display = '';
  const content = document.getElementById('historyModalContent');
  content.innerHTML = 'Loading...';
  fetch(`/api/update-history?link=${encodeURIComponent(linkName)}`)
    .then(r=>r.json())
    .then(data=>{
      if(!data.data || !data.data.length){ content.innerHTML = "<div style='color:#777;'>Belum ada riwayat update untuk data ini.</div>"; return; }
      let html = `<table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead><tr>
          <th style="border-bottom:1px solid #ddd;">Old Value</th>
          <th style="border-bottom:1px solid #ddd;">New Value</th>
          <th style="border-bottom:1px solid #ddd;">Updated at</th>
        </tr></thead><tbody>`;
      data.data.forEach(row=>{
        html += `<tr>
          <td style="padding:3px 6px;border-bottom:1px solid #f0f0f0;">${row['Old Value'] ?? '-'}</td>
          <td style="padding:3px 6px;border-bottom:1px solid #f0f0f0;">${row['New Value'] ?? '-'}</td>
          <td style="padding:3px 6px;border-bottom:1px solid #f0f0f0;">${row['Updated at'] ?? '-'}</td>
        </tr>`;
      });
      html += "</tbody></table>";
      content.innerHTML = html;
    })
    .catch(()=> content.innerHTML = "Gagal load history.");
};
window.closeHistoryModal = function(){ document.getElementById('historyModal').style.display = 'none'; };

// Util kecil: deteksi URL gambar untuk preview
const isImageUrl = (url) => /\.(png|jpe?g|webp|gif)$/i.test(url || '');

// ========== SIDEBAR BUILDER ========== //
window.buildSidebarContent = function(feature, data, layerInstance, tableName){
  const order = data.field_order ?? Object.keys(feature.properties);
  const props = feature.properties || {};
  const fid   = props['fid'] || props['id'] || feature.id;

  let html = "<table>";
  order.forEach(key=>{
    let value = props[key] ?? "-";
    if (key === "Okupansi Telkom (%)" && props.hasOwnProperty("Okupansi Telkom (%)")){
      html += `
      <tr><td><strong>${key}</strong></td>
      <td style="max-width:240px;">
        <div class="okupansi-value-container" style="display:flex;align-items:center;gap:6px;">
          <div class="okupansi-display" id="okupansiDisplay" style="display:flex;align-items:center;gap:6px;">
            <span>: ${value}%</span>
            <button class="btn-edit" onclick="startEdit()">edit</button>
            ${ (props["Link"] && tableName && tableName.includes("Alur")) ?
              `<button onclick="showHistoryModal('${props["Link"]}')" style="padding:2px 10px;font-size:11px;border-radius:5px;background:#eee;border:1px solid #444;cursor:pointer;">Riwayat</button>` : "" }
          </div>
          <div class="okupansi-edit-form" id="okupansiEditForm" style="display:none;">
            <span>:</span>
            <input type="number" id="okupansiInput" class="edit-input" min="0" max="100" step="0.01" value="${value}" />
            <span>%</span>
            <button class="btn-save" onclick="saveOkupansi()">Simpan</button>
            <button class="btn-cancel" onclick="cancelEdit()">Batal</button>
            <span id="loadingStatus" class="loading-text" style="display:none;"></span>
          </div>
        </div>
      </td></tr>`;
    } else if (key === "Nilai Kontrak" && value && value !== "-"){
      html += `
      <tr><td><strong>${key}</strong></td>
      <td style="max-width:180px;">
        <div class="nilai-kontrak-value-container">
          <div class="nilai-kontrak-display" id="nilaiKontrakDisplay">
            <span>: ${formatRupiah(value)}</span>
            <button class="btn-edit" onclick="startEditNilaiKontrak()">edit</button>
          </div>
          <div class="nilai-kontrak-edit-form" id="nilaiKontrakEditForm" style="display:none;align-items:center;gap:4px;">
            <span>:</span>
            <input type="number" id="nilaiKontrakInput" class="edit-input" min="0" step="1000" value="${props[key]}" style="width:120px;" />
            <button class="btn-save" onclick="saveNilaiKontrak()">Simpan</button>
            <button class="btn-cancel" onclick="cancelEditNilaiKontrak()">Batal</button>
            <span id="loadingStatusNilaiKontrak" class="loading-text" style="display:none;"></span>
          </div>
        </div>
      </td></tr>`;
    // ---- Nilai Sewa Perbulan (tampilan + form edit) ----
    } else if (key === "Nilai Sewa Perbulan" && value && value !== "-") {
      html += `
      <tr><td><strong>${key}</strong></td>
      <td style="max-width:180px;">
        <div class="nilai-sewa-value-container">
          <div class="nilai-sewa-display" id="nilaiSewaDisplay">
            <span>: ${formatRupiah(value)}</span>
            <button class="btn-edit" onclick="startEditNilaiSewa()">edit</button>
          </div>
          <div class="nilai-sewa-edit-form" id="nilaiSewaEditForm" style="display:none;align-items:center;gap:4px;">
            <span>:</span>
            <input type="number" id="nilaiSewaInput" class="edit-input" min="0" step="1000"
                  value="${props[key] || 0}" style="width:140px;" />
            <button class="btn-save" onclick="saveNilaiSewa()">Simpan</button>
            <button class="btn-cancel" onclick="cancelEditNilaiSewa()">Batal</button>
            <span id="loadingStatusNilaiSewa" class="loading-text" style="display:none;"></span>
          </div>
        </div>
      </td></tr>`;
    } else if (key === "Periode"){
      html += `
      <tr><td><strong>${key}</strong></td>
      <td style="max-width:160px;">
        <div class="periode-value-container">
          <div class="periode-display" id="periodeDisplay">
            <span>: ${value}</span>
            <button class="btn-edit" onclick="startEditPeriode()">edit</button>
          </div>
          <div class="periode-edit-form" id="periodeEditForm" style="display:none;align-items:center;gap:4px;">
            <span>:</span>
            <input type="text" id="periodeInput" class="edit-input" value="${props[key] || ''}" style="width:100px;" />
            <button class="btn-save" onclick="savePeriode()">Simpan</button>
            <button class="btn-cancel" onclick="cancelEditPeriode()">Batal</button>
            <span id="loadingStatusPeriode" class="loading-text" style="display:none;"></span>
          </div>
        </div>
      </td></tr>`;
    } else {
      html += `<tr><td><strong>${key}</strong></td><td>: ${value}</td></tr>`;
    }
  });
  html += "</table>";

// ===== BLOK DOKUMEN: link + preview + tombol hapus (di bawah preview) =====
const dokUrl = props['dokumen_url'] || '';
html += `
<div id="dokumenBlock" style="margin-top:10px;">
  <div><b>Dokumen</b> :
    ${
      dokUrl
        ? `<a id="dokumenLink" href="${dokUrl}" target="_blank" rel="noopener">Buka</a>`
        : `<span id="dokumenEmpty" class="muted">Belum ada dokumen</span>`
    }
  </div>

  ${
    (dokUrl && isImageUrl(dokUrl))
      ? `<img id="dokumenPreview" src="${dokUrl}" alt="Preview"
              style="display:block;margin-top:8px;max-width:260px;max-height:200px;
                     width:100%;height:auto;border-radius:8px;
                     box-shadow:0 2px 10px rgba(0,0,0,.15);" />`
      : ''
  }

  ${
    dokUrl
      ? `<div id="dokumenActions" style="margin-top:8px;">
           <button id="btnDeleteDok" class="btn danger"
             onclick="handleDeleteDokumen('${fid || ''}', '${window.currentTableName || tableName || ''}')">
             Hapus Dokumen
           </button>
         </div>`
      : ``
  }
</div>`;



  // ===== BLOK UPLOAD (tanpa reload) =====
  const fileInputId = `fileInput_${fid || Math.random().toString(36).slice(2,7)}`;
  html += `
  <div style="margin-top:12px;">
    <input type="file" id="${fileInputId}" accept="image/*,application/pdf" />
    <button onclick="handleUpload('${fid || ''}', '${window.currentTableName || tableName || ''}', '${fileInputId}')" style="margin-left:8px;">Upload File</button>
    <div><small id="lastUploadInfo" class="muted"></small></div>
  </div>`;

  return html;
};

// ========== UPLOAD HANDLER (tanpa reload) ========== //
// Membutuhkan upload.js terbaru yang mengembalikan { publicUrl, filename } saat opts.noReload = true
window.handleUpload = async function (fid, tableName, fileInputId) {
  const result = await uploadFileToSupabase(fid, tableName, fileInputId, { noReload: true });
  if (!result) return; // error sudah di-alert di upload.js

  const { publicUrl, filename } = result;

  // update properties runtime
  if (window.currentFeature && window.currentFeature.properties) {
    window.currentFeature.properties.dokumen_url = publicUrl;
  }

  const block = document.getElementById('dokumenBlock');
  const empty = document.getElementById('dokumenEmpty');
  if (empty) empty.remove();

  // link dokumen
  let link = document.getElementById('dokumenLink');
  if (link) {
    link.href = publicUrl;
    link.textContent = 'Buka';
  } else if (block) {
    block.insertAdjacentHTML('beforeend',
      `<div><b>Dokumen</b> : <a id="dokumenLink" href="${publicUrl}" target="_blank" rel="noopener">Buka</a></div>`);
  }

  // preview dokumen (jika gambar)
  const imgExt = isImageUrl(publicUrl);
  let prev = document.getElementById('dokumenPreview');
  if (imgExt) {
    if (prev) {
      prev.src = publicUrl;
    } else if (block) {
      block.insertAdjacentHTML('beforeend',
        `<img id="dokumenPreview" src="${publicUrl}" alt="Preview"
              style="display:block;margin-top:8px;max-width:260px;max-height:200px;
                    width:100%;height:auto;border-radius:8px;
                    box-shadow:0 2px 10px rgba(0,0,0,.15);" />`);
    }
  } else if (prev) {
    prev.remove();
  }

  // pastikan tombol hapus ada dan posisinya di bawah preview
  let actions = document.getElementById('dokumenActions');
  if (!actions) {
    actions = document.createElement('div');
    actions.id = 'dokumenActions';
    actions.style.marginTop = '8px';
    block.appendChild(actions);
  }
  let btn = document.getElementById('btnDeleteDok');
  if (!btn) {
    actions.insertAdjacentHTML('beforeend',
      `<button id="btnDeleteDok" class="btn danger"
        onclick="handleDeleteDokumen('${fid}', '${tableName}')">
        Hapus Dokumen
      </button>`);
  }


  // tampilkan nama file terakhir (menggantikan "No file chosen" behavior bawaan)
  const info = document.getElementById('lastUploadInfo');
  if (info) info.textContent = `Uploaded: ${filename}`;

  // kosongkan input agar tidak re-upload tanpa sengaja
  const input = document.getElementById(fileInputId);
  if (input) input.value = '';
};

window.handleDeleteDokumen = async function(fid, tableName) {
  try {
    if (!window.currentFeature || !window.currentFeature.properties) {
      alert('Data tidak valid.'); 
      return;
    }
    const url = window.currentFeature.properties.dokumen_url;
    if (!url) { 
      alert('Tidak ada dokumen untuk dihapus.'); 
      return; 
    }

    // Konfirmasi
    const ok = confirm('Hapus dokumen ini dari Storage dan hilangkan dari data?');
    if (!ok) return;

    // 1) Hapus file di Supabase Storage (fungsi ini ada di upload.js)
    await deleteFileFromSupabase(url);

    // 2) Update DB: set dokumen_url = null
    if (fid && tableName) {
      const res = await fetch(`/api/update/${tableName}/${fid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dokumen_url: null })
      });
      if (!res.ok) {
        const t = await res.text().catch(()=> '');
        throw new Error(`Gagal update DB: ${res.status} ${t}`);
      }
    }

    // 3) Update runtime & UI
    window.currentFeature.properties.dokumen_url = null;

    const block   = document.getElementById('dokumenBlock');
    const link    = document.getElementById('dokumenLink');
    const prev    = document.getElementById('dokumenPreview');
    const actions = document.getElementById('dokumenActions');
    const info    = document.getElementById('lastUploadInfo');

    if (link)    link.remove();
    if (prev)    prev.remove();
    if (actions) actions.remove();
    if (info)    info.textContent = '';

    // tampilkan label "Belum ada dokumen"
    if (block && !document.getElementById('dokumenEmpty')) {
      block.insertAdjacentHTML('beforeend',
        `<div><span id="dokumenEmpty" class="muted">Belum ada dokumen</span></div>`);
    }

    alert('Dokumen berhasil dihapus.');
  } catch (err) {
    console.error(err);
    alert('Gagal menghapus dokumen: ' + (err?.message || err));
  }
};


// ========== EDIT HANDLERS (Okupansi/Nilai/Periode) ========== //
window.startEdit = function(){
  if (!window.currentFeature || !window.currentTableName) return;
  window.isEditMode = true;
  document.getElementById('okupansiDisplay').style.display = 'none';
  document.getElementById('okupansiEditForm').style.display = 'flex';
  document.getElementById('okupansiInput').focus();
};
window.cancelEdit = function(){
  document.getElementById('okupansiDisplay').style.display = 'flex';
  document.getElementById('okupansiEditForm').style.display = 'none';
  document.getElementById('loadingStatus').style.display = 'none';
  window.isEditMode = false;
  if (window.currentFeature) document.getElementById('okupansiInput').value = window.currentFeature.properties['Okupansi Telkom (%)'] || '';
};
window.saveOkupansi = async function(){
  if (!window.currentFeature || !window.currentTableName) return;
  const val = document.getElementById('okupansiInput').value;
  const status = document.getElementById('loadingStatus');

  const linkName = window.currentFeature.properties["Link"]?.trim();
  const project  = window.currentFeature.properties["Project"];
  const kategori = window.currentTableName.includes('Barat') ? 'barat' :
                   window.currentTableName.includes('Tengah') ? 'tengah' : 'timur';

  if (val === '' || isNaN(val) || val < 0 || val > 100){ showNotification('Nilai okupansi harus antara 0-100','error'); return; }

  const choice = await Swal.fire({
    title: `Apakah ingin mengubah nilai okupansi menjadi ${val}%?`,
    text: 'Silakan pilih', icon:'question', showCancelButton:true,
    confirmButtonText:'Hanya link ini', denyButtonText:'Seluruh link pada project ini', showDenyButton:true
  });
  if (choice.dismiss){ showNotification('Perubahan dibatalkan.','error'); return; }
  const scope = choice.isConfirmed ? 'link' : 'project';

  status.style.display = 'inline'; status.textContent = 'Menyimpan...';
  try{
    const res = await fetch('/api/update-okupansi', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ kategori, scope, value:parseFloat(val), link_name:linkName, project })
    });
    const out = await res.json();
    if (out.success){
      showNotification('Okupansi berhasil diupdate','success');
      window.currentFeature.properties['Okupansi Telkom (%)'] = parseFloat(val);
      document.querySelector('#okupansiDisplay span').textContent = `: ${val}%`;
      if (window.currentLayer?.setStyle) window.currentLayer.setStyle(styleAlur(window.currentFeature));
      setTimeout(window.refreshAllLayers, 500);
      setTimeout(window.cancelEdit, 1000);
    }else{
      showNotification(`Error: ${out.error || 'Gagal menyimpan'}`, 'error');
    }
  }catch{ showNotification('Error: Gagal menghubungi server','error'); }
  finally{ status.style.display = 'none'; }
};

// Nilai Kontrak
window.startEditNilaiKontrak = function(){
  document.getElementById('nilaiKontrakDisplay').style.display = 'none';
  document.getElementById('nilaiKontrakEditForm').style.display = 'flex';
  document.getElementById('nilaiKontrakInput').focus();
};
window.cancelEditNilaiKontrak = function(){
  document.getElementById('nilaiKontrakDisplay').style.display = 'flex';
  document.getElementById('nilaiKontrakEditForm').style.display = 'none';
  document.getElementById('loadingStatusNilaiKontrak').style.display = 'none';
};
window.saveNilaiKontrak = async function(){
  if (!window.currentFeature || !window.currentTableName){ alert('Data tidak valid.'); return; }
  const fid = window.currentFeature.properties.fid; if(!fid){ alert('FID tidak ditemukan'); return; }
  const nilaiBaru = Number(document.getElementById('nilaiKontrakInput').value);
  const status = document.getElementById('loadingStatusNilaiKontrak');
  status.style.display='inline'; status.textContent='Menyimpan...';

  try{
    const res = await fetch(`/api/update/${window.currentTableName}/${fid}`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ "Nilai Kontrak": nilaiBaru })
    });
    const data = await res.json();
    if (data.affected_rows > 0 || data.message){
      showNotification('Nilai kontrak berhasil diupdate','success');
      window.currentFeature.properties["Nilai Kontrak"] = nilaiBaru;
      document.querySelector('#nilaiKontrakDisplay span').textContent = `: ${formatRupiah(nilaiBaru)}`;
      setTimeout(window.cancelEditNilaiKontrak, 800);
    }else showNotification('Gagal update nilai kontrak','error');
  }catch{ showNotification('Gagal koneksi ke server','error'); }
  finally{ status.style.display='none'; }
};

window.startEditNilaiSewa = function(){
  document.getElementById('nilaiSewaDisplay').style.display = 'none';
  document.getElementById('nilaiSewaEditForm').style.display = 'flex';
  document.getElementById('nilaiSewaInput').focus();
};
window.cancelEditNilaiSewa = function(){
  document.getElementById('nilaiSewaDisplay').style.display = 'flex';
  document.getElementById('nilaiSewaEditForm').style.display = 'none';
  document.getElementById('loadingStatusNilaiSewa').style.display = 'none';
};
window.saveNilaiSewa = async function(){
  if (!window.currentFeature || !window.currentTableName){ alert('Data tidak valid.'); return; }
  const fid = window.currentFeature.properties.fid; if(!fid){ alert('FID tidak ditemukan'); return; }
  const nilaiBaru = Number(document.getElementById('nilaiSewaInput').value || 0);
  const status = document.getElementById('loadingStatusNilaiSewa');
  status.style.display='inline'; status.textContent='Menyimpan...';

  try{
    const res = await fetch(`/api/update/${window.currentTableName}/${fid}`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ "Nilai Sewa Perbulan": nilaiBaru })
    });
    const data = await res.json();
    if (data.affected_rows > 0 || data.message){
      showNotification('Nilai sewa perbulan berhasil diupdate','success');
      window.currentFeature.properties["Nilai Sewa Perbulan"] = nilaiBaru;
      document.querySelector('#nilaiSewaDisplay span').textContent = `: ${formatRupiah(nilaiBaru)}`;
      setTimeout(window.cancelEditNilaiSewa, 500);
    }else showNotification('Gagal update nilai sewa','error');
  }catch{ showNotification('Gagal koneksi ke server','error'); }
  finally{ status.style.display='none'; }
};


// Periode
window.startEditPeriode = function(){
  document.getElementById('periodeDisplay').style.display = 'none';
  document.getElementById('periodeEditForm').style.display = 'flex';
  document.getElementById('periodeInput').focus();
};
window.cancelEditPeriode = function(){
  document.getElementById('periodeDisplay').style.display = 'flex';
  document.getElementById('periodeEditForm').style.display = 'none';
  document.getElementById('loadingStatusPeriode').style.display = 'none';
};
window.savePeriode = async function(){
  if (!window.currentFeature || !window.currentTableName){ alert('Data tidak valid.'); return; }
  const fid = window.currentFeature.properties.fid; if(!fid){ alert('FID tidak ditemukan'); return; }

  const periodeBaru = document.getElementById('periodeInput').value;
  const status = document.getElementById('loadingStatusPeriode');
  status.style.display='inline'; status.textContent='Menyimpan...';

  try{
    const res = await fetch(`/api/update/${window.currentTableName}/${fid}`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ "Periode": periodeBaru })
    });
    const data = await res.json();
    if (data.affected_rows > 0 || data.message){
      showNotification('Periode berhasil diupdate','success');
      window.currentFeature.properties["Periode"] = periodeBaru;
      document.querySelector('#periodeDisplay span').textContent = `: ${periodeBaru}`;
      setTimeout(window.cancelEditPeriode, 800);
    }else showNotification('Gagal update periode','error');
  }catch{ showNotification('Gagal koneksi ke server','error'); }
  finally{ status.style.display='none'; }
};
