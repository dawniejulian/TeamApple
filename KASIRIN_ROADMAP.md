# 🚀 KASIRIN - Roadmap Implementasi Lengkap (2026)

> Sistem POS Terintegrasi untuk Toko Apple Terpercaya

**Status**: Planning & Architecture Phase  
**Last Updated**: 3/10/2026  
**Target**: Full Production Ready Q3 2026

---

## 📋 Ringkasan Fitur

| Kategori | Status | Priority | Fase | Estimasi |
|----------|--------|----------|------|----------|
| **POS Dasar** | Planning | 🔴 Critical | Phase 1 | 2-3 minggu |
| **Manajemen Stok** | Planning | 🔴 Critical | Phase 1-2 | 3-4 minggu |
| **Laporan & Analitik** | Planning | 🟡 High | Phase 2-3 | 3-4 minggu |
| **Multi-outlet** | Planning | 🟡 High | Phase 4 | 2-3 minggu |
| **Akuntansi** | Planning | 🟡 High | Phase 3-4 | 3 minggu |
| **Integrasi Eksternal** | Planning | 🟢 Medium | Phase 4-5 | 4-5 minggu |

---

## 🎯 PHASE 1: POS DASAR & OPERASIONAL TOKO (Minggu 1-4)

### 1.1 Transaksi Penjualan ✅ (Partial - Lanjutkan)

**Backend:**
- [x] Database schema untuk sales & sale_items
- [ ] API POST `/sales` - Buat transaksi baru
- [ ] API GET `/sales/{id}` - Detail transaksi
- [ ] API POST `/sales/{id}/pay` - Konfirmasi pembayaran
- [ ] Validasi stok otomatis sebelum transaksi
- [ ] Perhitungan diskon, pajak, kembalian

**Frontend:**
- [x] Sales page sudah ada
- [ ] Barcode scanner integration (library: `jsbarcode`, `quagga`)
- [ ] Keranjang belanja real-time
- [ ] Kalkulasi otomatis
- [ ] Pembayaran multiple method (tunai, QRIS, kartu)
- [ ] Konfirmasi pembayaran dengan modal

**Database:**
```sql
-- Sudah ada: sales, sale_items
-- Perlu ditambah:
- payment_methods (tunai, QRIS, debit, kredit, transfer)
- sale_discounts (diskon per item/transaksi)
- transactions_log (audit trail)
```

---

### 1.2 Manajemen Produk ✅ (Partial - Enhance)

**Backend:**
- [x] CRUD produk sudah ada
- [ ] Upload foto produk (Multer + Storage)
- [ ] Validation SKU/Barcode unique
- [ ] API GET `/products/barcode/{barcode}` - Search by barcode
- [ ] API GET `/products/category/{id}` - Filter kategori
- [ ] Soft delete untuk archived products

**Frontend:**
- [x] Products page sudah ada
- [ ] Edit produk dengan foto upload
- [ ] Bulk import produk (Excel)
- [ ] Barcode generator & printer

**Database:**
```sql
-- Tambahan fields:
ALTER TABLE products ADD COLUMN (
  barcode VARCHAR(50) UNIQUE,
  purchase_price DECIMAL(12,2),
  unit VARCHAR(20),
  photo_url TEXT,
  is_bundle BOOLEAN DEFAULT FALSE,
  bundle_items JSON,
  status ENUM('active', 'discontinued') DEFAULT 'active'
);

-- Tabel baru:
CREATE TABLE product_bundles (
  id SERIAL PRIMARY KEY,
  parent_product_id INT REFERENCES products(id),
  child_product_id INT REFERENCES products(id),
  quantity INT,
  discount_percent DECIMAL(5,2)
);
```

---

### 1.3 Kasir & Shift Management ✨ (NEW)

**Backend:**
- [ ] Shift system - create/close shift
- [ ] Modal awal shift
- [ ] Rekonsiliasi kasir per shift
- [ ] API POST `/shifts` - Buka shift
- [ ] API PUT `/shifts/{id}/close` - Tutup shift
- [ ] Report per shift

**Frontend:**
- [ ] Modal "Buka Kasir" - input modal awal
- [ ] Display kasir aktif & shift info
- [ ] Button "Tutup Kasir" dengan form finalisasi

**Database:**
```sql
CREATE TABLE cashier_shifts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  shift_date DATE,
  shift_start_time TIME,
  shift_end_time TIME,
  opening_balance DECIMAL(12,2),
  closing_balance DECIMAL(12,2),
  expected_amount DECIMAL(12,2), -- total dari transaksi
  difference DECIMAL(12,2), -- selisih kas
  notes TEXT,
  status ENUM('open', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cashier_transactions (
  id SERIAL PRIMARY KEY,
  shift_id INT REFERENCES cashier_shifts(id),
  transaction_type ENUM('sale', 'expense', 'return', 'adjustment'),
  amount DECIMAL(12,2),
  description TEXT,
  reference_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 1.4 Manajemen Stok Dasar ⭐ (NEW)

**Backend:**
- [ ] API GET `/inventory` - Daftar stok
- [ ] API POST `/inventory/stock-in` - Stok masuk
- [ ] API POST `/inventory/stock-out` - Stok keluar (retur/rusak)
- [ ] Real-time stock deduction saat penjualan
- [ ] Alert minimum stok
- [ ] API GET `/inventory/low-stock` - Produk stok habis

**Frontend:**
- [ ] Inventory page dengan tabel stok
- [ ] Form stock-in & stock-out
- [ ] Filter: low stock, out of stock
- [ ] Alert badge di sidebar

**Database:**
```sql
CREATE TABLE stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  warehouse_id INT REFERENCES warehouses(id), -- untuk multi-lokasi
  movement_type ENUM('in', 'out', 'adjustment', 'opname'),
  quantity INT,
  notes TEXT,
  reference_type VARCHAR(50), -- 'purchase_order', 'sale', 'return'
  reference_id INT,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_levels (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  warehouse_id INT REFERENCES warehouses(id),
  quantity_on_hand INT DEFAULT 0,
  quantity_reserved INT DEFAULT 0, -- untuk SO yang belum diambil
  minimum_quantity INT DEFAULT 10,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE warehouses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  location VARCHAR(200),
  is_default BOOLEAN DEFAULT FALSE
);
```

---

## 🏪 PHASE 2: MANAJEMEN SUPPLIER & PEMBELIAN (Minggu 5-8)

### 2.1 Supplier & Purchase Order

**Backend:**
- [ ] CRUD supplier
- [ ] Purchase Order (PO) system
- [ ] Penerimaan barang (GRR)
- [ ] Hutang ke supplier tracking
- [ ] Pembayaran hutang

**Frontend:**
- [ ] Dashboard supplier
- [ ] Form PO
- [ ] GRR receipt form
- [ ] Hutang management

**Database:**
```sql
CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  status ENUM('active', 'inactive')
);

CREATE TABLE purchase_orders (
  id SERIAL PRIMARY KEY,
  supplier_id INT REFERENCES suppliers(id),
  po_number VARCHAR(50) UNIQUE,
  order_date DATE,
  expected_delivery_date DATE,
  total_amount DECIMAL(12,2),
  status ENUM('draft', 'confirmed', 'received', 'cancelled'),
  created_by INT REFERENCES users(id)
);

CREATE TABLE purchase_order_items (
  id SERIAL PRIMARY KEY,
  po_id INT REFERENCES purchase_orders(id),
  product_id INT REFERENCES products(id),
  quantity INT,
  unit_price DECIMAL(12,2),
  subtotal DECIMAL(12,2),
  received_quantity INT DEFAULT 0
);

CREATE TABLE supplier_invoices (
  id SERIAL PRIMARY KEY,
  supplier_id INT REFERENCES suppliers(id),
  invoice_number VARCHAR(50),
  invoice_date DATE,
  due_date DATE,
  total_amount DECIMAL(12,2),
  paid_amount DECIMAL(12,2) DEFAULT 0,
  status ENUM('unpaid', 'partial', 'paid'),
  po_id INT REFERENCES purchase_orders(id)
);
```

---

### 2.2 Manajemen Pelanggan

**Backend:**
- [ ] CRUD pelanggan
- [ ] Piutang pelanggan tracking
- [ ] Retur dari pelanggan
- [ ] Loyalitas & poin sistem

**Frontend:**
- [ ] Database pelanggan
- [ ] Piutang management
- [ ] Form retur

---

## 📊 PHASE 3: LAPORAN & ANALITIK (Minggu 9-12)

### 3.1 Laporan Penjualan

**Backend:**
- [ ] API GET `/reports/sales` - Daily/monthly/yearly
- [ ] API GET `/reports/sales-by-category`
- [ ] API GET `/reports/top-products`
- [ ] API GET `/reports/sales-by-cashier`

**Frontend:**
- [ ] Dashboard dengan grafik
- [ ] Filter by date range, kategori, cashier
- [ ] Export ke PDF/Excel

**Database:**
```sql
-- Materialized views untuk performa
CREATE MATERIALIZED VIEW sales_summary_daily AS
SELECT 
  DATE(created_at) as sale_date,
  COUNT(*) as total_transactions,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_transaction,
  SUM(quantity) as total_items
FROM sales
GROUP BY DATE(created_at);
```

### 3.2 Laporan Stok & Valuasi

- [ ] Stock level report
- [ ] Stock valuation (FIFO/LIFO)
- [ ] Stock aging
- [ ] Produk lambat & terlaris

### 3.3 Laporan Kasir & Rekonsiliasi

- [ ] Daily kasir report
- [ ] Discrepancy analysis
- [ ] Shift performance

### 3.4 Laporan Laba Rugi

- [ ] Cost of goods sold (COGS)
- [ ] Gross profit per kategori
- [ ] Operating expense tracking

---

## 🏢 PHASE 4: ADVANCED FEATURES (Minggu 13-16)

### 4.1 Diskon & Promosi

**Backend:**
- [ ] Diskon sistem (item, transaksi, quantity-based)
- [ ] Member discount tiers
- [ ] Voucher & kupon management
- [ ] Flash sale scheduling

**Database:**
```sql
CREATE TABLE discount_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  discount_type ENUM('percent', 'fixed'),
  discount_value DECIMAL(10,2),
  applicable_to ENUM('item', 'category', 'transaction'),
  minimum_purchase DECIMAL(12,2),
  applicable_products JSON,
  start_date DATETIME,
  end_date DATETIME,
  status ENUM('draft', 'active', 'inactive')
);

CREATE TABLE vouchers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  discount_amount DECIMAL(10,2),
  usage_limit INT,
  used_count INT DEFAULT 0,
  valid_from DATE,
  valid_until DATE
);
```

### 4.2 Multi-outlet / Cabang

- [ ] Manajemen multiple outlets
- [ ] Per-outlet pricing
- [ ] Inter-branch stock transfer
- [ ] Consolidated reporting

**Database:**
```sql
ALTER TABLE products ADD COLUMN outlet_id INT REFERENCES outlets(id);
ALTER TABLE stock_levels ADD COLUMN outlet_id INT REFERENCES outlets(id);

CREATE TABLE outlets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  address TEXT,
  phone VARCHAR(20),
  manager_id INT REFERENCES users(id),
  is_main_office BOOLEAN DEFAULT FALSE
);
```

### 4.3 Akuntansi & Keuangan

- [ ] Automatic journal entries dari transaksi
- [ ] Cash flow reporting
- [ ] Bank reconciliation
- [ ] Integration dengan Accurate/Jurnal.id

### 4.4 SDM & Operasional

- [ ] Employee management
- [ ] Role-based access control (RBAC)
- [ ] Audit trail logging
- [ ] Shift scheduling
- [ ] Commission tracking

**Database:**
```sql
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  role ENUM('owner', 'manager', 'supervisor', 'cashier', 'warehouse'),
  assigned_at TIMESTAMP,
  expired_at TIMESTAMP
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  action VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id INT,
  old_values JSON,
  new_values JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE commission_rules (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  commission_type ENUM('percent', 'fixed'),
  commission_value DECIMAL(10,2),
  applicable_categories JSON,
  start_date DATE,
  end_date DATE
);
```

---

## 🔌 PHASE 5: INTEGRASI EKSTERNAL (Minggu 17-20)

### 5.1 Payment Gateway Integration

- [ ] Midtrans (credit card, bank transfer)
- [ ] Xendit (multi-channel payments)
- [ ] QRIS integration
- [ ] E-wallet support

### 5.2 Marketplace Sync

- [ ] Tokopedia API integration
- [ ] Shopee API integration
- [ ] Stock sync
- [ ] Order sync

### 5.3 Notifikasi & Komunikasi

- [ ] WhatsApp API (struk, notifikasi)
- [ ] Email notifications
- [ ] SMS gateway (optional)

### 5.4 Tax & Legal

- [ ] E-faktur integration (DJP)
- [ ] PPN automation
- [ ] Tax reporting

---

## 🏗️ BACKEND ARCHITECTURE

### Structure yang Diperlukan:

```
backend/
├── config/
│   ├── database.js
│   └── payment.js
├── controllers/
│   ├── salesController.js      ✅ (create basic)
│   ├── productController.js    ✅ (partial)
│   ├── inventoryController.js  (NEW)
│   ├── supplierController.js   (NEW)
│   ├── customerController.js   (NEW)
│   ├── reportController.js     (NEW)
│   ├── userController.js       (NEW)
│   └── ...
├── models/
│   ├── Sale.js
│   ├── Product.js
│   ├── Inventory.js
│   ├── Supplier.js
│   ├── Customer.js
│   ├── User.js
│   └── ...
├── middleware/
│   ├── auth.js                 ✅ (basic)
│   ├── errorHandler.js         (NEW)
│   ├── validation.js           (NEW)
│   ├── auditLog.js             (NEW)
│   └── rateLimit.js            (NEW)
├── routes/
│   ├── sales.js                ✅ (enhance)
│   ├── products.js             ✅ (enhance)
│   ├── inventory.js            (NEW)
│   ├── suppliers.js            (NEW)
│   ├── customers.js            (NEW)
│   ├── reports.js              (NEW)
│   └── users.js                (NEW)
├── services/
│   ├── transactionService.js   (NEW)
│   ├── inventoryService.js     (NEW)
│   ├── reportService.js        (NEW)
│   └── ...
├── utils/
│   ├── validators.js           ✅ (basic)
│   ├── formatters.js           (NEW)
│   └── helpers.js
└── scripts/
    ├── seed-data.js
    └── migrate-db.js
```

---

## 💾 DATABASE SCHEMA - COMPLETE

```sql
-- 1. USERS & ROLES
[Tables: users, user_roles, audit_logs]

-- 2. PRODUCTS & CATEGORIES
[Tables: products, categories, product_conditions, product_bundles]

-- 3. SALES & TRANSACTIONS
[Tables: sales, sale_items, sale_discounts, payment_methods]

-- 4. INVENTORY & WAREHOUSES
[Tables: stock_levels, stock_movements, warehouses]

-- 5. SUPPLIERS & PURCHASES
[Tables: suppliers, purchase_orders, purchase_order_items, supplier_invoices]

-- 6. CUSTOMERS & LOYALTY
[Tables: customers, customer_transactions, loyalty_points, customer_returns]

-- 7. CASHIER & SHIFTS
[Tables: cashier_shifts, cashier_transactions]

-- 8. DISCOUNTS & PROMOTIONS
[Tables: discount_rules, vouchers, promotion_items]

-- 9. OUTLETS
[Tables: outlets, outlet_users, outlet_pricing]

-- 10. COMMISSIONS
[Tables: commission_rules, commission_calculations]
```

---

## 📱 FRONTEND PAGES NEEDED

### Existing ✅
- [ ] LoginPage
- [ ] DashboardPage (enhance)
- [ ] ProductsPage (enhance)
- [ ] InventoryPage (basic)
- [ ] SalesPage (enhance)
- [ ] ReceiptPage ✅
- [ ] ReportsPage (basic)
- [ ] SettingsPage (enhance)

### New Required
- [ ] SuppliersPage
- [ ] PurchaseOrdersPage
- [ ] CustomersPage
- [ ] CashierShiftPage
- [ ] UserManagementPage
- [ ] DiscountsPage
- [ ] OutletsPage
- [ ] AnalyticsPage
- [ ] LoyaltyPage
- [ ] AuditLogPage

---

## 🔐 Security & Performance Checklist

- [ ] JWT token expiration & refresh
- [ ] Rate limiting
- [ ] Input validation & sanitization
- [ ] SQL injection prevention (parameterized queries)
- [ ] CORS configuration
- [ ] Password hashing (bcrypt)
- [ ] Audit logging
- [ ] Data encryption (sensitive fields)
- [ ] HTTPS/SSL in production
- [ ] Database indexing (frequently queried fields)
- [ ] Query optimization
- [ ] Caching strategy (Redis)

---

## 📈 Timeline Estimate

| Phase | Durasi | Start | End |
|-------|--------|-------|-----|
| Phase 1: POS Dasar | 4 minggu | Week 1 | Week 4 |
| Phase 2: Supplier | 4 minggu | Week 5 | Week 8 |
| Phase 3: Laporan | 4 minggu | Week 9 | Week 12 |
| Phase 4: Advanced | 4 minggu | Week 13 | Week 16 |
| Phase 5: Integrasi | 4 minggu | Week 17 | Week 20 |
| Testing & Refinement | 2 minggu | Week 21 | Week 22 |
| **Total** | **~5-6 bulan** | - | Q3 2026 |

---

## 🚀 Next Steps

1. **Database Migration** - Create full schema
2. **Backend Setup** - Complete folder structure & boilerplate
3. **API Documentation** - OpenAPI/Swagger specs
4. **Frontend Scaffolding** - Generate page components
5. **Phase 1 Sprint** - Focus on POS core functionality

---

**Questions/Adjustments**? Comment di file ini! 📝
