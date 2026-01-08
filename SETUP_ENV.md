# Panduan Setup Environment Variables

## Untuk Development Lokal

### 1. Install Dependencies

```bash
python -m pip install python-dotenv
```

### 2. Buat File `.env`

Copy file `.env.example` menjadi `.env`:

```bash
copy .env.example .env
```

Lalu isi dengan credentials Supabase Anda:

```env
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_NAME=postgres
DB_USER=postgres.wtmfsznnmyinbgzkdofz
DB_PASSWORD=***REMOVED***
DB_PORT=6543
```

### 3. Jalankan Aplikasi

```bash
python app.py
```

---

## Untuk Deployment di Vercel

### 1. Buka Project Settings di Vercel

- Login ke [Vercel Dashboard](https://vercel.com/dashboard)
- Pilih project Anda
- Klik **Settings** → **Environment Variables**

### 2. Tambahkan Environment Variables

Tambahkan 5 variabel berikut:

| Key           | Value                                      |
| ------------- | ------------------------------------------ |
| `DB_HOST`     | `aws-0-ap-southeast-1.pooler.supabase.com` |
| `DB_NAME`     | `postgres`                                 |
| `DB_USER`     | `postgres.wtmfsznnmyinbgzkdofz`            |
| `DB_PASSWORD` | `***REMOVED***`                        |
| `DB_PORT`     | `6543`                                     |

> **Catatan:** Pilih environment **Production**, **Preview**, dan **Development** untuk semua variabel.

### 3. Redeploy

Setelah menambahkan environment variables, klik **Redeploy** untuk menerapkan perubahan.

---

## ⚠️ PENTING: Sebelum Repository Menjadi Public

### Checklist Keamanan

- [ ] Pastikan file `.env` ada di `.gitignore`
- [ ] Verifikasi tidak ada credentials di `app.py`
- [ ] Cek Git history untuk credentials yang ter-commit
- [ ] Test aplikasi lokal dengan environment variables
- [ ] Test aplikasi di Vercel dengan environment variables
- [ ] **SANGAT DISARANKAN:** Ganti password database setelah repository public

### Cara Cek Git History

```bash
git log --all --full-history --source -- app.py
```

Jika menemukan commit yang berisi credentials lama, pertimbangkan untuk:

1. Membuat repository baru yang bersih, atau
2. Menggunakan tools seperti `git filter-branch` atau BFG Repo-Cleaner

---

## Troubleshooting

### Error: "No module named 'dotenv'"

```bash
python -m pip install python-dotenv
```

### Error: Database connection failed

1. Cek apakah file `.env` ada
2. Pastikan semua variabel terisi dengan benar
3. Verifikasi credentials di Supabase dashboard

### Error di Vercel: "Database connection failed"

1. Cek environment variables di Vercel dashboard
2. Pastikan semua 5 variabel sudah ditambahkan
3. Redeploy aplikasi

---

## File Structure

```
my-flask-app/
├── .env                 # ❌ JANGAN commit (ada di .gitignore)
├── .env.example         # ✅ Aman untuk commit
├── .gitignore           # ✅ Pastikan .env ada di sini
├── app.py               # ✅ Tidak ada credentials hardcoded
└── requirements.txt     # ✅ Include python-dotenv
```
