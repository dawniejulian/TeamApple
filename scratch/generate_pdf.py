# -*- coding: utf-8 -*-
import sys
from fpdf import FPDF

class KasirinDocPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font("helvetica", "I", 8)
            self.set_text_color(100, 110, 120)
            self.cell(100, 10, "KASIRIN - Dokumentasi Fitur Sistem POS & Inventaris Terintegrasi", 0, 0, "L")
            self.cell(90, 10, "Halaman " + str(self.page_no()), 0, 1, "R")
            self.set_draw_color(200, 210, 220)
            self.line(10, 18, 200, 18)
            self.ln(5)

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-15)
            self.set_font("helvetica", "I", 8)
            self.set_text_color(150, 150, 150)
            self.cell(100, 10, "Hak Cipta (c) 2026 Kasirin Team. Semua Hak Dilindungi.", 0, 0, "L")
            self.cell(90, 10, "Hal " + str(self.page_no()) + " dari {nb}", 0, 0, "R")

def create_pdf(output_path):
    pdf = KasirinDocPDF(orientation="P", unit="mm", format="A4")
    pdf.alias_nb_pages()
    
    # ---------------- PAGE 1: COVER PAGE ----------------
    pdf.add_page()
    
    # Background decorations
    pdf.set_fill_color(240, 245, 255)
    pdf.rect(0, 0, 210, 297, "F")
    
    # Accent color block on left
    pdf.set_fill_color(30, 64, 175) # Dark Blue
    pdf.rect(0, 0, 20, 297, "F")
    
    # Top subtitle
    pdf.set_font("helvetica", "B", 12)
    pdf.set_text_color(30, 64, 175)
    pdf.set_xy(30, 60)
    pdf.cell(0, 10, "DOKUMEN DOKUMENTASI SISTEM", 0, 1, "L")
    
    # Title
    pdf.set_font("helvetica", "B", 36)
    pdf.set_text_color(17, 24, 39)
    pdf.set_x(30)
    pdf.cell(0, 18, "KASIRIN", 0, 1, "L")
    
    # Title Sub
    pdf.set_font("helvetica", "B", 18)
    pdf.set_text_color(75, 85, 99)
    pdf.set_x(30)
    pdf.multi_cell(0, 10, "Sistem Point of Sale (POS) &\nManajemen Inventaris Terintegrasi Toko Apple")
    
    pdf.set_draw_color(30, 64, 175)
    pdf.set_line_width(1.5)
    pdf.line(30, 120, 120, 120)
    
    # Description block
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(55, 65, 81)
    pdf.set_xy(30, 130)
    desc = ("Kasirin adalah solusi POS (Point of Sale) modern yang dirancang khusus "
            "untuk mengoptimalkan operasional retail toko Apple (TeamApple.Hub). "
            "Sistem ini mencakup manajemen inventaris real-time, sinkronisasi transaksi "
            "dengan shift kasir, laporan penjualan analitis, pencetakan struk instan, "
            "serta keamanan akses berbasis peran (Admin dan Staff).")
    pdf.multi_cell(150, 6, desc)
    
    # Metadata footer
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(30, 64, 175)
    pdf.set_xy(30, 220)
    pdf.cell(0, 6, "Pengembang: Team Antigravity AI (Google DeepMind Team)", 0, 1, "L")
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(75, 85, 99)
    pdf.set_x(30)
    pdf.cell(0, 6, "Versi Aplikasi: v1.1.0 (Day 2 Complete)", 0, 1, "L")
    pdf.set_x(30)
    pdf.cell(0, 6, "Tanggal Rilis Dokumen: 31 Mei 2026", 0, 1, "L")
    pdf.set_x(30)
    pdf.cell(0, 6, "Status Rilis: Siap Uji (Dockerized Environment)", 0, 1, "L")

    # ---------------- PAGE 2: TABLE OF CONTENTS & INTRO ----------------
    pdf.add_page()
    pdf.set_text_color(17, 24, 39)
    
    # Title
    pdf.set_font("helvetica", "B", 20)
    pdf.cell(0, 10, "Daftar Isi & Pendahuluan", 0, 1, "L")
    pdf.ln(5)
    
    # Brief intro
    pdf.set_font("helvetica", "", 10)
    intro_txt = ("Dokumen ini menjelaskan secara rinci seluruh fitur utama yang terdapat pada sistem Kasirin. "
                 "Sistem ini dibangun dengan arsitektur terpisah antara Backend API (Express.js + PostgreSQL) dan "
                 "Frontend Client (React + Redux + TailwindCSS). Memenuhi semua ekspektasi fungsional kasir toko modern "
                 "dengan antarmuka premium dan performa tinggi.")
    pdf.multi_cell(0, 5, intro_txt)
    pdf.ln(10)
    
    # Table of contents list
    pdf.set_font("helvetica", "B", 12)
    pdf.set_text_color(30, 64, 175)
    pdf.cell(0, 8, "DAFTAR FITUR & MODUL UTAMA", 0, 1, "L")
    pdf.ln(2)
    
    toc_items = [
        ("1. Dashboard & Analisis Performa Penjualan", "Hal 3"),
        ("2. Manajemen Produk (CRUD Lengkap & Kategori)", "Hal 3"),
        ("3. Manajemen Stok & Inventaris (Inventory Tracking)", "Hal 4"),
        ("4. Sistem Kasir POS (Point of Sale - Multi-Produk & Diskon per Item)", "Hal 4"),
        ("5. Manajemen Shift & Pencatatan Kas Uang Masuk", "Hal 5"),
        ("6. Laporan Penjualan Detail & Informasi Kasir", "Hal 5"),
        ("7. Pencarian & Cetak Struk Instan", "Hal 6"),
        ("8. Manajemen Konfigurasi (Settings & Hak Akses)", "Hal 6"),
        ("9. Dockerization & Operasional Mandiri", "Hal 7"),
    ]
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(55, 65, 81)
    for title, page in toc_items:
        # Draw dot leaders
        pdf.cell(150, 8, title, 0, 0, "L")
        pdf.cell(0, 8, page, 0, 1, "R")
        pdf.set_draw_color(220, 225, 230)
        pdf.set_line_width(0.2)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        
    # ---------------- PAGE 3: SECTIONS 1 & 2 ----------------
    pdf.add_page()
    
    # Section 1
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(30, 64, 175)
    pdf.cell(0, 10, "1. Dashboard & Analisis Performa Penjualan", 0, 1, "L")
    pdf.set_draw_color(30, 64, 175)
    pdf.set_line_width(0.5)
    pdf.line(10, pdf.get_y(), 80, pdf.get_y())
    pdf.ln(4)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(55, 65, 81)
    s1_text = ("Dashboard Kasirin menyajikan analitik visual real-time mengenai performa penjualan toko. "
               "Fitur-fitur utama di modul ini meliputi:\n"
               "- Ringkasan Angka Utama: Menampilkan Total Pendapatan, Jumlah Transaksi, Total Produk Terjual, "
               "dan Total Uang Kas aktif.\n"
               "- Grafik Tren Penjualan: Grafik interaktif harian dan mingguan yang memudahkan pemilik memantau "
               "fluktuasi omset penjualan.\n"
               "- Analisis Performa Kasir (Khusus Admin): Menampilkan total penjualan, rata-rata transaksi, "
               "dan performa masing-masing kasir (Admin vs Staff). Fitur ini eksklusif bagi akun dengan hak akses "
               "ADMIN (Pemilik), memberikan transparansi penuh terhadap kinerja staf lapangan secara real-time.")
    pdf.multi_cell(0, 5, s1_text)
    pdf.ln(8)
    
    # Section 2
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(30, 64, 175)
    pdf.cell(0, 10, "2. Manajemen Produk (CRUD Lengkap)", 0, 1, "L")
    pdf.line(10, pdf.get_y(), 80, pdf.get_y())
    pdf.ln(4)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(55, 65, 81)
    s2_text = ("Sistem Kasirin memiliki manajemen katalog produk yang kokoh untuk mengelola inventaris "
               "toko Apple (iPhone, iPad, Macbook, Apple Watch, Accessories, dll.).\n"
               "- CRUD Produk Lengkap: Admin dapat Menambah (Create), Membaca (Read), Mengedit (Update), "
               "dan Menghapus (Delete) produk.\n"
               "- SKU & Barcode Unik: Setiap produk dilengkapi dengan kode SKU/Barcode unik, kategori, nama, "
               "harga beli, harga jual, dan deskripsi.\n"
               "- Validasi Duplikasi: Sistem memvalidasi nama produk agar tidak ada duplikasi data di database.\n"
               "- Dukungan Multi-Item Identik di Keranjang: Kasir dapat menambahkan produk yang sama beberapa "
               "kali ke dalam keranjang belanja dengan nominal diskon yang berbeda per item (sangat berguna untuk "
               "promosi khusus per barang).")
    pdf.multi_cell(0, 5, s2_text)
    
    # ---------------- PAGE 4: SECTIONS 3 & 4 ----------------
    pdf.add_page()
    
    # Section 3
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(30, 64, 175)
    pdf.cell(0, 10, "3. Manajemen Stok & Inventaris", 0, 1, "L")
    pdf.line(10, pdf.get_y(), 80, pdf.get_y())
    pdf.ln(4)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(55, 65, 81)
    s3_text = ("Mengelola rantai pasok dan persediaan produk secara akurat dengan sistem pelacakan stok otomatis:\n"
               "- Histori Stok Masuk/Keluar: Setiap penambahan stok (stock-in) atau pengurangan stok akibat penyesuaian "
               "(stock-out) dicatat secara rinci di database, lengkap dengan alasan (Restock, Rusak, Hilang, Retur).\n"
               "- Sinkronisasi Produk & Stok: Jumlah produk yang terdaftar di halaman Produk selalu disinkronkan secara "
               "real-time dengan halaman Stok.\n"
               "- Low Stock Alerts (Peringatan Stok Rendah): Sistem mendeteksi otomatis jika persediaan barang berada "
               "di bawah batas minimum global (misal < 5 unit) dan menampilkan indikator warna merah cerah.\n"
               "- Blokir Transaksi jika Stok Habis: Menghindari overselling. Jika opsi diaktifkan di Pengaturan, "
               "sistem akan menolak transaksi jika kuantitas keranjang melebihi stok yang tersedia di gudang.")
    pdf.multi_cell(0, 5, s3_text)
    pdf.ln(8)
    
    # Section 4
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(30, 64, 175)
    pdf.cell(0, 10, "4. Sistem Kasir POS (Point of Sale) Premium", 0, 1, "L")
    pdf.line(10, pdf.get_y(), 80, pdf.get_y())
    pdf.ln(4)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(55, 65, 81)
    s4_text = ("Modul utama yang digunakan oleh kasir untuk memproses transaksi dengan cepat dan bebas error:\n"
               "- Pemilihan Multi-Produk: Keranjang belanja modern yang responsif untuk memasukkan banyak produk.\n"
               "- Diskon Dinamis per Item: Kasir dapat memberikan diskon dalam persentase (%) berbeda-beda pada "
               "setiap item produk. Sistem menampilkan preview harga asli, nominal potongan diskon, dan subtotal "
               "secara real-time sebelum transaksi dibayar.\n"
               "- Saluran Penjualan (Online/Offline): Fleksibilitas pencatatan penjualan apakah transaksi dilakukan "
               "secara langsung di toko (Offline) atau melalui marketplace/chat (Online).\n"
               "- Kolom Catatan Transaksi: Kasir dapat menulis catatan khusus untuk setiap transaksi (misal: 'Serial Number "
               "iPhone terlampir' atau 'Bonus tempered glass').\n"
               "- Kebersihan Antarmuka: Kolom customer telah dihilangkan agar proses checkout kasir lebih ringkas "
               "dan efisien.")
    pdf.multi_cell(0, 5, s4_text)

    # ---------------- PAGE 5: SECTIONS 5 & 6 ----------------
    pdf.add_page()
    
    # Section 5
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(30, 64, 175)
    pdf.cell(0, 10, "5. Manajemen Shift & Pencatatan Kas Uang Masuk", 0, 1, "L")
    pdf.line(10, pdf.get_y(), 80, pdf.get_y())
    pdf.ln(4)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(55, 65, 81)
    s5_text = ("Fitur kontrol finansial kasir untuk mencatat keluar-masuk uang kas selama operasional harian:\n"
               "- Alur Buka/Tutup Shift: Kasir diwajibkan melakukan 'Buka Shift' dengan menginput modal awal kas (Float). "
               "Saat shift selesai, kasir melakukan 'Tutup Shift' dengan memasukkan jumlah Uang Kas Aktual di laci.\n"
               "- Format Waktu 24 Jam Presisi: Log open/close shift disimpan menggunakan stempel waktu dengan format "
               "lengkap 24 jam (DD/MM/YYYY HH:mm:ss) untuk audit yang akurat.\n"
               "- Kalkulasi Ekspektasi Kas Otomatis: Sistem menghitung ekspektasi uang kas akhir dengan rumus:\n"
               "  Ekspektasi Uang Kas = Modal Awal (Float) + Total Penjualan Tunai (Cash)\n"
               "- Selisih Kas (Variance): Sistem menghitung selisih antara uang kas aktual yang dihitung kasir dengan "
               "ekspektasi sistem, mencatat nama kasir (Admin/Staff), total transaksi selama shift, serta catatan shift.")
    pdf.multi_cell(0, 5, s5_text)
    pdf.ln(8)
    
    # Section 6
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(30, 64, 175)
    pdf.cell(0, 10, "6. Laporan Penjualan Detail & Informasi Kasir", 0, 1, "L")
    pdf.line(10, pdf.get_y(), 80, pdf.get_y())
    pdf.ln(4)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(55, 65, 81)
    s6_text = ("Menyediakan audit trail yang lengkap mengenai riwayat penjualan:\n"
               "- Tabel Detail Penjualan: Menampilkan No. Invoice, Tanggal, Jam, Produk yang Terjual, Kuantitas, "
               "Diskon, Subtotal, Pajak, Total Pembayaran, dan Metode Pembayaran.\n"
               "- Identitas Penginput Data: Kolom khusus yang mencatat siapa kasir yang menginput transaksi (Admin "
               "atau Staff), mencegah kecurangan dan mempermudah pelacakan.\n"
               "- Catatan Transaksi Terintegrasi: Menampilkan catatan khusus yang diinput oleh kasir di POS pada saat "
               "transaksi terjadi.\n"
               "- Ekspor Laporan Komprehensif: Laporan dapat diekspor kapan saja ke format Excel (.xlsx) dan file PDF "
               "untuk diserahkan kepada pihak manajemen atau akuntan.")
    pdf.multi_cell(0, 5, s6_text)

    # ---------------- PAGE 6: SECTIONS 7 & 8 ----------------
    pdf.add_page()
    
    # Section 7
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(30, 64, 175)
    pdf.cell(0, 10, "7. Pencarian & Cetak Struk Instan", 0, 1, "L")
    pdf.line(10, pdf.get_y(), 80, pdf.get_y())
    pdf.ln(4)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(55, 65, 81)
    s7_text = ("Kemudahan pelayanan purnajual (after-sales) bagi pelanggan:\n"
               "- Pencarian Invoice Cepat: Di menu Cetak Struk, kasir dapat mengetikkan nomor invoice atau sebagian karakter "
               "untuk menemukan transaksi spesifik secara instan.\n"
               "- Cetak Ulang Struk: Struk belanja dapat dicetak ulang kapan saja menggunakan printer thermal mini standard "
               "industri POS.\n"
               "- Unduhan Struk PDF: Struk juga dapat diunduh langsung dalam bentuk file digital untuk dikirimkan melalui "
               "WhatsApp atau Email pelanggan.\n"
               "- Layout Terstandardisasi: Layout struk dirancang dengan format standar POS (lebar kertas 58mm atau 80mm), "
               "menampilkan detail produk, diskon item, subtotal, metode pembayaran, kasir penginput, serta catatan kaki "
               "(footer) garansi.")
    pdf.multi_cell(0, 5, s7_text)
    pdf.ln(8)
    
    # Section 8
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(30, 64, 175)
    pdf.cell(0, 10, "8. Manajemen Konfigurasi (Settings)", 0, 1, "L")
    pdf.line(10, pdf.get_y(), 80, pdf.get_y())
    pdf.ln(4)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(55, 65, 81)
    s8_text = ("Pengaturan operasional sistem secara fleksibel melalui satu pusat konfigurasi:\n"
               "- Profil Toko: Mengatur Nama Toko, Alamat, Telepon, dan Pesan Footer Struk.\n"
               "- Metode Pembayaran Aktif: Mengaktifkan atau menonaktifkan metode pembayaran (Cash, Transfer, QRIS, E-Wallet) "
               "serta mengatur metode pembayaran bawaan (default).\n"
               "- Stok & Alert: Mengatur ambang batas minimal stok global, mengaktifkan peringatan stok menipis, serta "
               "mengunci transaksi penjualan saat stok habis.\n"
               "- Struk & Printer: Mengatur ukuran kertas printer thermal POS (58mm/80mm), opsi cetak struk otomatis setelah "
               "pembayaran sukses, serta opsi menampilkan nama kasir pada struk.\n"
               "- Hak Akses Keamanan (RBAC): Membatasi menu sensitif (seperti performa kasir dan pengaturan sistem) "
               "hanya untuk pemilik (Admin), sementara kasir staff hanya dapat mengakses POS, Shift, dan riwayat cetak struk.")
    pdf.multi_cell(0, 5, s8_text)

    # ---------------- PAGE 7: SECTION 9 & TECH STACK ----------------
    pdf.add_page()
    
    # Section 9
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(30, 64, 175)
    pdf.cell(0, 10, "9. Dockerization & Operasional Mandiri", 0, 1, "L")
    pdf.line(10, pdf.get_y(), 80, pdf.get_y())
    pdf.ln(4)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(55, 65, 81)
    s9_text = ("Sistem Kasirin telah dilengkapi dengan dukungan penuh Docker Kontainerisasi:\n"
               "- Docker Compose Terintegrasi: Menjalankan database PostgreSQL, Node.js backend server, "
               "dan React frontend server secara terpadu hanya dengan satu perintah 'docker-compose up -d'.\n"
               "- Portabilitas Tinggi: Memungkinkan deploy aplikasi di komputer lokal toko (offline server) "
               "maupun server cloud (online VPS) tanpa takut ada bentrokan versi dependency runtime node/database.\n"
               "- Keamanan Data: Database PostgreSQL disimpan dalam volume persisten Docker, sehingga data barang, "
               "stok, transaksi, dan shift kasir tetap aman dan tidak hilang saat kontainer direstart.")
    pdf.multi_cell(0, 5, s9_text)
    pdf.ln(8)
    
    # Tech Stack table-like view
    pdf.set_font("helvetica", "B", 12)
    pdf.set_text_color(30, 64, 175)
    pdf.cell(0, 8, "SPESIFIKASI TEKNIS APLIKASI", 0, 1, "L")
    pdf.ln(2)
    
    tech_data = [
        ("Bahasa & Framework Backend", "Node.js v18+, Express.js 4.18"),
        ("Database Server", "PostgreSQL 12+ (Relational Database)"),
        ("Bahasa & Framework Frontend", "React 18+, Redux Toolkit, React-Router-DOM"),
        ("Styling & Responsive Layout", "Tailwind CSS v3.3.6 (Vanilla CSS Custom)"),
        ("Libraries & Pendukung", "Axios, React-Toastify, jsPDF, XLSX (SheetJS)"),
        ("Kontainerisasi & OS", "Docker & Docker-Compose, macOS/Linux/Windows"),
    ]
    
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(17, 24, 39)
    pdf.set_fill_color(230, 240, 255)
    pdf.cell(80, 8, " Komponen Sistem", 1, 0, "L", True)
    pdf.cell(110, 8, " Spesifikasi / Teknologi", 1, 1, "L", True)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(55, 65, 81)
    for col1, col2 in tech_data:
        pdf.cell(80, 8, " " + col1, 1, 0, "L")
        pdf.cell(110, 8, " " + col2, 1, 1, "L")
        
    pdf.output(output_path)
    print("PDF successfully generated at: " + output_path)

if __name__ == "__main__":
    out = "/Users/mac/Document/kasirin/Kasirin_Dokumentasi_Fitur.pdf"
    if len(sys.argv) > 1:
        out = sys.argv[1]
    create_pdf(out)
