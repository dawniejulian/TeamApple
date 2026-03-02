const { Pool } = require('pg');
require('dotenv').config({ path: '../backend/.env' });

const poolConfig = {
  user: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres'
};

// Only add password if it exists
if (process.env.DB_PASSWORD) {
  poolConfig.password = process.env.DB_PASSWORD;
}

const pool = new Pool(poolConfig);

const createDatabaseSQL = `
  SELECT 1 FROM pg_database WHERE datname = 'kasirin_db';
`;

const schemaSQL = `
-- ============================================================================
-- ROLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role_id INTEGER REFERENCES roles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CONDITIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_conditions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SALES CHANNELS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS sales_channels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  description TEXT,
  image_url VARCHAR(255),
  purchase_price DECIMAL(12,2),
  selling_price DECIMAL(12,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PRODUCT VARIANTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  condition_id INTEGER REFERENCES product_conditions(id),
  variant_name VARCHAR(100),
  sku_variant VARCHAR(100) UNIQUE,
  color VARCHAR(50),
  storage VARCHAR(50),
  price_adjustment DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INVENTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_location VARCHAR(100) DEFAULT 'Main',
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5,
  max_stock_level INTEGER DEFAULT 100,
  last_stock_check TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- STOCK MOVEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  movement_type VARCHAR(50) NOT NULL,
  quantity_change INTEGER NOT NULL,
  reference_id INTEGER,
  reference_type VARCHAR(50),
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- STOCK ALERTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_alerts (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  alert_type VARCHAR(50),
  current_stock INTEGER,
  threshold_level INTEGER,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SALES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  channel_id INTEGER REFERENCES sales_channels(id),
  total_items INTEGER,
  subtotal DECIMAL(12,2),
  tax_amount DECIMAL(12,2),
  discount_amount DECIMAL(12,2),
  total_amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50),
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SALE ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- BUYBACK REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS buyback_requests (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  offer_price DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TRADE INS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS trade_ins (
  id SERIAL PRIMARY KEY,
  old_product_id INTEGER REFERENCES products(id),
  new_product_id INTEGER REFERENCES products(id),
  trade_in_value DECIMAL(12,2),
  customer_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PRICE LIST TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS price_list (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  effective_date DATE,
  price DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PROMOTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS promotions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20),
  discount_value DECIMAL(12,2),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- WHATSAPP MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20),
  message TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- DAILY SALES SUMMARY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_sales_summary (
  id SERIAL PRIMARY KEY,
  sale_date DATE NOT NULL UNIQUE,
  total_sales DECIMAL(12,2),
  total_items INTEGER,
  total_transactions INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PRODUCT SALES PERFORMANCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_sales_performance (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  period_month VARCHAR(7),
  sales_quantity INTEGER,
  revenue DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50),
  table_name VARCHAR(100),
  record_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_number ON sales(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_sales_summary_date ON daily_sales_summary(sale_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- INSERT SAMPLE DATA
-- ============================================================================

-- Roles
INSERT INTO roles (name, description) VALUES
  ('Admin', 'Administrator with full access'),
  ('Manager', 'Store manager'),
  ('Staff', 'Shop staff'),
  ('Cashier', 'Cashier/Penjual')
ON CONFLICT (name) DO NOTHING;

-- Conditions
INSERT INTO product_conditions (name, description) VALUES
  ('New', 'Brand new product'),
  ('Like New', 'Practically new, minimal use'),
  ('Good', 'Good condition with minor signs of use'),
  ('Fair', 'Functional with cosmetic damage'),
  ('Parts Only', 'For parts only')
ON CONFLICT DO NOTHING;

-- Categories
INSERT INTO categories (name, description) VALUES
  ('iPhone', 'Apple iPhone devices'),
  ('iPad', 'Apple iPad tablets'),
  ('Mac', 'Apple Mac computers'),
  ('Apple Watch', 'Wearable devices'),
  ('AirPods', 'Audio products'),
  ('Accessories', 'Other Apple accessories')
ON CONFLICT DO NOTHING;

-- Sales Channels
INSERT INTO sales_channels (name, description) VALUES
  ('Walk-in', 'Direct store visit'),
  ('Online', 'E-commerce sales'),
  ('Phone', 'Telephone order'),
  ('Wholesale', 'Bulk order'),
  ('B2B', 'Business to business')
ON CONFLICT DO NOTHING;

-- Users
INSERT INTO users (username, email, password, first_name, last_name, phone, role_id) VALUES
  ('admin', 'admin@kasirin.com', 'admin123', 'Admin', 'User', '081234567890', 1),
  ('manager', 'manager@kasirin.com', 'manager123', 'Manajer', 'Toko', '081234567891', 2),
  ('staff', 'staff@kasirin.com', 'staff123', 'Staff', 'Toko', '081234567892', 3),
  ('cashier', 'cashier@kasirin.com', 'cashier123', 'Kasir', 'Toko', '081234567893', 4)
ON CONFLICT (username) DO NOTHING;

-- Sample Products
INSERT INTO products (name, sku, category_id, description, selling_price, purchase_price) VALUES
  ('iPhone 15 Pro', 'IPHONE15PRO', 1, 'Latest iPhone with A17 Pro chip', 15999000, 14000000),
  ('iPhone 15', 'IPHONE15', 1, 'iPhone 15 standard model', 12999000, 11500000),
  ('iPad Pro 12.9', 'IPADPRO129', 2, 'Latest iPad Pro with M2 chip', 13999000, 12000000),
  ('MacBook Air M2', 'MBAM2', 3, 'MacBook Air with M2 processor', 14999000, 13000000),
  ('Apple Watch Series 9', 'AWSERIES9', 4, 'Latest Apple Watch', 4999000, 4200000),
  ('AirPods Pro', 'AIRPODSPRO', 5, 'Noise-cancelling wireless earbuds', 2999000, 2400000)
ON CONFLICT (sku) DO NOTHING;

-- Sample Inventory
INSERT INTO inventory (product_id, warehouse_location, stock_quantity, min_stock_level, max_stock_level) 
SELECT id, 'Main Warehouse', 5, 2, 20 FROM products
ON CONFLICT DO NOTHING;
`;

const runMigration = async () => {
  try {
    // Check if database exists
    const res = await pool.query(createDatabaseSQL);
    
    if (res.rows.length === 0) {
      console.log('Creating kasirin_db database...');
      await pool.query('CREATE DATABASE kasirin_db');
      console.log('✅ Database created');
    } else {
      console.log('✅ Database already exists');
    }

    // Close connection to default postgres db
    await pool.end();

    // Connect to kasirin_db
    const kasirPoolConfig = {
      user: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: 'kasirin_db'
    };

    if (process.env.DB_PASSWORD) {
      kasirPoolConfig.password = process.env.DB_PASSWORD;
    }

    const kasirPool = new Pool(kasirPoolConfig);

    console.log('\nCreating tables and indexes...');
    await kasirPool.query(schemaSQL);
    console.log('✅ Schema created successfully');

    await kasirPool.end();
    console.log('\n✅ Migration completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

runMigration();
