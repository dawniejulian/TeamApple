# Kasirin - Sistem Manajemen Stok dan Penjualan Terintegrasi

## 📱 Tentang Aplikasi

**Kasirin** adalah aplikasi web internal toko untuk mengelola stok, penjualan, dan katalog produk Apple (iPad, MacBook, iPhone, dan aksesori). Sistem ini dirancang khusus untuk memenuhi kebutuhan toko elektronik dalam mengatasi tantangan:

- ✅ Sinkronisasi stok real-time antara online dan offline
- ✅ Pencatatan penjualan terintegrasi (toko fisik, Instagram, WhatsApp, marketplace)
- ✅ Manajemen harga terpusat
- ✅ Laporan penjualan otomatis
- ✅ Katalog produk lengkap dengan kondisi barang
- ✅ Pencatatan buyback dan trade-in

## 🏗️ Struktur Teknologi

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Bahasa**: JavaScript

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **State Management**: Redux

### Database
- **DBMS**: PostgreSQL
- **ORM**: Sequelize (opsional)

### Tools
- **IDE**: Visual Studio Code
- **Design**: Figma
- **Version Control**: Git

## 📋 Persyaratan Sistem

- Node.js v18+
- PostgreSQL 12+
- npm atau yarn
- Git

## ⚙️ Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd kasirin
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan konfigurasi database Anda
npm run migrate
npm run seed
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm start
```

## 📁 Struktur Folder

```
kasirin/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── schema.sql
├── docs/
└── README.md
```

## 🔑 Fitur Utama

### 1. Manajemen Produk
- Katalog produk (iPad, MacBook, iPhone, aksesori)
- Informasi detail: model, kapasitas, warna, kondisi (baru/bekas/refurbish)
- Manajemen harga
- Upload gambar produk

### 2. Manajemen Stok
- Tampilkan ketersediaan produk real-time
- Pencatatan stok masuk/keluar
- Notifikasi stok minimum
- Tracking kondisi barang

### 3. Penjualan
- Pencatatan transaksi offline
- Integrasi penjualan online
- Fitur buyback dan trade-in
- Manajemen diskon dan promosi

### 4. Laporan & Analytics
- Laporan penjualan harian/bulanan
- Produk terlaris
- Analisis omset
- Export laporan ke PDF

### 5. Manajemen Admin
- Kelola pengguna (staff, manager)
- Pengaturan harga
- Backup data

## 🔐 Keamanan

- Autentikasi JWT
- Enkripsi password dengan bcryptjs
- Validasi input dengan Joi
- CORS configuration
- SQL Injection prevention

## 📝 API Documentation

### Endpoints Utama

#### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
```

#### Products
```
GET    /api/products
GET    /api/products/:id
POST   /api/products (admin)
PUT    /api/products/:id (admin)
DELETE /api/products/:id (admin)
```

#### Inventory
```
GET    /api/inventory
POST   /api/inventory/stock-in (admin)
POST   /api/inventory/stock-out
GET    /api/inventory/report
```

#### Sales
```
GET    /api/sales
POST   /api/sales (create transaction)
GET    /api/sales/:id
GET    /api/sales/report/daily
GET    /api/sales/report/monthly
```

## 🧪 Testing

```bash
npm test
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Docker (Optional)
```bash
docker-compose up -d
```

## 📞 Integrasi WhatsApp

Sistem dapat terintegrasi dengan WhatsApp Business API untuk:
- Notifikasi transaksi
- Konfirmasi pemesanan
- Update status pesanan

Konfigurasi di `.env` dengan API key WhatsApp Anda.

## 📊 Database Schema

Lihat [database/schema.sql](database/schema.sql) untuk dokumentasi lengkap struktur database.

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan buat branch baru dan submit pull request.

## 📄 Lisensi

MIT License - Lihat LICENSE file untuk detail.

## 👥 Tim Pengembang

Dikembangkan sebagai bagian dari penelitian Tugas Akhir tentang "Sistem Manajemen Stok dan Penjualan Terintegrasi Multi-Channel untuk Toko Perangkat Apple".

## 📚 Referensi Penelitian

1. Sinaga, A., Jamaluddin, & Siringoringo, R. (2022)
2. Putra & Suprianto (2024)
3. Wijaya et al. (2024)
4. Edison et al. (2024)
5. Dan referensi lainnya di BAB II dokumentasi

---

**Last Updated**: March 2026
