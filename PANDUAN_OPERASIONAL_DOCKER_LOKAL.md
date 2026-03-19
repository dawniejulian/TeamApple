# Panduan Operasional Docker Lokal

Dokumen ini dipakai oleh PIC toko atau admin teknis untuk menjalankan Kasirin dalam mode lokal.

## Lokasi Proyek

Contoh lokasi proyek:

```bash
cd /Users/mac/Document/kasirin
```

Sesuaikan jika folder proyek berada di lokasi lain pada perangkat server toko.

## Alamat Akses Sistem

Ganti `IP_SERVER` dengan IP perangkat server lokal.

- Frontend: `http://IP_SERVER:3001`
- Backend API: `http://IP_SERVER:5001/api`
- Health check backend: `http://IP_SERVER:5001/health`

Contoh:

- `http://192.168.1.10:3001`
- `http://192.168.1.10:5001/health`

## Perintah Dasar

### Menjalankan sistem

```bash
cd /Users/mac/Document/kasirin
docker-compose up -d
```

### Menjalankan ulang dengan build baru

Gunakan ini jika ada perubahan konfigurasi frontend atau backend.

```bash
cd /Users/mac/Document/kasirin
docker-compose up -d --build
```

### Menghentikan sistem

```bash
cd /Users/mac/Document/kasirin
docker-compose down
```

### Melihat status service

```bash
cd /Users/mac/Document/kasirin
docker-compose ps
```

### Melihat log jika ada masalah

```bash
cd /Users/mac/Document/kasirin
docker-compose logs --tail=100
```

Untuk service tertentu:

```bash
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 frontend
docker-compose logs --tail=100 db
```

## Prosedur Awal Saat Instalasi di Toko

### 1. Tentukan IP server

Contoh IP server lokal:

- `192.168.1.10`

### 2. Build frontend dengan alamat API lokal

Frontend React di proyek ini membaca alamat API saat build. Jadi jika server akan diakses dari perangkat lain di toko, frontend harus dibangun menggunakan IP server lokal.

Contoh:

```bash
cd /Users/mac/Document/kasirin
docker-compose build --build-arg REACT_APP_API_URL=http://192.168.1.10:5001/api frontend
```

### 3. Pastikan backend mengizinkan asal frontend lokal

Di `docker-compose.yml`, nilai `FRONTEND_URL` untuk service backend harus memuat alamat frontend lokal.

Contoh nilai yang benar:

```text
http://192.168.1.10:3001,http://localhost:3001
```

Jika nilai ini belum sesuai, ubah dulu lalu jalankan ulang build atau start service.

### 4. Jalankan semua service

```bash
cd /Users/mac/Document/kasirin
docker-compose up -d
```

## Pemeriksaan Harian

### Saat toko buka

```bash
cd /Users/mac/Document/kasirin
docker-compose ps
```

Pastikan ketiga service berikut aktif:

- `kasirin_db`
- `kasirin_backend`
- `kasirin_frontend`

Lalu buka browser dan cek:

- `http://IP_SERVER:3001`

### Saat toko tutup

- Pastikan transaksi hari itu sudah selesai.
- Jalankan backup database.
- Simpan hasil backup ke lokasi aman.

## Backup Database

### Backup manual

```bash
cd /Users/mac/Document/kasirin
mkdir -p backups
docker exec kasirin_db pg_dump -U postgres kasirin_db > backups/kasirin_$(date +%Y%m%d_%H%M%S).sql
```

Hasil backup akan tersimpan di folder `backups`.

### Verifikasi backup

```bash
ls -lh backups
```

Pastikan file backup terbaru muncul dan ukurannya tidak nol.

## Restart Jika Ada Kendala

### Restart semua service

```bash
cd /Users/mac/Document/kasirin
docker-compose down
docker-compose up -d
```

### Restart satu service saja

```bash
cd /Users/mac/Document/kasirin
docker-compose restart backend
docker-compose restart frontend
docker-compose restart db
```

## Troubleshooting Ringkas

### Kasus: halaman frontend tidak bisa dibuka

Langkah cek:

- pastikan server menyala
- jalankan `docker-compose ps`
- cek apakah `frontend` dalam kondisi up
- cek alamat yang dibuka user sudah memakai IP server yang benar

### Kasus: frontend terbuka tapi gagal login atau gagal ambil data

Langkah cek:

- pastikan `backend` dalam kondisi up
- cek `http://IP_SERVER:5001/health`
- cek nilai `REACT_APP_API_URL` saat build frontend
- cek nilai `FRONTEND_URL` backend untuk kebutuhan CORS

### Kasus: data tidak tersimpan

Langkah cek:

- pastikan `db` dalam kondisi up
- lihat log database dan backend
- cek ruang disk server masih cukup

## Akun Demo Awal

Gunakan akun ini hanya saat serah terima awal dan segera ganti sesuai kebutuhan toko.

- Admin: `admin / admin123`
- Manager: `manager1 / admin123`
- Cashier: `kasir1 / admin123`
- Warehouse: `warehouse1 / admin123`

## Batas Tanggung Jawab Operasional Lokal

Mode lokal bergantung pada:

- perangkat server tetap sehat
- jaringan lokal tetap aktif
- backup dilakukan rutin

Jika salah satu dari tiga hal itu gagal, operasional toko dapat terganggu walaupun aplikasi tidak berubah.