🔴 **KASIRIN PHASE 1A - DAY 1 EXECUTION CHECKLIST**

Date: March 11, 2026  
Focus: Database Migration & Seed Data  
Estimated Time: 4-6 hours

---

## 🛠️ STEP 1: Prepare Environment (30 min)

### 1.1 Backup Current Database
```bash
cd /Users/mac/Document/kasirin

# Create backup
pg_dump -U postgres kasirin_db > database/backup_20260311.sql

# Verify backup file created
ls -lh database/backup_20260311.sql
```

**✅ Expected:** Backup file ~1-5 MB

**If error:** Check PostgreSQL password in `~/.pgpass` or use `-W` flag

---

### 1.2 Check PostgreSQL is Running
```bash
# Check service
brew services list | grep postgresql

# If not running:
brew services start postgresql@15

# Test connection
psql -U postgres -d kasirin_db -c "SELECT NOW();"
```

**✅ Expected:** Current timestamp displayed

---

## 📊 STEP 2: Apply New Database Schema (1 hour)

### 2.1 Drop Old Schema (CAREFUL!)
```bash
# Connect to database
psql -U postgres -d kasirin_db

# Inside psql, drop all tables:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;

# Exit psql
\q
```

**⚠️ WARNING:** This deletes ALL data. Make sure backup is done!

**✅ Expected:** `CREATE SCHEMA` command executed

---

### 2.2 Apply New Schema
```bash
# From project root
cd /Users/mac/Document/kasirin

# Apply schema_v2.sql
psql -U postgres -d kasirin_db -f database/schema_v2.sql

# Watch for errors - should see:
# - CREATE TABLE messages
# - CREATE INDEX messages
# - INSERT INTO roles (default data)
```

**⏱️ Should take 2-3 minutes**

**If error:** Check file exists: `ls -la database/schema_v2.sql`

---

### 2.3 Verify Schema Applied
```bash
psql -U postgres -d kasirin_db << EOF
-- Count tables
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public';

-- List all tables
\dt

-- Check roles table
SELECT * FROM roles;

-- Check payment_methods seeded
SELECT * FROM payment_methods WHERE code != 'NULL';

\q
EOF
```

**✅ Expected Results:**
- `table_count: 50+` tables
- `roles table` has 5 rows (owner, manager, supervisor, cashier, warehouse)
- `payment_methods` has 6 rows (Cash, Debit, Credit, QRIS, Transfer, E-wallet)

**If missing:** Rerun schema_v2.sql

---

## 🌱 STEP 3: Seed Test Data (30 min)

### 3.1 Apply Seed Data
```bash
cd /Users/mac/Document/kasirin

# Apply seed.sql
psql -U postgres -d kasirin_db -f database/seed.sql
```

**⏱️ Should take <1 minute**

**⚠️ Watch for:** Any `DUPLICATE KEY` errors (might be normal, means data already exists)

---

### 3.2 Verify Seed Data
```bash
psql -U postgres -d kasirin_db << EOF
-- Check outlets created
SELECT id, name, is_main_office FROM outlets;

-- Check warehouses created
SELECT w.id, w.name, o.name as outlet FROM warehouses w JOIN outlets o ON w.outlet_id = o.id;

-- Check users created
SELECT u.id, u.username, u.first_name, r.name as role 
FROM users u 
JOIN roles r ON u.role_id = r.id;

-- Check products created
SELECT id, name, sku, barcode, selling_price FROM products LIMIT 5;

-- Check stock levels
SELECT sl.id, p.name, sl.quantity_on_hand, sl.minimum_quantity
FROM stock_levels sl
JOIN products p ON sl.product_id = p.id;

\q
EOF
```

**✅ Expected:**
- 1 outlet (Toko Apple Terpercaya)
- 1 warehouse (Gudang Utama)
- 4 users:
  - admin / admin123 (owner)
  - manager1 / admin123 (manager)
  - kasir1 / admin123 (cashier)
  - warehouse1 / admin123 (warehouse)
- 3 products (iPhone 14 Pro 128GB, 256GB, AirPods Pro)
- Stock levels for each product

---

## 🔐 STEP 4: Test Database from Node.js (30 min)

### 4.1 Check .env Configuration
```bash
cd /Users/mac/Document/kasirin/backend

# Check .env file
cat .env
# Should have:
# DB_HOST=db (or localhost if local)
# DB_PORT=5432
# DB_NAME=kasirin_db
# DB_USER=postgres
# DB_PASSWORD=postgres
# JWT_SECRET=kasirin_jwt_secret_2024_secure
```

**If missing:** Create/update .env with above values

---

### 4.2 Test Connection from Node.js
```bash
cd /Users/mac/Document/kasirin/backend

# Quick test
node -e "
const pool = require('./config/database');
pool.query('SELECT COUNT(*) as user_count FROM users', (err, res) => {
  if (err) console.error('ERROR:', err.message);
  else console.log('✅ DB Connected! Users:', res.rows[0].user_count);
  process.exit(0);
});
"
```

**✅ Expected Output:**
```
✅ DB Connected! Users: 4
```

**If error "connect ECONNREFUSED":**
- PostgreSQL not running: `brew services start postgresql@15`
- Wrong DB credentials: Check .env
- Wrong DB name: Should be `kasirin_db`

---

## 📝 STEP 5: Documentation & Commit (30 min)

### 5.1 Document Test Results
Create file: `logs/Day1_Migration_Report.txt`
```
DATE: March 11, 2026
TASK: Database Migration

RESULTS:
- ✅ Backup created: database/backup_20260311.sql
- ✅ Old schema dropped
- ✅ New schema applied (50+ tables)
- ✅ Roles seeded (5 roles)
- ✅ Payment methods seeded (6 methods)
- ✅ Test outlet created
- ✅ Test warehouse created
- ✅ Test users created (4 users, all can login with "admin123")
- ✅ Test products created (3 products with stock)
- ✅ Node.js connection tested ✅

ISSUES:
- None

NEXT STEP: Day 2 - User Management APIs
```

### 5.2 Git Commit
```bash
cd /Users/mac/Document/kasirin

git add -A

git commit -m "🚀 Day 1: Database migration & seed data

- Applied schema_v2.sql with 50+ tables
- Created default outlets, warehouses, categories
- Seeded test users with roles (admin, manager, kasir, warehouse)
- Seeded test products and stock levels
- Verified Node.js database connection
- All test data ready for Phase 1"
```

---

## ✅ DAY 1 SUCCESS CRITERIA

Before proceeding to Day 2, verify ALL of these:

- [x] PostgreSQL running locally
- [x] Backup file created
- [x] New schema applied (50+ tables)
- [x] 5 roles created
- [x] 4 test users created with passwords
- [x] 1 default outlet & warehouse
- [x] 3 test products with stock
- [x] Node.js connects to database
- [x] No errors in PSql commands
- [x] Git commit done

---

## 🆘 TROUBLESHOOTING

### PostgreSQL Connection Error
```bash
# Check if running
brew services list | grep postgres

# Start if needed
brew services start postgresql@15

# Check port
lsof -i :5432

# Reset if stuck
brew services stop postgresql@15
brew services start postgresql@15
```

### Schema Application Failed
```bash
# Check syntax
psql -U postgres -d kasirin_db -f database/schema_v2.sql 2>&1 | head -20

# If foreign key issues, check order
# (schema_v2.sql should have correct order)

# Restore from backup if needed
psql -U postgres -d kasirin_db -f database/backup_20260311.sql
```

### Users Can't Login
```bash
# Check password hash
psql -U postgres -d kasirin_db << EOF
SELECT username, password FROM users WHERE username = 'manager1';
\q
EOF

# Password should start with: $2b$10$
# If not, reseed users
psql -U postgres -d kasirin_db -f database/seed.sql
```

---

## 📞 When Done

Message when completed:
```
✅ DAY 1 COMPLETE
- Database migrated ✅
- Test data seeded ✅
- Node.js connection verified ✅

Ready for DAY 2: User Management APIs
```

Then we'll proceed to create User Controller and Routes!

---

**Estimated Total Time: 4-5 hours**  
**Start Time:** Now!  
**Target Completion:** Today  
**Next Step:** DAY 2 (Tomorrow or Continue)

Let's Go! 🚀
