# Checklist Instalasi Lokal di Toko

Gunakan checklist ini saat instalasi awal dan saat hari serah terima.

## A. Perangkat dan Infrastruktur

- [ ] Tersedia 1 perangkat server lokal.
- [ ] Server memakai RAM minimal 8 GB.
- [ ] Server memakai SSD minimal 256 GB.
- [ ] Server ditempatkan di lokasi aman dan berventilasi baik.
- [ ] Router atau access point toko aktif.
- [ ] Semua device kasir dan admin terhubung ke jaringan yang sama.
- [ ] Server menggunakan IP lokal tetap atau reservasi DHCP.
- [ ] UPS tersedia untuk server dan router.

## B. Persiapan Sistem Operasi dan Software

- [ ] Docker terpasang.
- [ ] Docker Compose terpasang.
- [ ] Browser pada perangkat kasir sudah siap dipakai.
- [ ] Folder proyek Kasirin sudah tersedia di server.
- [ ] Hak akses operator server sudah disiapkan.

## C. Konfigurasi Alamat Lokal

- [ ] IP server sudah ditentukan.
- [ ] Alamat frontend final sudah ditentukan, contoh `http://192.168.1.10:3001`.
- [ ] Alamat backend API final sudah ditentukan, contoh `http://192.168.1.10:5001/api`.
- [ ] Nilai build frontend diarahkan ke API server lokal.
- [ ] Nilai `FRONTEND_URL` backend sudah memuat alamat frontend lokal.

## D. Build dan Menjalankan Service

- [ ] Frontend dibangun ulang dengan `REACT_APP_API_URL` yang sesuai IP server.
- [ ] Service database berhasil berjalan.
- [ ] Service backend berhasil berjalan.
- [ ] Service frontend berhasil berjalan.
- [ ] `docker-compose ps` menunjukkan service dalam kondisi up.

## E. Pengujian Fungsional Minimum

- [ ] Login admin berhasil.
- [ ] Login kasir berhasil.
- [ ] Dashboard dapat dibuka.
- [ ] Data produk dapat ditampilkan.
- [ ] Transaksi penjualan uji berhasil.
- [ ] Stok berubah setelah transaksi uji.
- [ ] Laporan penjualan dapat dibuka.
- [ ] Laporan inventaris dapat dibuka.
- [ ] Logout berhasil.

## F. Data Awal

- [ ] User toko sudah dibuat.
- [ ] Password awal sudah diserahkan ke PIC toko.
- [ ] Daftar produk sudah dimasukkan.
- [ ] Stok awal sudah dimasukkan.
- [ ] Supplier sudah dimasukkan.
- [ ] Harga jual awal sudah diverifikasi.

## G. Backup dan Recovery

- [ ] Folder backup database sudah ditentukan.
- [ ] Backup manual berhasil dicoba.
- [ ] File backup berhasil diverifikasi tersimpan.
- [ ] Prosedur restore dasar sudah dijelaskan ke PIC toko.
- [ ] Lokasi backup cadangan di luar server sudah ditentukan.

## H. Training Pengguna

- [ ] Kasir sudah dilatih transaksi dasar.
- [ ] Admin atau gudang sudah dilatih input stok.
- [ ] Manager atau owner sudah dilatih akses laporan.
- [ ] PIC toko sudah dilatih start, stop, restart, dan backup.

## I. Dokumen Serah Terima

- [ ] SOP penyerahan lokal diserahkan.
- [ ] Panduan operasional Docker diserahkan.
- [ ] Daftar akun awal diserahkan.
- [ ] Kontak support diserahkan.
- [ ] Berita acara serah terima ditandatangani.

## Status Akhir

- [ ] Sistem siap live di toko.
- [ ] Tanggal go-live ditetapkan.
- [ ] PIC toko ditetapkan.
- [ ] Masa pendampingan pasca go-live dijadwalkan.