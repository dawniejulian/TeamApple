-- ============================================================================
-- KASIRIN - COMPLETE DATABASE SCHEMA MIGRATION
-- Target: PostgreSQL 15+
-- ============================================================================

-- ============================================================================
-- 1. CORE SETUP
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role_id INTEGER REFERENCES roles(id),
  outlet_id INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- 3. ORGANIZATION & OUTLETS
-- ============================================================================

CREATE TABLE IF NOT EXISTS outlets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(100),
  manager_id INTEGER REFERENCES users(id),
  is_main_office BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_outlets_is_active ON outlets(is_active);

-- Update users table outlet_id constraint
ALTER TABLE users ADD CONSTRAINT fk_users_outlet_id 
  FOREIGN KEY (outlet_id) REFERENCES outlets(id);

CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  capacity INT,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. PRODUCTS & CATALOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_outlet_id ON categories(outlet_id);

CREATE TABLE IF NOT EXISTS product_conditions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO product_conditions (name, description) VALUES
  ('New', 'Produk baru'),
  ('Open Box', 'Kemasan dibuka tapi tidak digunakan'),
  ('Used', 'Produk bekas pakai'),
  ('Refurbished', 'Produk diperbaiki/diservis')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(50) NOT NULL,
  barcode VARCHAR(50),
  category_id INTEGER REFERENCES categories(id),
  condition_id INTEGER REFERENCES product_conditions(id) DEFAULT 1,
  purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(12,2) NOT NULL,
  wholesale_price DECIMAL(12,2),
  unit VARCHAR(20) DEFAULT 'pcs',
  weight DECIMAL(8,2),
  photo_url TEXT,
  photo_urls JSONB DEFAULT '[]'::jsonb,
  is_bundle BOOLEAN DEFAULT FALSE,
  bundle_items JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  supplier_id INTEGER,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_products_outlet_sku ON products(outlet_id, sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);

CREATE TABLE IF NOT EXISTS product_bundles (
  id SERIAL PRIMARY KEY,
  parent_product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  child_product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. INVENTORY & STOCK
-- ============================================================================

CREATE TABLE IF NOT EXISTS stock_levels (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id INTEGER REFERENCES warehouses(id),
  quantity_on_hand INT DEFAULT 0,
  quantity_reserved INT DEFAULT 0,
  minimum_quantity INT DEFAULT 10,
  last_recount_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, warehouse_id)
);

CREATE INDEX idx_stock_levels_product_id ON stock_levels(product_id);
CREATE INDEX idx_stock_levels_warehouse_id ON stock_levels(warehouse_id);

CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id INTEGER REFERENCES warehouses(id),
  movement_type VARCHAR(50) NOT NULL, -- 'in', 'out', 'adjustment', 'opname'
  quantity INT NOT NULL,
  notes TEXT,
  reference_type VARCHAR(50), -- 'purchase_order', 'sale', 'return', 'transfer'
  reference_id INTEGER,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX idx_stock_movements_reference ON stock_movements(reference_type, reference_id);

-- ============================================================================
-- 6. SUPPLIERS & PURCHASE
-- ============================================================================

CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  tax_id VARCHAR(50),
  bank_name VARCHAR(100),
  bank_account VARCHAR(50),
  payment_terms INT DEFAULT 30, -- hari kredit
  credit_limit DECIMAL(15,2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suppliers_outlet_id ON suppliers(outlet_id);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  supplier_id INTEGER REFERENCES suppliers(id),
  po_number VARCHAR(50) NOT NULL,
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  total_amount DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'draft',
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(outlet_id, po_number)
);

CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id SERIAL PRIMARY KEY,
  po_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2),
  received_quantity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_po_items_po_id ON purchase_order_items(po_id);

CREATE TABLE IF NOT EXISTS supplier_invoices (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  supplier_id INTEGER REFERENCES suppliers(id),
  po_id INTEGER REFERENCES purchase_orders(id),
  invoice_number VARCHAR(50) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE,
  total_amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'unpaid',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(outlet_id, invoice_number)
);

CREATE INDEX idx_supplier_invoices_status ON supplier_invoices(status);

CREATE TABLE IF NOT EXISTS supplier_payments (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES supplier_invoices(id),
  payment_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. CUSTOMERS & SALES
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  membership_id VARCHAR(50),
  customer_type VARCHAR(30) DEFAULT 'retail', -- 'retail', 'wholesale', 'distributor'
  credit_limit DECIMAL(15,2),
  outstanding_balance DECIMAL(12,2) DEFAULT 0,
  total_purchases DECIMAL(15,2) DEFAULT 0,
  total_returns DECIMAL(12,2) DEFAULT 0,
  last_purchase_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_outlet_id ON customers(outlet_id);
CREATE INDEX idx_customers_phone ON customers(phone);

CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  name VARCHAR(50) NOT NULL,
  code VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT,
  UNIQUE(outlet_id, code)
);

-- Seed default payment methods
INSERT INTO payment_methods (outlet_id, name, code, display_order) VALUES
  (NULL, 'Tunai', 'CASH', 1),
  (NULL, 'Kartu Debit', 'DEBIT', 2),
  (NULL, 'Kartu Kredit', 'CREDIT', 3),
  (NULL, 'QRIS', 'QRIS', 4),
  (NULL, 'Transfer Bank', 'TRANSFER', 5),
  (NULL, 'E-Wallet', 'EWALLET', 6)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  sales_number VARCHAR(50) NOT NULL,
  invoice_number VARCHAR(50),
  customer_id INTEGER REFERENCES customers(id),
  cashier_id INTEGER REFERENCES users(id),
  shift_id INTEGER,
  subtotal DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  tax_percent DECIMAL(5,2) DEFAULT 10,
  total_amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2),
  change_amount DECIMAL(12,2) DEFAULT 0,
  payment_method_id INTEGER REFERENCES payment_methods(id),
  payment_status VARCHAR(20) DEFAULT 'paid',
  notes TEXT,
  is_return BOOLEAN DEFAULT FALSE,
  return_reference_id INTEGER REFERENCES sales(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(outlet_id, sales_number)
);

CREATE INDEX idx_sales_outlet_id ON sales(outlet_id);
CREATE INDEX idx_sales_cashier_id ON sales(cashier_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_payment_status ON sales(payment_status);

CREATE TABLE IF NOT EXISTS sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  subtotal DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);

CREATE TABLE IF NOT EXISTS sale_discounts (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
  discount_rule_id INTEGER,
  discount_type VARCHAR(20), -- 'percent', 'fixed'
  discount_value DECIMAL(10,2),
  discount_amount DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. DISCOUNTS & PROMOTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS discount_rules (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL, -- 'percent', 'fixed'
  discount_value DECIMAL(10,2) NOT NULL,
  applicable_to VARCHAR(50), -- 'item', 'category', 'transaction'
  applicable_items JSONB,
  minimum_quantity INT DEFAULT 1,
  minimum_amount DECIMAL(12,2),
  maximum_discount DECIMAL(12,2),
  applicable_days VARCHAR(50), -- JSON array of days or null for all
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  code VARCHAR(50) NOT NULL,
  discount_amount DECIMAL(10,2),
  discount_percent DECIMAL(5,2),
  discount_type VARCHAR(20), -- 'amount', 'percent'
  usage_limit INT DEFAULT 1,
  used_count INT DEFAULT 0,
  minimum_purchase DECIMAL(12,2),
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(outlet_id, code)
);

CREATE TABLE IF NOT EXISTS voucher_usage (
  id SERIAL PRIMARY KEY,
  voucher_id INTEGER REFERENCES vouchers(id),
  sale_id INTEGER REFERENCES sales(id),
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. CASHIER SHIFTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS cashier_shifts (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  user_id INTEGER REFERENCES users(id),
  shift_date DATE,
  shift_start_time TIME,
  shift_end_time TIME,
  opening_balance DECIMAL(12,2),
  closing_balance DECIMAL(12,2),
  expected_amount DECIMAL(12,2),
  difference DECIMAL(12,2),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cashier_shifts_user_id ON cashier_shifts(user_id);
CREATE INDEX idx_cashier_shifts_status ON cashier_shifts(status);
CREATE INDEX idx_cashier_shifts_shift_date ON cashier_shifts(shift_date);

-- ============================================================================
-- 10. CUSTOMER LOYALTY & RETURNS
-- ============================================================================

CREATE TABLE IF NOT EXISTS loyalty_programs (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  name VARCHAR(100),
  point_value DECIMAL(12,2), -- 1 poin = ? rupiah
  expires_after_days INT DEFAULT 365,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_loyalty_points (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  program_id INTEGER REFERENCES loyalty_programs(id),
  points_balance INT DEFAULT 0,
  total_points_earned INT DEFAULT 0,
  last_transaction_date DATE,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_returns (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  original_sale_id INTEGER REFERENCES sales(id),
  customer_id INTEGER REFERENCES customers(id),
  return_date DATE,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pendingapproval',
  total_return_amount DECIMAL(12,2),
  refund_amount DECIMAL(12,2),
  created_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS return_items (
  id SERIAL PRIMARY KEY,
  return_id INTEGER REFERENCES customer_returns(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INT,
  original_price DECIMAL(12,2),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 11. COMMISSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS commission_rules (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  user_id INTEGER REFERENCES users(id),
  commission_type VARCHAR(20), -- 'percent', 'fixed'
  commission_value DECIMAL(10,2),
  applicable_categories JSONB,
  applicable_products JSONB,
  minimum_sales DECIMAL(12,2),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS commissions (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  user_id INTEGER REFERENCES users(id),
  period_start DATE,
  period_end DATE,
  sales_amount DECIMAL(12,2),
  commission_amount DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'draft',
  paid_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 12. REPORTS & ANALYTICS (Optional pre-computed tables)
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_sales_summary (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  sale_date DATE,
  total_transactions INT,
  total_revenue DECIMAL(12,2),
  total_discount DECIMAL(12,2),
  total_tax DECIMAL(12,2),
  average_transaction DECIMAL(12,2),
  UNIQUE(outlet_id, sale_date)
);

CREATE TABLE IF NOT EXISTS product_sales_summary (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER REFERENCES outlets(id),
  product_id INTEGER REFERENCES products(id),
  period_date DATE,
  quantity_sold INT,
  revenue DECIMAL(12,2),
  cost DECIMAL(12,2),
  gross_margin DECIMAL(12,2)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_sales_outlet_created ON sales(outlet_id, created_at DESC);
CREATE INDEX idx_stock_levels_outlet ON stock_levels(warehouse_id);
CREATE INDEX idx_customers_outlet_created ON customers(outlet_id, created_at DESC);

-- ============================================================================
-- SEED DATA (Default Roles)
-- ============================================================================

INSERT INTO roles (name, description, permissions) VALUES
  ('owner', 'Pemilik - Akses penuh',
   '["sales.view","sales.create","product.all","inventory.all","report.all","user.all","settings.all"]'::jsonb),
  ('manager', 'Manajer - Kontrol penuh operasional',
   '["sales.view","sales.create","product.view","product.edit","inventory.all","report.view","user.view","user.staff"]'::jsonb),
  ('supervisor', 'Supervisor - Monitoring & approval',
   '["sales.view","product.view","inventory.view","report.view","approval.return","approval.po"]'::jsonb),
  ('cashier', 'Kasir - Transaksi & penjualan',
   '["sales.create","sales.view","product.view","inventory.view"]'::jsonb),
  ('warehouse', 'Gudang - Manajemen stok',
   '["inventory.all","product.view","stock.move"]'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DONE
-- ============================================================================

COMMIT;
