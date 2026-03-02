-- Kasirin Database Schema
-- Database untuk Sistem Manajemen Stok dan Penjualan Terintegrasi

-- Create Database
CREATE DATABASE IF NOT EXISTS kasirin_db;
\c kasirin_db

-- ============================================================================
-- 1. USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role_id INTEGER REFERENCES roles(id),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. PRODUCTS & CATALOG
-- ============================================================================

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_conditions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  description TEXT,
  specifications JSONB,
  condition_id INTEGER NOT NULL REFERENCES product_conditions(id),
  buy_price DECIMAL(10, 2),
  selling_price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  variant_name VARCHAR(100),
  variant_value VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example: iPad variant (Color), (Storage Capacity)
-- INSERT INTO product_variants VALUES (NULL, 1, 'Color', 'Silver', NULL, NOW());
-- INSERT INTO product_variants VALUES (NULL, 1, 'Storage', '64GB', NULL, NOW());

-- ============================================================================
-- 3. INVENTORY & STOCK MANAGEMENT
-- ============================================================================

CREATE TABLE warehouse_locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  warehouse_location_id INTEGER NOT NULL REFERENCES warehouse_locations(id),
  quantity_available INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  quantity_damaged INTEGER DEFAULT 0,
  last_stock_check TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, warehouse_location_id)
);

CREATE TABLE stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  warehouse_location_id INTEGER NOT NULL REFERENCES warehouse_locations(id),
  movement_type VARCHAR(20) NOT NULL, -- STOCK_IN, STOCK_OUT, ADJUSTMENT, DAMAGE
  quantity INTEGER NOT NULL,
  reference_id INTEGER,
  reference_type VARCHAR(50), -- PURCHASE, SALE, BUYBACK, RETURN, ADJUSTMENT
  notes TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_alerts (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  min_quantity INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  last_alert_sent TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. SALES & TRANSACTIONS
-- ============================================================================

CREATE TABLE sales_channels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  sales_channel_id INTEGER NOT NULL REFERENCES sales_channels(id),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(100),
  subtotal DECIMAL(12, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50), -- CASH, TRANSFER, CARD, INSTALLMENT
  payment_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID, PARTIAL, FAILED
  transaction_status VARCHAR(20) DEFAULT 'COMPLETED', -- COMPLETED, CANCELLED, PENDING
  sales_staff_id INTEGER REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER NOT NULL REFERENCES sales(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. BUYBACK & TRADE-IN
-- ============================================================================

CREATE TABLE buyback_requests (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES sales(id),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  product_name VARCHAR(255),
  device_imei VARCHAR(50),
  device_serial VARCHAR(50),
  condition_description TEXT,
  estimated_price DECIMAL(10, 2),
  final_price DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, COMPLETED
  approved_by INTEGER REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trade_ins (
  id SERIAL PRIMARY KEY,
  old_product_id INTEGER REFERENCES products(id),
  new_product_id INTEGER REFERENCES products(id),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  trade_in_value DECIMAL(10, 2),
  discount_applied DECIMAL(10, 2),
  final_price_for_new DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'COMPLETED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. PRICING & PROMOTIONS
-- ============================================================================

CREATE TABLE price_list (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  channel_id INTEGER REFERENCES sales_channels(id),
  price DECIMAL(10, 2) NOT NULL,
  effective_date DATE,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE promotions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20), -- PERCENTAGE, FIXED_AMOUNT
  discount_value DECIMAL(10, 2) NOT NULL,
  applicable_products JSONB,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. WHATSAPP INTEGRATION
-- ============================================================================

CREATE TABLE whatsapp_messages (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES sales(id),
  customer_phone VARCHAR(20) NOT NULL,
  message_type VARCHAR(50), -- CONFIRMATION, UPDATE, REMINDER
  message_content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SENT, FAILED
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. REPORTS & ANALYTICS
-- ============================================================================

CREATE TABLE daily_sales_summary (
  id SERIAL PRIMARY KEY,
  sale_date DATE NOT NULL UNIQUE,
  total_sales_count INTEGER DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  total_discount DECIMAL(12, 2) DEFAULT 0,
  total_items_sold INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_sales_performance (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  period_date DATE,
  quantity_sold INTEGER DEFAULT 0,
  revenue DECIMAL(15, 2) DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. AUDIT & ACTIVITY LOGS
-- ============================================================================

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  module VARCHAR(50),
  record_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_created ON stock_movements(created_at);
CREATE INDEX idx_sales_invoice ON sales(invoice_number);
CREATE INDEX idx_sales_date ON sales(created_at);
CREATE INDEX idx_sales_channel ON sales(sales_channel_id);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_buyback_status ON buyback_requests(status);
CREATE INDEX idx_daily_sales_date ON daily_sales_summary(sale_date);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================================================
-- SAMPLE DATA / SEEDS
-- ============================================================================

-- Roles
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Administrator - Full Access'),
('MANAGER', 'Manager - Can manage inventory and sales'),
('STAFF', 'Sales Staff - Can process sales'),
('VIEWER', 'Viewer - Read only access');

-- Product Conditions
INSERT INTO product_conditions (name, description) VALUES
('Baru', 'Produk baru, belum pernah digunakan'),
('Bekas/Second', 'Produk bekas, masih dalam kondisi baik'),
('Refurbish', 'Produk yang telah diperbaiki dan disertifikasi ulang'),
('Display Unit', 'Unit display dari toko atau distributor');

-- Categories
INSERT INTO categories (name, description) VALUES
('iPad', 'Tablet Apple iPad - berbagai generasi dan ukuran'),
('MacBook', 'Laptop Apple MacBook - Pro, Air, dan versi lain'),
('iPhone', 'Smartphone Apple iPhone - berbagai seri'),
('Aksesori', 'Aksesori Apple - charger, kabel, casing, dll');

-- Sales Channels
INSERT INTO sales_channels (name, description) VALUES
('Toko Fisik', 'Penjualan langsung di toko'),
('WhatsApp', 'Penjualan melalui WhatsApp'),
('Instagram', 'Penjualan melalui Instagram Direct Message'),
('Marketplace', 'Penjualan melalui Tokopedia, Shopee, atau marketplace lainnya'),
('Facebook', 'Penjualan melalui Facebook Marketplace');

-- Warehouse Locations
INSERT INTO warehouse_locations (name, description) VALUES
('Toko Depan', 'Area display produk di toko'),
('Gudang Belakang', 'Ruang penyimpanan utama'),
('Etalase Premium', 'Etalase khusus produk premium');

-- Sample Products
INSERT INTO products (sku, name, category_id, description, condition_id, buy_price, selling_price, image_url) VALUES
('PROD-001', 'iPad Air 5 64GB Silver', 1, 'iPad Air 5th Generation, 64GB, Warna Silver, Kondisi Baru', 1, 4500000, 5500000, 'https://example.com/ipad-air-5.jpg'),
('PROD-002', 'MacBook Pro 13" M1 256GB', 2, 'MacBook Pro 13 inch M1 Chip, 256GB SSD, Space Gray', 1, 12000000, 14500000, 'https://example.com/macbook-pro-m1.jpg'),
('PROD-003', 'iPhone 14 Pro 128GB Bekas', 3, 'iPhone 14 Pro, 128GB, Deep Purple, Kondisi Bekas', 2, 8000000, 10000000, 'https://example.com/iphone-14-pro.jpg'),
('PROD-004', 'Apple USB-C Charger 20W', 4, 'Pengisi Daya Apple USB-C 20W, Original', 1, 300000, 450000, 'https://example.com/charger.jpg');

-- Sample Users
INSERT INTO users (username, email, password, first_name, last_name, role_id, phone, is_active) VALUES
('admin', 'admin@kasirin.local', '$2a$10$YourHashedPasswordHere', 'Admin', 'User', 1, '081234567890', TRUE),
('manager', 'manager@kasirin.local', '$2a$10$YourHashedPasswordHere', 'Manajer', 'Toko', 2, '081234567891', TRUE),
('staff1', 'staff1@kasirin.local', '$2a$10$YourHashedPasswordHere', 'Staf', 'Penjualan', 3, '081234567892', TRUE);

-- ============================================================================
-- EOF
-- ============================================================================
