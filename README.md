# Peta Jaringan

Dashboard peta interaktif untuk memantau kondisi layanan

> Terakhir diperbarui: 2026-01-09 (WIB)

---

# USER MANUAL

## Library

- **Backend**
  1. Flask (Python web framework) + psycopg2 (PostgreSQL/Supabase) – menyajikan GeoJSON & endpoint update.
- **Frontend**:
  1. Leaflet 1.9.4 -- peta interaktif utama.
  2. leaflet-search 3.0.9 -- fitur cari layer di peta
  3. leaflet-simple-map-screenshoter -- screenshot peta lalu export
  4. @geoman-io/leaflet-geoman-free 2.15.0 -- create dan edit marker
  5. leaflet.groupedlayercontrol 0.7.0 -- control layer pergrup (milih layer)
  6. SweetAlert2 11 -- pop up konfirmasi (muncul saat edit okupansi)
  7. @supabase/supabase-js v2 -- ext untuk upload document ke Supabase

## Dataset dan Storage

1.  Dataset disimpan di Supabase (SQL Cloud database).
2.  Kolom "geom" pada dataset memiliki tipe kolom _geometry_, sehingga perlu menginstall extension _postgis_ kolom geom dapat digunakan sebagai titik koordinat. Berikut link untuk mengunduh postgis "https://postgis.net/". Pastikan extension postgis terinstall via SQL query dengan syntax:

          - CREATE EXTENSION postgis;

    notes: Install extension postgis diperlukan di awal saja jika akan mengedit di database yang baru baik lokal maupun cloud. Jika tidak menginstall postgis maka kolom geom tidak akan ada pilihan tipe data "geometry" dan dataset tidak bisa digunakan

3.  Dataset yang digunakan terdiri dari beberaa tabel, diantaranya:
    1. Palapa_Ring_Barat_Point (Titik project Paring Barat)
    2. Palapa_Ring_Barat_Alur (Alur antar project Paring Barat)
    3. Palapa_Ring_Tengah_Point (Titik project Paring Tengah)
    4. Palapa_Ring_Tengah_Alur (Alur antar project Paring Tengah)
    5. Palapa_Ring_Timur_Point (Titik project Paring Timur)
    6. Palapa_Ring_Timur_Alur (Alur antar project Paring Timur)
4.  Syntax disimpan di Github "https://github.com/raihanr7/my-flask-app"

## Konfigurasi Database

# PostgreSQL (via Transaction pooler)

host=os.getenv('DATABASE_HOST'),
database=os.getenv('DB_NAME'),
user=os.getenv('DB_USER'),
password=os.getenv('DB_PASSWORD'),
port=os.getenv('DB_PORT'),
options='-c timezone=Asia/Jakarta -c pool_mode=transaction'

- **Fitur utama**: Layer Palapa Ring (Barat/Tengah/Timur)

## Hosting

**Vercel**
Peta online ini dihosting via "https://vercel.com/".

## Cara Pemakaian Peta

**Main Page**

1. Buka halaman utama → pilih layer di bagian ujung kanan atas.
   ![Main screen](static/imgdocs/mainscreen1.png)
2. Pilih layer:

   - Palapa Ring Barat
   - Palapa Ring Tengah
   - Palapa Ring Timur

     <img src="static/imgdocs/paring.png" alt="Paring" width="700" height="400">

**Edit Value (okupansi, nilai kontrak, periode)**

1. Pastikan layer yang terbuka adalah Palapa Ring (Barat/Tengah/Timur)

<img src="static/imgdocs/paring.png" alt="Paring" width="700" height="400">

2. Klik objek → detail di sidebar.

3. Edit value (cth. Okupansi) → Simpan. Untuk melihat history perubahan nilai okupansi klik tombol "Update History" di list tombol sebelah kiri

# Editing script

Disarankan menjalankan dan mengedit script secara lokal untuk mengedit fitur peta dll. Kemudian dapat dipush ke github jika sudah selesai

## 1) Siapkan Python package dan virtual environment

```bash
# Install paket yang dibutuhkan❗❗❗
pip install flask flask-cors psycopg2-binary python-dotenv pytz

```

**Opsional (lebih rapi dan simpel):** buat file `requirements.txt` kemudian isi package yg akan diinstall:

```txt
flask
flask-cors
psycopg2-binary
python-dotenv
pytz
```

Kemudian install dengan:

```bash
pip install -r requirements.txt
```

## 2) Buat virtual environment

**Windows PowerShell:**

- python -m venv .venv

- .venv\Scripts\Activate

**macOS/Linux:**

- python3 -m venv .venv

- source .venv/bin/activate

## 3) Jalankan Aplikasi

```bash
# Jalankan di terminal
python app.py
```

Aplikasi akan tampil di: **http://127.0.0.1:5000** (alias **http://localhost:5000**).

## 4) Edit scriptnya

## 🧩 Modul Frontend Utama

- `config.js` – state global (layer groups, flags, BASE `/api`).
- `baseLayers.js` – basemap (Google Satellite, OSM).
- `mapInit.js` – inisialisasi map, legend, layer control.
- `layers-palapa.js` – loader GeoJSON dari API + style titik/garis + sidebar.
- `layers-e2e-points.js` – layer E2E points (pane khusus, label permanen, search).
- `layers-extra.js` – popup _evidence_ (view/unggah/hapus), mapping kategori→tabel (fallback).
- `markers.js` – tambah marker/manual draw (Geoman) + hitung jarak polyline + submit modal.
- `controls.js` – toggle label, tombol History, kontrol search, kontrol Geoman minimal.
- `sidebar.js` – modal History, util gambar, integrasi sidebar.
- `utils.js` – format Rupiah, toast notification, show/hide sidebar.
- `upload.js` – integrasi Supabase Storage untuk unggah dokumen/evidence.
- `map.css` – style peta, legend, sidebar, label, notifikasi.

### Kontak

Jika ada yang ditanyakan, silakan hubungi saya lewat Telegram: [@kazekage718](https://t.me/kazekage718)
