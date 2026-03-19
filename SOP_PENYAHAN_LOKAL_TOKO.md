# SOP Penyerahan Lokal ke Toko

## Tujuan

Dokumen ini dipakai saat sistem Kasirin diserahkan ke toko dalam mode lokal, yaitu aplikasi berjalan di jaringan internal toko tanpa wajib di-host ke internet.

## Skema Implementasi

- 1 perangkat dijadikan server lokal.
- Frontend, backend, dan database berjalan di server lokal menggunakan Docker.
- Komputer kasir, admin, atau owner di dalam toko mengakses sistem melalui browser ke alamat IP server lokal.

Contoh akses:

- Frontend: `http://192.168.1.10:3001`
- Backend API: `http://192.168.1.10:5001/api`

## Peran Saat Handover

- Pihak pengembang: instalasi, konfigurasi, pengujian, training, dan dokumentasi.
- PIC toko: menyediakan perangkat server, jaringan lokal, dan operator yang akan menerima training.

## Prasyarat Sebelum Handover

- Tersedia 1 perangkat server lokal dengan spesifikasi minimal RAM 8 GB dan SSD 256 GB.
- Docker dan Docker Compose sudah terpasang di perangkat server.
- Router atau access point toko aktif.
- Semua perangkat kasir dan admin berada di jaringan yang sama.
- Data awal toko sudah siap atau minimal formatnya sudah disepakati.

## Prosedur Penyerahan

### 1. Siapkan perangkat server

- Pastikan perangkat server stabil dan tidak dipakai untuk aktivitas lain yang berat.
- Pastikan perangkat bisa menyala penuh selama jam operasional toko.
- Nonaktifkan kebijakan sleep otomatis saat toko buka.

### 2. Tentukan IP server lokal

- Gunakan IP lokal tetap atau reservasi DHCP dari router.
- Catat IP final server yang akan dipakai semua user.
- Jangan gunakan `localhost` untuk akses user selain dari perangkat server itu sendiri.

Contoh IP final:

- `192.168.1.10`

### 3. Sesuaikan konfigurasi frontend dan backend

Karena frontend React di proyek ini membaca `REACT_APP_API_URL` saat build, alamat API harus diarahkan ke IP server toko sebelum frontend dibangun.

Nilai yang harus dipakai:

- `REACT_APP_API_URL=http://IP_SERVER:5001/api`
- `FRONTEND_URL=http://IP_SERVER:3001,http://localhost:3001`

Contoh:

- `REACT_APP_API_URL=http://192.168.1.10:5001/api`
- `FRONTEND_URL=http://192.168.1.10:3001,http://localhost:3001`

### 4. Jalankan build dan service

Di folder proyek, jalankan penyesuaian build frontend lalu hidupkan seluruh service.

Contoh prosedur operasional:

```bash
docker-compose build --build-arg REACT_APP_API_URL=http://192.168.1.10:5001/api frontend
docker-compose up -d
```

Catatan:

- Jika `docker-compose.yml` masih memakai nilai `FRONTEND_URL` bawaan `http://localhost:3001`, ubah nilainya terlebih dahulu menjadi alamat server lokal.
- Setelah perubahan alamat API, frontend harus di-build ulang.

### 5. Verifikasi akses lokal

Lakukan pengujian minimal dari:

- perangkat server
- 1 komputer kasir
- 1 perangkat admin atau owner jika ada

Yang wajib dicek:

- halaman login dapat dibuka
- login berhasil
- dashboard tampil
- transaksi penjualan bisa dibuat
- stok berubah setelah transaksi
- laporan dapat diakses
- logout berhasil

### 6. Input atau impor data awal

Minimal data berikut harus tersedia sebelum toko live:

- user dan role
- kategori produk
- daftar produk
- stok awal
- supplier
- pengaturan harga

### 7. Training pengguna

Training minimal dibagi menjadi:

- kasir: login, transaksi, tutup shift
- admin atau gudang: stok masuk, stok keluar, penyesuaian stok
- manager atau owner: laporan, monitoring, user management dasar
- PIC teknis toko: start, stop, restart, backup, cek status service

### 8. Serah dokumen operasional

Dokumen yang harus ikut diserahkan:

- SOP penyerahan lokal ini
- checklist instalasi toko
- panduan start, stop, restart, dan backup
- daftar akun awal
- lokasi file backup
- kontak support

### 9. Masa pendampingan awal

Disarankan ada masa pendampingan setelah go-live selama 3 sampai 7 hari operasional pertama.

Fokus pendampingan:

- login user
- transaksi riil
- akurasi stok
- kendala jaringan lokal
- backup harian

## Kriteria Penyerahan Dinilai Selesai

Penyerahan lokal dinyatakan selesai jika seluruh poin berikut terpenuhi:

- sistem bisa diakses dari perangkat toko melalui IP server lokal
- user toko bisa login sesuai peran
- transaksi uji berhasil
- laporan uji berhasil
- backup berhasil dibuat
- PIC toko memahami cara menjalankan dan menghentikan sistem
- dokumen operasional sudah diterima oleh PIC toko

## Risiko yang Harus Dijelaskan ke Toko

- Jika server lokal mati, seluruh sistem tidak bisa dipakai sementara.
- Jika jaringan lokal bermasalah, perangkat lain tidak bisa mengakses sistem.
- Jika tidak ada backup rutin, data berisiko hilang saat perangkat rusak.
- Jika IP server berubah, akses user ke aplikasi bisa putus sampai alamat diperbarui.

## Rekomendasi Operasional

- Gunakan IP lokal tetap.
- Sediakan UPS untuk server dan router.
- Lakukan backup database setiap hari setelah toko tutup.
- Simpan minimal 1 salinan backup di luar perangkat server.