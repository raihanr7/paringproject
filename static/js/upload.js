// static/js/upload.js
(() => {
  // === KONFIGURASI ===
  const SUPABASE_URL  = 'https://wtmfsznnmyinbgzkdofz.supabase.co';
  const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0bWZzem5ubXlpbmJnemtkb2Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MTYxNDIsImV4cCI6MjA2MzI5MjE0Mn0.gZzNz6hxypg4_oyGEgG7PrweuXw1pahGVi1GD4XO1nM';
  const STORAGE_BUCKET = 'dokumen-peta'; // tanpa sub-folder
  const UPSERT = true;                   // false jika tak mau overwrite

  if (!window.supabase || !window.supabase.createClient) {
    console.error('Supabase SDK belum termuat. Pastikan CDN dimuat sebelum upload.js');
    return;
  }
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  async function ensureBucketExists() {
    const { error } = await sb.storage.from(STORAGE_BUCKET).list('', { limit: 1 });
    if (error && /bucket not found/i.test(error.message)) {
      throw new Error(`Bucket "${STORAGE_BUCKET}" tidak ditemukan. Cek di Supabase → Storage.`);
    }
  }

  // dipanggil dari HTML/JS lain
  // contoh: uploadFileToSupabase(fid, 'Palapa_Ring_Timur_Point', 'dokumenInput', { noReload:true })
  window.uploadFileToSupabase = async function (fid, tableName, fileInputId, opts = {}) {
    try {
      const input = document.getElementById(fileInputId);
      if (!input || !input.files || !input.files.length) {
        alert('Pilih file dulu ya!');
        return false;
      }
      const file = input.files[0];
      await ensureBucketExists();

      const safeTable = (tableName || 'dokumen').replace(/\s+/g, '_');
      const filename  = `${safeTable}_${fid || 'noid'}_${Date.now()}_${file.name}`;
      const { error: upErr } = await sb.storage
        .from(STORAGE_BUCKET)
        .upload(filename, file, { upsert: UPSERT });

      if (upErr) {
        if (/row-level security/i.test(upErr.message))
          throw new Error('RLS menolak INSERT/UPDATE. Cek policy Storage untuk role "anon".');
        if (/resource already exists|409/i.test(upErr.message))
          throw new Error('File sudah ada. Matikan UPSERT atau ganti nama file.');
        throw upErr;
      }

      const { data: pub } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
      const publicUrl = pub?.publicUrl;
      if (!publicUrl) throw new Error('Gagal mendapatkan URL publik dari Supabase.');

      if (fid && tableName) {
        const res = await fetch(`/api/update/${tableName}/${fid}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dokumen_url: publicUrl })
        });
        if (!res.ok) {
          const t = await res.text().catch(() => '');
          throw new Error(`API update gagal: ${res.status} ${t}`);
        }
      }

      // reset input agar tidak re-upload tanpa sengaja
      input.value = '';

      if (opts.noReload) {
        // biarkan caller yang update UI
        return { publicUrl, filename };
      } else {
        alert('Upload berhasil!');
        location.reload();
        return { publicUrl, filename };
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Gagal upload file: ' + (err?.message || err));
      return false;
    }
  };

  // ====== HELPER: Ambil path object dari public URL ======
  function getPathFromPublicUrl(publicUrl) {
    try {
      const u = new URL(publicUrl);
      const parts = u.pathname.split('/'); // ["", "storage","v1","object","public","<bucket>", ...path]
      // Cari segmen 'public' lalu ambil setelah "<bucket>"
      let idx = parts.indexOf('public');
      if (idx !== -1 && parts[idx + 1] === STORAGE_BUCKET) {
        return decodeURIComponent(parts.slice(idx + 2).join('/'));
      }
      // Fallback: langsung cari posisi nama bucket
      idx = parts.indexOf(STORAGE_BUCKET);
      if (idx !== -1) {
        return decodeURIComponent(parts.slice(idx + 1).join('/'));
      }
    } catch (e) {}
    return null;
  }

  // ====== EXPORT: Hapus file dari Supabase Storage berdasarkan public URL ======
  window.deleteFileFromSupabase = async function(publicUrl) {
    const path = getPathFromPublicUrl(publicUrl);
    if (!path) throw new Error('Gagal mengekstrak path object dari URL publik.');

    const { error } = await sb.storage.from(STORAGE_BUCKET).remove([path]);
    if (error) throw error;
    return true;
  };


  // Return latest N file public URLs under tableName/id/ (sorted by filename; we use timestamp prefix)
  window.listFileUrlsLatest = async function(tableName, id, limit = 2) {
    try{
      const folder = `${tableName}/${id}`;
      const { data, error } = await sb.storage.from(STORAGE_BUCKET).list(folder, { limit: 200 });
      if (error) throw error;
      const files = (data || []).filter(o => !o.name.endsWith('/'));
      // We name uploads as: <timestamp>_<safeName>, so sort by name to approximate latest
      files.sort((a,b) => a.name.localeCompare(b.name));
      const picked = files.slice(-limit);
      const urls = picked.map(obj => {
        const path = `${folder}/${obj.name}`;
        const { data:pub } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        return pub?.publicUrl || null;
      }).filter(Boolean);
      return urls;
    }catch(e){
      console.error('listFileUrlsLatest error:', e);
      return [];
    }
  };
})();