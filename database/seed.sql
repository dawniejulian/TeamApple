-- ========================================
-- KASIRIN - DATABASE SEED SCRIPT
-- Run AFTER schema_v2.sql has been applied
-- ========================================

-- 1. VERIFY SCHEMA APPLIED
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. CREATE DEFAULT OUTLET
INSERT INTO outlets (name, address, city, province, postal_code, phone, email, is_main_office, is_active)
VALUES ('Toko Apple Terpercaya', 'Jl. Merdeka No. 123, Jakarta', 'Jakarta', 'DKI Jakarta', '12345', '0812-3456-7890', 'info@kasirin.com', true, true)
ON CONFLICT DO NOTHING;

-- Get outlet ID for next inserts
-- SELECT id FROM outlets WHERE is_main_office = true LIMIT 1;

-- 3. CREATE DEFAULT WAREHOUSE
INSERT INTO warehouses (outlet_id, name, location, is_default, is_active)
SELECT id, 'Gudang Utama', 'Toko Jakarta', true, true FROM outlets WHERE is_main_office = true
ON CONFLICT DO NOTHING;

-- 4. CREATE DEFAULT CATEGORIES
INSERT INTO categories (outlet_id, name, description, is_active)
SELECT id, 'Smartphone', 'iPhone dan Android', true FROM outlets WHERE is_main_office = true
ON CONFLICT DO NOTHING;

INSERT INTO categories (outlet_id, name, description, is_active)
SELECT id, 'Aksesori', 'Charger, Case, Screen Protector', true FROM outlets WHERE is_main_office = true
ON CONFLICT DO NOTHING;

-- 5. CREATE DEFAULT PAYMENT METHODS (if not already seeded in schema)
INSERT INTO payment_methods (outlet_id, name, code, is_active, display_order)
SELECT id, 'Tunai (Cash)', 'CASH', true, 1 FROM outlets WHERE is_main_office = true
ON CONFLICT DO NOTHING;

INSERT INTO payment_methods (outlet_id, name, code, is_active, display_order)
SELECT id, 'Debit/Kredit', 'CARD', true, 2 FROM outlets WHERE is_main_office = true
ON CONFLICT DO NOTHING;

INSERT INTO payment_methods (outlet_id, name, code, is_active, display_order)
SELECT id, 'QRIS', 'QRIS', true, 3 FROM outlets WHERE is_main_office = true
ON CONFLICT DO NOTHING;

-- 6. CREATE TEST USERS WITH HASHED PASSWORDS
-- Password: admin123 -> bcrypt hash
-- Use bcrypt with salt rounds 10

-- ADMIN USER (Role: owner = id 1)
INSERT INTO users (username, email, password, first_name, last_name, phone, role_id, outlet_id, is_active)
VALUES (
  'admin',
  'admin@kasirin.com',
  '$2b$10$KIXxPfxjYTgFxQpLMhTkJO/fFM6lKZH5KLvMeWt4r3LKT8R9DhXvS', -- admin123 hashed
  'Admin',
  '',
  '0812-1111-1111',
  1,
  (SELECT id FROM outlets WHERE is_main_office = true LIMIT 1),
  true
)
ON CONFLICT (username) DO NOTHING;

-- MANAGER USER (Role: manager = id 2)
INSERT INTO users (username, email, password, first_name, last_name, phone, role_id, outlet_id, is_active)
VALUES (
  'manager1',
  'manager@kasirin.com',
  '$2b$10$KIXxPfxjYTgFxQpLMhTkJO/fFM6lKZH5KLvMeWt4r3LKT8R9DhXvS', -- admin123 hashed
  'Toko',
  'Manager',
  '0812-2222-2222',
  2,
  (SELECT id FROM outlets WHERE is_main_office = true LIMIT 1),
  true
)
ON CONFLICT (username) DO NOTHING;

-- KASIR USER (Role: cashier = id 4)
INSERT INTO users (username, email, password, first_name, last_name, phone, role_id, outlet_id, is_active)
VALUES (
  'kasir1',
  'kasir1@kasirin.com',
  '$2b$10$KIXxPfxjYTgFxQpLMhTkJO/fFM6lKZH5KLvMeWt4r3LKT8R9DhXvS', -- admin123 hashed
  'Kasir',
  'Satu',
  '0812-3333-3333',
  4,
  (SELECT id FROM outlets WHERE is_main_office = true LIMIT 1),
  true
)
ON CONFLICT (username) DO NOTHING;

-- WAREHOUSE USER (Role: warehouse = id 5)
INSERT INTO users (username, email, password, first_name, last_name, phone, role_id, outlet_id, is_active)
VALUES (
  'warehouse1',
  'warehouse@kasirin.com',
  '$2b$10$KIXxPfxjYTgFxQpLMhTkJO/fFM6lKZH5KLvMeWt4r3LKT8R9DhXvS', -- admin123 hashed
  'Warehouse',
  'Keeper',
  '0812-4444-4444',
  5,
  (SELECT id FROM outlets WHERE is_main_office = true LIMIT 1),
  true
)
ON CONFLICT (username) DO NOTHING;

-- 7. CREATE TEST PRODUCTS
INSERT INTO products (outlet_id, name, sku, barcode, category_id, condition_id, purchase_price, selling_price, unit, is_active)
SELECT 
  o.id,
  'iPhone 14 Pro 128GB',
  'IP14PRO128',
  '8901234567890',
  (SELECT id FROM categories WHERE name = 'Smartphone' AND outlet_id = o.id LIMIT 1),
  1,
  8000000,
  10000000,
  'pcs',
  true
FROM outlets o WHERE is_main_office = true
ON CONFLICT DO NOTHING;

INSERT INTO products (outlet_id, name, sku, barcode, category_id, condition_id, purchase_price, selling_price, unit, is_active)
SELECT 
  o.id,
  'iPhone 14 Pro 256GB',
  'IP14PRO256',
  '8901234567891',
  (SELECT id FROM categories WHERE name = 'Smartphone' AND outlet_id = o.id LIMIT 1),
  1,
  9000000,
  11000000,
  'pcs',
  true
FROM outlets o WHERE is_main_office = true
ON CONFLICT DO NOTHING;

INSERT INTO products (outlet_id, name, sku, barcode, category_id, condition_id, purchase_price, selling_price, unit, is_active)
SELECT 
  o.id,
  'AirPods Pro',
  'AIRPODSPRO',
  '8901234567892',
  (SELECT id FROM categories WHERE name = 'Aksesori' AND outlet_id = o.id LIMIT 1),
  1,
  800000,
  1200000,
  'pcs',
  true
FROM outlets o WHERE is_main_office = true
ON CONFLICT DO NOTHING;

-- 8. INITIALIZE STOCK LEVELS FOR PRODUCTS
INSERT INTO stock_levels (product_id, warehouse_id, quantity_on_hand, minimum_quantity)
SELECT p.id, w.id, 5, 3
FROM products p, warehouses w
WHERE p.is_active = true AND w.is_default = true
ON CONFLICT (product_id, warehouse_id) DO NOTHING;

-- 9. VERIFY SEED COMPLETE
SELECT 'SEED COMPLETE' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as product_count FROM products;
SELECT COUNT(*) as stock_count FROM stock_levels;
