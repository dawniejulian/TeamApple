# KASIRIN - Development Guide

## 🚀 Panduan Pengembangan

Dokumen ini menjelaskan cara menjalankan dan mengembangkan aplikasi Kasirin secara lokal.

## 📋 Prasyarat

- Node.js v18+ ([Download](https://nodejs.org/))
- PostgreSQL 12+ ([Download](https://www.postgresql.org/))
- Git
- Code Editor (Visual Studio Code recommended)

## ⚙️ Setup Awal

### 1. Persiapan Database

```bash
# Buka PostgreSQL client
psql -U postgres

# Buat database baru
CREATE DATABASE kasirin_db;

# Connect ke database
\c kasirin_db

# Import schema
\i /path/to/kasirin/database/schema.sql

# Exit
\q
```

### 2. Setup Environment Variables

```bash
# Copy .env.example ke .env
cp .env.example .env

# Edit .env dengan konfigurasi lokal Anda
nano .env
```

**Contoh konfigurasi .env:**
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kasirin_db
DB_USER=postgres
DB_PASSWORD=yourpassword
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secure_secret_key
```

### 3. Setup Backend

```bash
# Navigate ke backend
cd backend

# Install dependencies
npm install

# Run server
npm run dev
```

Server akan berjalan di `http://localhost:5000`

### 4. Setup Frontend

Di terminal baru:

```bash
# Navigate ke frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend akan berjalan di `http://localhost:3000`

## 📚 Struktur File Backend

```
backend/
├── config/
│   └── database.js          # Database connection config
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── products.js          # Product management endpoints
│   ├── inventory.js         # Inventory management endpoints
│   ├── sales.js             # Sales transaction endpoints
│   ├── dashboard.js         # Dashboard analytics endpoints
│   └── admin.js             # Admin management endpoints
├── middleware/              # (To implement)
│   └── auth.js              # JWT verification middleware
├── models/                  # (To implement)
├── utils/                   # (To implement)
└── server.js                # Express server entry point
```

## 📚 Struktur File Frontend

```
frontend/src/
├── components/
│   └── Layout/
│       ├── DashboardLayout.js
│       ├── AuthLayout.js
│       ├── Sidebar.js
│       └── Header.js
├── pages/
│   ├── Auth/
│   │   └── LoginPage.js
│   ├── Dashboard/
│   │   └── DashboardPage.js
│   ├── Products/
│   │   ├── ProductsPage.js
│   │   └── ProductDetailPage.js
│   ├── Inventory/
│   │   └── InventoryPage.js
│   ├── Sales/
│   │   ├── SalesPage.js
│   │   └── SalesFormPage.js
│   ├── Reports/
│   │   └── ReportsPage.js
│   └── Settings/
│       └── SettingsPage.js
├── services/
│   └── api.js
├── store/
│   ├── index.js
│   └── slices/
│       ├── authSlice.js
│       ├── productsSlice.js
│       ├── inventorySlice.js
│       └── salesSlice.js
├── App.js
└── index.js
```

## API Endpoints

### Authentication
```
POST   /api/auth/login         - Login user
POST   /api/auth/logout        - Logout user
POST   /api/auth/refresh       - Refresh token
```

### Products
```
GET    /api/products           - Get all products
GET    /api/products/:id       - Get product by ID
POST   /api/products           - Create product (ADMIN/MANAGER)
PUT    /api/products/:id       - Update product (ADMIN/MANAGER)
DELETE /api/products/:id       - Delete product (ADMIN)
```

### Inventory
```
GET    /api/inventory          - Get all inventory
POST   /api/inventory/stock-in - Add stock
POST   /api/inventory/stock-out - Remove stock
GET    /api/inventory/report   - Get inventory report
```

### Sales
```
GET    /api/sales              - Get all sales
GET    /api/sales/:id          - Get sale detail
POST   /api/sales              - Create sale transaction
GET    /api/sales/report/daily - Get daily sales report
```

### Dashboard
```
GET    /api/dashboard/summary        - Get dashboard summary
GET    /api/dashboard/top-products   - Get top selling products
GET    /api/dashboard/sales-by-channel - Get sales by channel
```

### Admin
```
GET    /api/admin/users            - Get all users
POST   /api/admin/users            - Create new user
GET    /api/admin/activity-logs    - Get activity logs
GET    /api/admin/settings         - Get system settings
PUT    /api/admin/settings         - Update settings
```

## 🔧 Debugging

### Backend Debug
```bash
# Run dengan debugging
node --inspect server.js

# Buka chrome://inspect di Chrome untuk debug
```

### Frontend Debug
- Gunakan React Developer Tools browser extension
- Gunakan Redux DevTools untuk state management

## 📦 Building untuk Production

### Backend
```bash
cd backend
npm run build  # Jika ada build script
npm run start
```

### Frontend
```bash
cd frontend
npm run build
# Hasil di folder `build/`
```

## 🧪 Testing

```bash
# Backend testing (To implement)
npm test

# Frontend testing (To implement)
npm test
```

## 📝 Database Migrations

Untuk menjalankan migrasi database:

```bash
npm run migrate
```

## 🌱 Seeding Data

Untuk menambahkan sample data:

```bash
npm run seed
```

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Pastikan PostgreSQL running
- Check DB credentials di .env
- Verify database sudah dibuat

### Error: "Port already in use"
- Ubah PORT di .env file
- Atau kill process yang menggunakan port:
  ```bash
  # macOS/Linux
  lsof -ti:5000 | xargs kill -9
  
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

### Error: "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redux Documentation](https://redux.js.org/)

## 💡 Best Practices

1. **Code Style**: Gunakan consistent naming conventions
2. **Comments**: Tambahkan comments untuk logika kompleks
3. **Error Handling**: Always handle errors properly
4. **Security**: Validasi semua input dari user
5. **Performance**: Optimize queries dan components

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add some feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

---

**Last Updated**: March 2026
