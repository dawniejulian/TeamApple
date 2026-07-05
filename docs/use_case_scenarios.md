# Skenario Use Case - Sistem Kasirin (TeamApple)

Dokumen ini mendokumentasikan skenario lengkap untuk setiap *use case* yang terdapat pada Diagram Use Case sistem **TeamApple (Kasirin)**. Sistem ini memiliki tiga aktor utama: **Admin**, **Staff**, dan **Pelanggan**.

---

## Ringkasan Aktor

1. **Admin** (Aktor Internal)  
   Pengguna dengan wewenang tertinggi. Bertanggung jawab atas pengelolaan produk, stok, kasir POS, operasional shift, purchase order, peninjauan laporan, dan konfigurasi pengaturan sistem.
2. **Staff** (Aktor Internal)  
   Pengguna operasional toko. Memiliki wewenang yang hampir sama dengan Admin dalam hal operasional harian (produk, stok, POS, shift, purchase order, laporan) namun **tidak memiliki akses** ke menu Pengaturan sistem.
3. **Pelanggan** (Aktor Eksternal)  
   Pengguna umum/publik yang berinteraksi dengan sistem tanpa perlu masuk (login) untuk melihat katalog produk serta informasi kontak toko.

---

## Daftar Skenario Use Case

### 1. UC-01: Melakukan Login
* **Aktor Utama**: Admin, Staff
* **Deskripsi**: Aktor internal melakukan masuk (login) ke dalam sistem untuk mendapatkan hak akses operasional sesuai dengan role masing-masing.
* **Prasyarat**: Akun pengguna sudah terdaftar dan aktif di dalam sistem.
* **Kondisi Akhir**: Pengguna berhasil masuk dan sistem menampilkan halaman Dashboard Utama.
* **Alur Utama**:
  1. Pengguna membuka halaman Login sistem Kasirin.
  2. Sistem menampilkan form login (input Username/Email dan Password).
  3. Pengguna memasukkan Username/Email dan Password yang valid, lalu menekan tombol **Login**.
  4. Sistem memverifikasi kredensial pengguna di database.
  5. Sistem mengidentifikasi role pengguna (Admin/Staff) dan mengarahkan pengguna ke halaman Dashboard Utama dengan menu akses yang sesuai.
* **Alur Eksepsi**:
  * **3.a. Kredensial tidak cocok/salah:**
    1. Sistem mendeteksi bahwa kombinasi username/email atau password tidak valid.
    2. Sistem menampilkan pesan error: *"Username atau Password salah."*
    3. Sistem mengembalikan pengguna ke halaman Login.

---

### 2. UC-02: Kelola Produk
* **Aktor Utama**: Admin, Staff
* **Deskripsi**: Pengguna mengelola data produk di toko (menambah produk baru, mengubah informasi produk, atau menghapus produk).
* **Prasyarat**: Pengguna telah login ke sistem.
* **Kondisi Akhir**: Informasi produk berhasil ditambahkan, diubah, atau dihapus dari database.
* **Alur Utama (Tambah Produk)**:
  1. Pengguna memilih menu **Kelola Produk** pada dashboard.
  2. Sistem menampilkan daftar produk yang ada.
  3. Pengguna menekan tombol **Tambah Produk**.
  4. Sistem menampilkan formulir data produk (Nama Produk, Kategori, Harga Beli, Harga Jual, Deskripsi, Gambar, dll.).
  5. Pengguna mengisi formulir dan menekan tombol **Simpan**.
  6. Sistem melakukan validasi data, menyimpan produk ke database, dan menampilkan pesan sukses: *"Produk berhasil ditambahkan."*
* **Alur Alternatif (Ubah Produk)**:
  * Pada langkah 3, pengguna memilih salah satu produk lalu menekan tombol **Ubah**.
  * Sistem memuat data lama ke dalam formulir.
  * Pengguna mengubah informasi yang diinginkan lalu menekan tombol **Update**.
  * Sistem memperbarui data di database dan menampilkan pesan sukses: *"Produk berhasil diperbarui."*
* **Alur Alternatif (Hapus Produk)**:
  * Pada langkah 3, pengguna memilih salah satu produk lalu menekan tombol **Hapus**.
  * Sistem memunculkan dialog konfirmasi: *"Apakah Anda yakin ingin menghapus produk ini?"*
  * Pengguna menekan **Ya, Hapus**.
  * Sistem menghapus produk secara logis/fisik dari database dan menampilkan pesan: *"Produk berhasil dihapus."*
* **Alur Eksepsi**:
  * **5.a. Validasi gagal (misal: harga bernilai negatif atau nama produk kosong):**
    1. Sistem menandai input yang tidak valid dan membatalkan penyimpanan.
    2. Sistem menampilkan pesan error sesuai jenis validasi.
    3. Pengguna memperbaiki input dan menekan **Simpan** kembali.

---

### 3. UC-03: Kelola Stok
* **Aktor Utama**: Admin, Staff
* **Deskripsi**: Pengguna melakukan pencatatan stok masuk, penyesuaian (adjusment) stok, atau melihat daftar stok barang yang tersedia.
* **Prasyarat**: Pengguna telah login ke sistem.
* **Kondisi Akhir**: Jumlah stok produk terupdate secara real-time di database.
* **Alur Utama (Input Stok Masuk)**:
  1. Pengguna memilih menu **Kelola Stok** pada dashboard.
  2. Sistem menampilkan daftar stok produk saat ini.
  3. Pengguna mencari produk yang ingin ditambah stoknya, kemudian menekan tombol **Input Stok Masuk**.
  4. Sistem menampilkan form input (Jumlah Stok Masuk, Sumber Stok/Supplier, Keterangan).
  5. Pengguna mengisi jumlah stok masuk dan menekan tombol **Simpan**.
  6. Sistem mengupdate jumlah stok akhir produk tersebut dan mencatat riwayat mutasi stok.
  7. Sistem menampilkan pesan sukses: *"Stok berhasil ditambahkan."*
* **Alur Eksepsi**:
  * **5.a. Nilai stok tidak valid:**
    1. Jika input jumlah stok masuk bernilai $\le 0$ atau bukan angka, sistem menampilkan pesan kesalahan.
    2. Sistem meminta pengguna memasukkan nominal angka positif yang valid.

---

### 4. UC-04: Melakukan Kasir POS
* **Aktor Utama**: Admin, Staff
* **Deskripsi**: Pengguna memproses transaksi penjualan langsung kepada pelanggan di kasir menggunakan sistem Point of Sale (POS).
* **Prasyarat**: Pengguna telah login dan shift kerja dalam keadaan aktif (telah dibuka).
* **Kondisi Akhir**: Transaksi penjualan tercatat di database, stok produk otomatis berkurang, dan struk belanja tercetak.
* **Alur Utama**:
  1. Pengguna membuka modul **Kasir POS**.
  2. Pengguna mencari atau memindai barcode produk yang dibeli pelanggan.
  3. Sistem menambahkan produk ke dalam daftar keranjang belanja (cart) dan menghitung total harga secara otomatis.
  4. Pengguna menekan tombol **Bayar**.
  5. Sistem menampilkan pilihan metode pembayaran (Tunai, Debit/Kredit, E-Wallet, QRIS) dan nominal uang yang harus dibayarkan.
  6. Pengguna memilih metode pembayaran dan memasukkan nominal uang yang diterima dari pelanggan.
  7. Sistem menghitung kembalian (jika tunai) dan mengaktifkan tombol **Selesai Transaksi**.
  8. Pengguna menekan tombol **Proses Transaksi**.
  9. Sistem menyimpan data transaksi, mengurangi stok produk secara otomatis, dan menampilkan struk belanja serta pilihan cetak.
* **Alur Eksepsi**:
  * **3.a. Stok tidak mencukupi:**
    1. Sistem memberikan notifikasi peringatan bahwa produk tersebut kehabisan stok atau stok kurang dari permintaan.
    2. Pengguna menyesuaikan kuantitas produk dalam keranjang atau membatalkan item tersebut.
  * **6.a. Uang pembayaran kurang dari total belanja:**
    1. Sistem mendeteksi nominal input uang bayar < total tagihan.
    2. Sistem menonaktifkan tombol konfirmasi pembayaran dan memunculkan pesan peringatan.

---

### 5. UC-05: Buka / Tutup Shift
* **Aktor Utama**: Admin, Staff
* **Deskripsi**: Pengguna membuka shift kasir (memasukkan kas awal) sebelum memulai penjualan, dan menutup shift kasir (memasukkan kas akhir dan mencocokkan total uang fisik) di akhir jam kerja.
* **Prasyarat**: Pengguna telah login ke sistem.
* **Kondisi Akhir**: Data shift (waktu mulai/selesai, kas awal/akhir, selisih kas) tersimpan di database.
* **Alur Utama (Buka Shift)**:
  1. Pengguna masuk ke menu **Manajemen Shift**.
  2. Sistem mendeteksi tidak ada shift yang aktif untuk pengguna tersebut dan menampilkan form **Buka Shift**.
  3. Pengguna memasukkan nominal kas awal (modal kasir awal di laci) dan menekan tombol **Mulai Shift**.
  4. Sistem mencatat waktu mulai shift, nominal kas awal, dan mengaktifkan fitur Kasir POS.
* **Alur Utama (Tutup Shift)**:
  1. Pengguna masuk ke menu **Manajemen Shift**.
  2. Sistem menampilkan ringkasan penjualan selama shift berjalan (total penjualan tunai, non-tunai, dll.) dan kolom input **Kas Akhir (Fisik)**.
  3. Pengguna menghitung uang fisik di laci kasir dan menginput nominal tersebut ke dalam kolom kas akhir.
  4. Pengguna menekan tombol **Tutup Shift**.
  5. Sistem menghitung selisih antara kas akhir fisik dengan kalkulasi sistem, menyimpan status shift menjadi ditutup, dan menampilkan laporan ringkasan shift.
* **Alur Eksepsi**:
  * **3.a. Terjadi selisih uang kas (kurang/lebih):**
    1. Sistem menampilkan peringatan selisih kas (misal: kurang Rp 15.000).
    2. Sistem mewajibkan pengguna untuk mengisi kolom "Keterangan Selisih" sebelum menekan tombol Tutup Shift.

---

### 6. UC-06: Purchase Order
* **Aktor Utama**: Admin, Staff
* **Deskripsi**: Pengguna membuat dokumen pemesanan pembelian produk ke pemasok (supplier) untuk menyuplai stok toko.
* **Prasyarat**: Pengguna telah login ke sistem.
* **Kondisi Akhir**: Dokumen Purchase Order berhasil dibuat dengan status "Pending" atau "Dikirim" di sistem.
* **Alur Utama**:
  1. Pengguna memilih menu **Purchase Order**.
  2. Sistem menampilkan daftar Purchase Order yang pernah dibuat.
  3. Pengguna menekan tombol **Buat PO Baru**.
  4. Sistem menampilkan form PO (Pemilihan Supplier, Tanggal Estimasi, Daftar Produk, Jumlah/Kuantitas Pesan, dan Harga Satuan).
  5. Pengguna memilih supplier dan memasukkan daftar produk beserta kuantitas pesanan.
  6. Pengguna menekan tombol **Simpan & Kirim PO**.
  7. Sistem menyimpan dokumen PO di database dengan nomor PO unik, dan mengubah statusnya menjadi "Pending".
* **Alur Eksepsi**:
  * **5.a. Supplier belum terdaftar di sistem:**
    1. Pengguna harus keluar dari form PO sementara dan masuk ke menu manajemen supplier untuk mendaftarkan supplier baru terlebih dahulu.

---

### 7. UC-07: Akses Laporan
* **Aktor Utama**: Admin, Staff
* **Deskripsi**: Pengguna mengakses berbagai laporan bisnis seperti laporan penjualan harian/bulanan, laporan stok tipis, laporan shift, dan omset toko.
* **Prasyarat**: Pengguna telah login ke sistem.
* **Kondisi Akhir**: Sistem menyajikan data laporan yang akurat berdasarkan filter waktu yang dipilih.
* **Alur Utama**:
  1. Pengguna memilih menu **Laporan**.
  2. Sistem menampilkan opsi kategori laporan (Laporan Penjualan, Laporan Stok, Laporan Shift, Laporan Keuntungan/Kerugian).
  3. Pengguna memilih kategori laporan yang diinginkan.
  4. Pengguna menentukan filter parameter (misal: filter tanggal 01-06-2026 hingga 18-06-2026, filter kategori produk).
  5. Pengguna menekan tombol **Tampilkan Laporan**.
  6. Sistem memproses data transaksi dari database dan menampilkan laporan dalam bentuk tabel dan grafik.
* **Alur Alternatif (Cetak/Ekspor)**:
  * Setelah langkah 6, pengguna menekan tombol **Ekspor PDF** atau **Ekspor Excel**.
  * Sistem mengunduh berkas laporan tersebut ke perangkat pengguna.

---

### 8. UC-08: Akses Pengaturan
* **Aktor Utama**: Admin (Hanya Admin)
* **Deskripsi**: Admin mengonfigurasi pengaturan sistem global, informasi profil toko (nama toko, alamat, kontak WhatsApp), serta mengelola akun pengguna (tambah/edit/hapus akun Staff dan Admin lain).
* **Prasyarat**: Pengguna telah login sebagai **Admin**.
* **Kondisi Akhir**: Pengaturan sistem terbarui dan tersimpan di database.
* **Alur Utama**:
  1. Admin memilih menu **Pengaturan**.
  2. Sistem menampilkan panel pengaturan yang terdiri dari:
     * Pengaturan Toko (Nama, Alamat, Logo, WhatsApp)
     * Manajemen Pengguna (Daftar Akun Admin/Staff)
     * Backup & Restore Database
  3. Admin memilih menu yang ingin diubah (contoh: **Manajemen Pengguna**).
  4. Admin membuat akun staff baru, mengubah password staff, atau menonaktifkan akun staff tertentu.
  5. Admin menekan tombol **Simpan Perubahan**.
  6. Sistem memvalidasi dan menyimpan perubahan ke konfigurasi database.
* **Alur Eksepsi**:
  * **1.a. Staff mencoba mengakses menu ini:**
    1. Sistem tidak menampilkan menu "Pengaturan" pada dashboard Staff.
    2. Apabila Staff mencoba mengakses alamat URL pengaturan secara manual, sistem mendeteksi kegagalan otorisasi, memblokir akses, dan mengalihkan Staff ke dashboard dengan pesan error: *"Akses Ditolak: Halaman ini hanya untuk Admin."*

---

### 9. UC-09: Melihat Katalog Produk
* **Aktor Utama**: Pelanggan, Staff
* **Deskripsi**: Pengguna mencari dan melihat katalog produk toko yang tersedia (termasuk foto produk, deskripsi, harga, dan ketersediaan).
* **Prasyarat**:
  * **Pelanggan**: Mengakses website publik toko (tanpa perlu login).
  * **Staff**: Mengakses aplikasi internal Kasirin.
* **Kondisi Akhir**: Sistem menampilkan detail informasi produk yang dicari oleh pengguna.
* **Alur Utama**:
  1. Pengguna membuka halaman **Katalog Produk**.
  2. Sistem menampilkan daftar produk yang tersedia di toko beserta harga dan gambar.
  3. Pengguna memasukkan kata kunci pencarian di kolom pencarian (misal: "iPhone 13") atau memilih filter kategori produk.
  4. Sistem menampilkan daftar produk yang relevan.
  5. Pengguna mengklik salah satu produk untuk melihat detail spesifikasi, harga jual, dan ketersediaan stok di toko.
* **Alur Eksepsi**:
  * **4.a. Produk tidak ditemukan:**
    1. Sistem menampilkan teks pemberitahuan: *"Produk tidak ditemukan. Coba gunakan kata kunci lainnya."*

---

### 10. UC-10: Akses Info & Kontak
* **Aktor Utama**: Pelanggan, Staff
* **Deskripsi**: Pengguna melihat informasi umum mengenai toko seperti alamat fisik, jam buka/tutup operasional, dan nomor kontak yang dapat dihubungi.
* **Prasyarat**: Pengguna membuka halaman informasi toko.
* **Kondisi Akhir**: Sistem menampilkan detail informasi toko beserta tombol aksi untuk menghubungi toko.
* **Alur Utama**:
  1. Pengguna mengakses halaman **Tentang Toko / Hubungi Kami**.
  2. Sistem memuat data profil toko dari database.
  3. Sistem menampilkan informasi alamat lengkap, peta lokasi (jika terintegrasi), jam operasional, dan tombol "Hubungi Kami via WhatsApp".
  4. Pengguna menekan tombol **Hubungi Kami via WhatsApp**.
  5. Sistem secara otomatis membuka tautan WhatsApp API (`wa.me`) dengan nomor tujuan toko beserta pesan pembuka bawaan (*template message*).
