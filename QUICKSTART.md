# KASIRIN - Quick Start Guide

## 🚀 Panduan Cepat Memulai

Ikuti langkah-langkah berikut untuk menjalankan aplikasi Kasirin di komputer lokal Anda.

## ⚡ Quick Start (5 menit)

### Option 1: Menggunakan Docker (Recommended)

```bash
# Clone repository
git clone <repo-url>
cd kasirin

# Jalankan dengan Docker Compose
docker-compose up -d

# Tunggu ~30 detik untuk database siap
# Aplikasi akan berjalan di:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:5000
# - Database: localhost:5432
```

### Option 2: Manual Setup

#### 1. Setup Database

```bash
# Install PostgreSQL terlebih dahulu

# Create database
createdb kasirin_db

# Import schema
psql kasirin_db < database/schema.sql
```

#### 2. Setup & Jalankan Backend

```bash
cd backend

# Copy .env
cp .env.example .env

# Install dependencies
npm install

# Start server
npm run dev
```

#### 3. Setup & Jalankan Frontend (Terminal baru)

```bash
cd frontend

# Install dependencies
npm install

# Start application
npm start
```

Browser akan otomatis membuka http://localhost:3000

## 🔐 Default Login

```
Username: admin
Password: any
```

## 📊 Akses Aplikasi

| Komponen | URL | Port |
|----------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:5000 | 5000 |
| Database | localhost | 5432 |

## 📁 File Penting

- **Backend**: `backend/server.js` - Entry point
- **Frontend**: `frontend/src/App.js` - Main component
- **Database**: `database/schema.sql` - Database schema
- **Docs**: `README.md`, `DEVELOPMENT.md`, `API_DOCUMENTATION.md`

## 🔧 Fitur Utama

✅ **Dashboard** - Ringkasan penjualan dan inventory
✅ **Manajemen Produk** - CRUD produk dengan kategori dan kondisi
✅ **Manajemen Stok** - Track inventory real-time
✅ **Pencatatan Penjualan** - Transaksi offline & online
✅ **Laporan** - Analytics penjualan
✅ **Multi-Channel** - Integrasi berbagai channel penjualan

## 🛠️ Troubleshooting

### Error: Port sudah digunakan
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Error: Database connection failed
- Pastikan PostgreSQL running
- Check DB credentials di `.env`
- Verify database schema sudah diimport

### Error: Package tidak ketemu
```bash
cd backend (atau frontend)
rm -rf node_modules package-lock.json
npm install
```

## 📖 Dokumentasi Lanjutan

- [README.md](./README.md) - Overview lengkap
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference

## 💡 Tips Pengembangan

1. **Gunakan VS Code** untuk development
2. **Install React DevTools** browser extension
3. **Install Redux DevTools** untuk debugging state
4. **Gunakan Thunder Client** atau **Postman** untuk test API
5. **Terminal baru** untuk setiap service (backend, frontend)

## 📞 Support

Jika ada masalah:
1. Check file `DEVELOPMENT.md` untuk troubleshooting
2. Baca `API_DOCUMENTATION.md` untuk API reference
3. Lihat console browser (F12) untuk error messages

---

**Selamat Mengembangkan! 🎉**
