# 🏃 KASIRIN PHASE 1 - DAILY SPRINT PLAN

**Start Date:** March 11, 2026  
**Target Go-Live:** March 28-31, 2026  
**Duration:** 3 weeks (21 days)

---

## 📚 ARSITEKTUR SISTEM KASIRIN

### 🐳 Docker

**Definisi & Fungsi:**
Docker adalah platform containerization yang mengemas aplikasi beserta semua dependencies-nya dalam satu unit yang dapat dijalankan di mana saja. Dalam sistem KASIRIN, Docker memastikan konsistensi lingkungan development, testing, dan production.

**Komponen Docker di KASIRIN:**
- **Backend Container**: Node.js server yang berjalan di port 5001
- **Frontend Container**: React app yang di-serve via Nginx di port 3000
- **PostgreSQL Database**: Database container untuk data store
- **docker-compose.yml**: Orchestration file yang mengatur ketiga service agar dapat berkomunikasi

**Keuntungan:**
- ✅ Environment yang konsisten (Dev, Test, Prod sama persis)
- ✅ Dependency isolation (tidak perlu install manually)
- ✅ Mudah di-scale dan di-deploy
- ✅ Kompatibel dengan Cloud (Azure Container Apps, Kubernetes)

**Perintah Utama:**
```bash
# Build image
docker build -t kasirin-backend:latest ./backend
docker build -t kasirin-frontend:latest ./frontend

# Jalankan dengan compose
docker-compose up -d

# Stop service
docker-compose down
```

---

### 💻 Frontend

**Definisi & Fungsi:**
Frontend adalah interface (UI/UX) yang digunakan oleh pengguna akhir untuk berinteraksi dengan sistem KASIRIN. Dibangun dengan React dan Tailwind CSS untuk responsiveness dan user experience yang baik.

**Technology Stack:**
- **Framework**: React 18+ (component-based UI)
- **State Management**: Redux (for complex state handling)
- **Styling**: Tailwind CSS + PostCSS (utility-first CSS)
- **HTTP Client**: Axios (communicate with backend API)
- **Build Tool**: Create React App (CRA)
- **Server**: Nginx (production-grade web server)

**Fitur Utama Frontend KASIRIN:**
1. **Authentication Page**: Login untuk semua role (Admin, Manager, Kasir, Warehouse)
2. **Dashboard**: Overview toko (sales, inventory, shifts)
3. **Sales Module**: Interface untuk mencatat penjualan
4. **Inventory Module**: Manajemen stok produk
5. **User Management**: CRUD user dengan role-based access
6. **Reports**: Laporan penjualan, inventory, shift
7. **Settings**: Konfigurasi outlet, preferensi user

**Folder Struktur Frontend:**
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page containers (Dashboard, Sales, etc)
│   ├── services/      # API calls (api.js)
│   ├── store/         # Redux state management
│   ├── utils/         # Helper functions (export, formatters)
│   └── App.js         # Root component
├── public/            # Static assets
└── Dockerfile         # Container config
```

**Alur Data Frontend:**
```
User Input → Component State → Redux Store → API Call → Backend → Response → Redux Update → Re-render
```

---

### 🔧 Backend

**Definisi & Fungsi:**
Backend adalah server-side application yang menangani business logic, autentikasi, validasi data, dan komunikasi dengan database. Dibangun dengan Node.js + Express untuk REST API yang scalable.

**Technology Stack:**
- **Runtime**: Node.js (JavaScript runtime untuk server)
- **Framework**: Express (web framework untuk routing & middleware)
- **Database**: PostgreSQL (relational database yang robust)
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs (password hashing)
- **Validation**: express-validator (input validation)
- **Email**: nodemailer (for notifications)
- **Middleware**: CORS, body-parser, morgan (logging)

**Fitur Utama Backend KASIRIN:**
1. **Authentication System**: Login, token generation, password hashing
2. **User Management**: CRUD, role assignment, permission checking
3. **Product Management**: Inventory tracking, stock in/out
4. **Sales Processing**: Order creation, payment, receipt generation
5. **Shift Management**: Shift creation, cashier assignment, settlement
6. **Integration APIs**: Third-party system integration (if needed)
7. **Reports Generation**: Sales, inventory, audit reports
8. **AI Features**: Recommendation engine, price optimization

**Folder Struktur Backend:**
```
backend/
├── controllers/       # Business logic handlers
├── routes/           # API endpoints definition
├── middleware/       # Auth, logging, error handling
├── config/           # Database connection, environment
├── utils/            # Helper functions (email, formatting)
├── scripts/          # Database seeding, migrations
├── server.js         # Express app entry point
└── Dockerfile        # Container config
```

**Alur Data Backend:**
```
HTTP Request → Express Router → Authentication Middleware → 
Role Check → Validation → Controller Logic → Database Query → 
Response Formatting → HTTP Response
```

**Key API Endpoints:**
```
POST   /api/auth/login              - User authentication
GET    /api/users                   - List all users
POST   /api/users                   - Create new user
PUT    /api/users/:id               - Update user
GET    /api/products                - List products
POST   /api/sales                   - Create sale order
GET    /api/reports/sales           - Generate sales report
```

---

## 🎯 PHASE 1A: FOUNDATION (Week 1 - Days 1-4)

### ✅ DAY 1 (March 11): Database Migration & Seed

**Morning: Backup & Prepare**
```bash
# 1. Backup current database
pg_dump -U postgres kasirin_db > kasirin_db_backup_20260311.sql

# 2. Check current schema
psql -U postgres -d kasirin_db -c "\dt"
```

**Afternoon: Apply New Schema**
```bash
# 3. Apply schema_v2.sql (replaces old schema)
psql -U postgres -d kasirin_db -f database/schema_v2.sql

# 4. Seed default data
psql -U postgres -d kasirin_db << EOF
-- Default roles (already in schema_v2, but verify)
SELECT * FROM roles;

-- Create admin user
INSERT INTO users (username, email, password, first_name, last_name, role_id, is_active)
VALUES ('admin', 'admin@kasirin.com', '$2b$10$...', 'Admin', 'Kasirin', 1, true);

-- Create test users (for testing each role)
INSERT INTO users (username, email, password, first_name, last_name, role_id, is_active)
VALUES 
  ('manager1', 'manager@kasirin.com', '$2b$10$...', 'Store', 'Manager', 2, true),
  ('kasir1', 'kasir1@kasirin.com', '$2b$10$...', 'Kasir', 'Satu', 4, true),
  ('warehouse1', 'warehouse@kasirin.com', '$2b$10$...', 'Warehouse', 'Keeper', 5, true);

-- Create default outlet
INSERT INTO outlets (name, address, city, phone, email, is_main_office)
VALUES ('Toko Apple Terpercaya', 'Jl. Merdeka No. 123', 'Jakarta', '0812-3456-7890', 'info@kasirin.com', true);

-- Create default warehouse
INSERT INTO warehouses (outlet_id, name, is_default)
VALUES (1, 'Gudang Utama', true);
EOF
```

**Evening: Verify & Test**
```bash
# 5. Check tables created
psql -U postgres -d kasirin_db -c "\dt"

# 6. Check users created
psql -U postgres -d kasirin_db -c "SELECT id, username, email FROM users;"

# 7. Test connection from Node.js
node -e "require('pg').Pool().query('SELECT NOW()', (err, res) => console.log(err ? err : res.rows))"
```

**Definition of Done:**
- [x] All 50+ tables created
- [x] No constraint errors
- [x] Users table populated with test users
- [x] Roles loaded
- [x] Outlet & warehouse created
- [x] Can query from Node.js

---

### ✅ DAY 2 (March 12): User Management Backend - Part 1

**Task: Create User Controller & Routes**

**File 1: `backend/controllers/userController.js` (NEW)**
```javascript
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

class UserController {
  // Get all users (admin/manager only)
  async getAllUsers(req, res) {
    try {
      const result = await pool.query(
        `SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
                u.phone, r.name as role, u.is_active, u.last_login, u.created_at
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.id
         WHERE u.is_active = true
         ORDER BY u.created_at DESC`
      );
      res.json({ status: 'success', data: result.rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // Create user (admin/manager only)
  async createUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    const { username, email, password, first_name, last_name, phone, role_id } = req.body;

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `INSERT INTO users (username, email, password, first_name, last_name, phone, role_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         RETURNING id, username, email, first_name, last_name, phone, role_id`,
        [username, email, hashedPassword, first_name, last_name, phone, role_id]
      );

      res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (error) {
      console.error(error);
      if (error.code === '23505') {
        return res.status(409).json({ status: 'error', message: 'Username or email already exists' });
      }
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // Update user
  async updateUser(req, res) {
    const { id } = req.params;
    const { first_name, last_name, email, phone, role_id } = req.body;

    try {
      const result = await pool.query(
        `UPDATE users 
         SET first_name = $1, last_name = $2, email = $3, phone = $4, role_id = $5, updated_at = NOW()
         WHERE id = $6
         RETURNING id, username, email, first_name, last_name, phone, role_id`,
        [first_name, last_name, email, phone, role_id, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({ status: 'success', data: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // Deactivate user
  async deactivateUser(req, res) {
    const { id } = req.params;

    try {
      const result = await pool.query(
        `UPDATE users SET is_active = false WHERE id = $1 RETURNING id, username`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({ status: 'success', message: 'User deactivated', data: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // Get current user profile
  async getCurrentUser(req, res) {
    try {
      const result = await pool.query(
        `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.phone,
                r.name as role, r.id as role_id
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.id
         WHERE u.id = $1 AND u.is_active = true`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({ status: 'success', data: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = new UserController();
```

**File 2: `backend/routes/users.js` (NEW)**
```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateUser = [
  body('username').notEmpty().withMessage('Username required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('first_name').notEmpty().withMessage('First name required'),
  body('role_id').isInt().withMessage('Valid role required')
];

// Routes
router.get('/me', authMiddleware, userController.getCurrentUser);
router.get('/', authMiddleware, requireRole(['owner', 'manager']), userController.getAllUsers);
router.post('/', authMiddleware, requireRole(['owner', 'manager']), validateUser, userController.createUser);
router.put('/:id', authMiddleware, requireRole(['owner', 'manager']), userController.updateUser);
router.put('/:id/deactivate', authMiddleware, requireRole(['owner']), userController.deactivateUser);

module.exports = router;
```

**Definition of Done:**
- [x] userController.js created with 5 methods
- [x] users.js routes created
- [x] Test with Postman (create user, get all, update)
- [x] Error handling works

---

### ✅ DAY 3 (March 13): Auth Middleware & RBAC

**File: `backend/middleware/auth.js` (UPDATE)**
```javascript
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: 'error', message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user dengan role
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, r.name as role, r.id as role_id
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1 AND u.is_active = true`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ status: 'error', message: 'User not found or inactive' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'Access denied' });
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole };
```

**Test RBAC:**
```bash
# 1. Login as manager
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager1","password":"..."}' # get actual password from seed

# 2. Try to create user (should work)
curl -X POST http://localhost:5001/api/users \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"username":"kasir2","email":"kasir2@kasirin.com","password":"pass123","first_name":"Kasir","last_name":"Dua","role_id":4}'

# 3. Test RBAC - kasir tries to create user (should fail)
# ...
```

**Definition of Done:**
- [x] authMiddleware checks token & user
- [x] requireRole enforces permissions
- [x] Manager can create users ✅
- [x] Kasir cannot create users ✅
- [x] Invalid token rejected ✅

---

### ✅ DAY 4 (March 14): Integration & Testing

**Step 1: Update server.js to include new routes**
```javascript
// In backend/server.js, add:
const userRoutes = require('./routes/users');

app.use('/api/users', userRoutes);
```

**Step 2: Create Postman collection for testing**
```json
{
  "info": { "name": "KASIRIN Phase 1 Tests" },
  "item": [
    {
      "name": "Auth Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:5001/api/auth/login",
        "body": {
          "username": "manager1",
          "password": "manager123"
        }
      }
    },
    {
      "name": "Get All Users",
      "request": {
        "method": "GET",
        "url": "http://localhost:5001/api/users",
        "header": {"Authorization": "Bearer {{TOKEN}}"}
      }
    }
  ]
}
```

**Step 3: Full Test Checklist**
```
✅ Database tables exist
✅ Default users created
✅ Can login with manager account
✅ Token received
✅ Can get /api/users with valid token
✅ Cannot get /api/users without token
✅ Cannot create user as kasir (RBAC)
✅ Can create user as manager
✅ Can update user as manager
✅ Can deactivate user as owner only
```

**End of Phase 1A:** You have:
- ✅ Full database schema
- ✅ User management system
- ✅ RBAC middleware
- ✅ 4+ test users for different roles

Next week: Inventory + Shift System!

---

## 🎯 PHASE 1B: OPERATIONS (Week 2 - Days 5-9)

### ✅ DAY 5 (March 17): Inventory APIs - Part 1

**File: `backend/controllers/inventoryController.js` (NEW)**

[See detailed code below in implementation]

### ✅ DAY 6-7: Inventory APIs - Part 2 & Shift System

### ✅ DAY 8-9: Sales Enhancement & Integration

---

## 🎯 PHASE 1C: TESTING & GO-LIVE

### DAY 10-14: ...

---

## 📋 SUCCESS METRICS

By end of each day, verify:
- Database queries execute without errors
- API returns correct status codes
- Permissions enforced correctly
- No sensitive data in logs
- Code follows Node.js best practices

---

## 🐛 Troubleshooting

**If database migration fails:**
```bash
# Rollback
psql -U postgres -d kasirin_db -f kasirin_db_backup_20260311.sql
```

**If Node.js can't connect to DB:**
```bash
# Check postgres service
sudo systemctl status postgresql

# Check credentials in .env
cat backend/.env
```

**If token invalid:**
- Verify JWT_SECRET in .env matches
- Check token expiry time
- Regenerate token

---

Let's Go! Start with DAY 1! 🚀
