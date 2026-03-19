# 🧪 DAY 2-3 TESTING GUIDE: User Management APIs

**Date:** March 12-13, 2026  
**Focus:** User Management CRUD & RBAC Testing  
**Duration:** 2-3 hours each day

---

## 📋 PHASE 1A: User Management API Endpoints

Your backend now has **6 user management endpoints**:

| Endpoint | Method | RBAC | Purpose |
|----------|--------|------|---------|
| `/api/users/me` | GET | Any Auth User | Get current logged-in user |
| `/api/users` | GET | owner, manager | List all users (paginated) |
| `/api/users/:id` | GET | owner, manager | Get specific user details |
| `/api/users` | POST | owner, manager | Create new user |
| `/api/users/:id` | PUT | owner, manager | Update user info |
| `/api/users/:id/deactivate` | PUT | owner only | Deactivate user (soft delete) |

---

## 🔐 AUTHENTICATION FLOW

Every API call needs a **JWT Token**. Here's the flow:

```
1. Get Token (use existing backend auth routes)
2. Include Token in Authorization Header
3. Make API Request
4. Check Response
```

---

## 🧪 TESTING WORKFLOW

### Setup (Before Testing)
1. Open **Postman** (download if needed)
2. Create new **Collection** named "Kasirin User API"
3. Set **Base URL** to `http://localhost:5001/api`

---

## 📍 TEST 1: GET CURRENT USER (`/api/users/me`)

**Purpose:** Verify you can get your own profile  
**Auth Required:** Yes (any auth token)  
**Expected:** Returns logged-in user data

### Test as Admin
```
Method:  GET
URL:     http://localhost:5001/api/users/me
Headers: Authorization: Bearer {token}

Expected Response (200 OK):
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@kasirin.com",
    "first_name": "Admin",
    "last_name": "User",
    "phone": "081234567890",
    "role_id": 1,
    "is_active": true,
    "created_at": "2026-03-12T..."
  }
}
```

### How to Get Token:
```bash
# Check what auth endpoint exists in your backend
# Typical endpoint: POST /api/auth/login

curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Response will include: { "token": "eyJhbGc..." }
```

---

## 📍 TEST 2: GET ALL USERS (`/api/users`)

**Purpose:** Manager/Owner can list all users with pagination  
**Auth Required:** Yes (owner or manager)  
**Expected:** Returns paginated user list

### Test as Manager
```
Method:  GET
URL:     http://localhost:5001/api/users?page=1&limit=10
Headers: Authorization: Bearer {manager_token}

Expected Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@kasirin.com",
      "role_id": 1,
      "is_active": true
    },
    {
      "id": 2,
      "username": "manager1",
      "email": "manager@kasirin.com",
      "role_id": 2,
      "is_active": true
    },
    // ...more users
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4
  }
}
```

### Test RBAC - Cashier Cannot Access
```
Method:  GET
URL:     http://localhost:5001/api/users
Headers: Authorization: Bearer {cashier_token}

Expected Response (403 Forbidden):
{
  "error": "Insufficient permissions"
}
```

---

## 📍 TEST 3: CREATE NEW USER (`POST /api/users`)

**Purpose:** Manager creates new user (e.g., new cashier)  
**Auth Required:** Yes (owner or manager)  
**Validation:** username (unique), email (valid), password (6+ chars)

### Create New Supervisor
```
Method:  POST
URL:     http://localhost:5001/api/users
Headers: Authorization: Bearer {manager_token}
         Content-Type: application/json

Body:
{
  "username": "supervisor1",
  "email": "supervisor1@kasirin.com",
  "password": "supervisor123",
  "first_name": "Budi",
  "last_name": "Santoso",
  "phone": "081234567891",
  "role_id": 3
}

Expected Response (201 Created):
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 5,
    "username": "supervisor1",
    "email": "supervisor1@kasirin.com",
    "first_name": "Budi",
    "last_name": "Santoso",
    "phone": "081234567891",
    "role_id": 3,
    "created_at": "2026-03-12T..."
  }
}
```

### Test Validation - Password Too Short
```
Method:  POST
URL:     http://localhost:5001/api/users
Body:
{
  "username": "test_user",
  "email": "test@test.com",
  "password": "123",  // ❌ Only 3 chars
  "role_id": 4
}

Expected Response (400 Bad Request):
{
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

### Test RBAC - Cashier Cannot Create User
```
Method:  POST
URL:     http://localhost:5001/api/users
Headers: Authorization: Bearer {cashier_token}

Expected Response (403 Forbidden):
{
  "error": "Insufficient permissions"
}
```

---

## 📍 TEST 4: GET USER BY ID (`GET /api/users/:id`)

**Purpose:** Manager can view specific user details  
**Auth Required:** Yes (owner or manager)

### Get Manager1 Details
```
Method:  GET
URL:     http://localhost:5001/api/users/2
Headers: Authorization: Bearer {manager_token}

Expected Response (200 OK):
{
  "success": true,
  "data": {
    "id": 2,
    "username": "manager1",
    "email": "manager@kasirin.com",
    "first_name": "Manager",
    "last_name": "One",
    "phone": "081234567890",
    "role_id": 2,
    "is_active": true,
    "created_at": "2026-03-12T..."
  }
}
```

### Test Not Found
```
Method:  GET
URL:     http://localhost:5001/api/users/999  // Non-existent user
                                         
Expected Response (404 Not Found):
{
  "error": "User not found"
}
```

---

## 📍 TEST 5: UPDATE USER (`PUT /api/users/:id`)

**Purpose:** Manager can update user info  
**Auth Required:** Yes (owner or manager)

### Update Cashier Phone Number
```
Method:  PUT
URL:     http://localhost:5001/api/users/3
Headers: Authorization: Bearer {manager_token}
         Content-Type: application/json

Body:
{
  "phone": "081999999999",
  "last_name": "Updated"
}

Expected Response (200 OK):
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 3,
    "username": "kasir1",
    "email": "kasir1@kasirin.com",
    "first_name": "Kasir",
    "last_name": "Updated",  // ✅ Updated
    "phone": "081999999999",  // ✅ Updated
    "role_id": 4,
    "is_active": true
  }
}
```

### Update Password
```
Method:  PUT
URL:     http://localhost:5001/api/users/3
Body:
{
  "password": "newpassword123"
}

Expected Response (200 OK):
{
  "success": true,
  "message": "User updated successfully",
  "data": { ... }
}

// Verify: Try logging in with new password
```

---

## 📍 TEST 6: DEACTIVATE USER (`PUT /api/users/:id/deactivate`)

**Purpose:** Owner can deactivate (soft delete) user account  
**Auth Required:** Yes (owner ONLY)

### Deactivate Cashier Account
```
Method:  PUT
URL:     http://localhost:5001/api/users/3/deactivate
Headers: Authorization: Bearer {admin_token}

Expected Response (200 OK):
{
  "success": true,
  "message": "User deactivated successfully"
}

// Verify: User should not be able to login
// Verify: GET /api/users should exclude this user (is_active=false)
```

### Test RBAC - Manager Cannot Deactivate
```
Method:  PUT
URL:     http://localhost:5001/api/users/3/deactivate
Headers: Authorization: Bearer {manager_token}

Expected Response (403 Forbidden):
{
  "error": "Only owners can deactivate users"
}
```

---

## 🧪 RBAC TESTING MATRIX

| Action | Owner | Manager | Supervisor | Cashier | Warehouse |
|--------|:-----:|:-------:|:----------:|:-------:|:---------:|
| GET /me | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET all users | ✅ | ✅ | ❌ | ❌ | ❌ |
| GET user/:id | ✅ | ✅ | ❌ | ❌ | ❌ |
| POST user | ✅ | ✅ | ❌ | ❌ | ❌ |
| PUT user/:id | ✅ | ✅ | ❌ | ❌ | ❌ |
| PUT deactivate | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🔍 ERROR SCENARIOS TO TEST

### 1. Missing JWT Token
```
Method:  GET
URL:     http://localhost:5001/api/users
Headers: (No Authorization header)

Expected Response (401 Unauthorized):
{
  "error": "No token provided"
}
```

### 2. Invalid JWT Token
```
Method:  GET
URL:     http://localhost:5001/api/users
Headers: Authorization: Bearer invalid.token.here

Expected Response (401 Unauthorized):
{
  "error": "Invalid token"
}
```

### 3. Duplicate Username
```
Method:  POST
URL:     http://localhost:5001/api/users
Body:
{
  "username": "admin",  // Already exists!
  "email": "newemail@test.com",
  "password": "password123",
  "role_id": 4
}

Expected Response (409 Conflict):
{
  "error": "Username already exists"
}
```

### 4. Invalid Email
```
Method:  POST
Body:
{
  "username": "testuser",
  "email": "not-an-email",  // Invalid format
  "password": "password123",
  "role_id": 4
}

Expected Response (400 Bad Request):
{
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 📊 DAY 2 CHECKLIST

- [ ] Download & open Postman
- [ ] Create "Kasirin User API" collection
- [ ] Get JWT token for admin user
- [ ] Test GET /api/users/me ✅
- [ ] Test GET /api/users (manager) ✅
- [ ] Test GET /api/users (cashier - should fail) ✅
- [ ] Test POST /api/users (create supervisor) ✅
- [ ] Test POST /api/users (validation error) ✅
- [ ] Test GET /api/users/:id ✅
- [ ] Test PUT /api/users/:id (update phone) ✅
- [ ] Test PUT /api/users/:id (update password & verify login) ✅
- [ ] Test PUT /api/users/:id/deactivate (owner) ✅
- [ ] Test PUT /api/users/:id/deactivate (manager - should fail) ✅
- [ ] Document any errors in notes

---

## 📊 DAY 3 CHECKLIST

- [ ] Test missing JWT token scenario
- [ ] Test invalid JWT token scenario
- [ ] Test duplicate username creation
- [ ] Test invalid email validation
- [ ] Test all RBAC matrix combinations
- [ ] Verify soft delete works (deactivated users excluded from lists)
- [ ] Test password update & re-login
- [ ] Create test report with all passing tests
- [ ] Document any issues found
- [ ] Fix any RBAC/validation issues discovered

---

## 📝 TESTING TEMPLATE

Save this template for each test:

```
TEST: [Test Name]
Date: 2026-03-12
User Role: [owner/manager/cashier/warehouse]
Endpoint: [METHOD] [URL]
Status: [PASS/FAIL]
Expected Response: [Code, description]
Actual Response: [Code, actual]
Issues: [None / List any issues]
Notes: [Any notes]
```

---

## 🚀 EXPECTED OUTCOMES

After Day 2-3 Testing:
```
✅ All 6 user endpoints working
✅ RBAC enforcement verified (role-based access)
✅ Input validation working (email, password, username)
✅ JWT token authentication working
✅ Error handling returning correct codes
✅ Soft delete working (deactivated users hidden)
✅ Ready to integrate with frontend (Day 4)
```

---

## 💡 TIPS FOR TESTING

1. **Use Postman Collections:** Save each test for reuse
2. **Check Response Codes:** 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict
3. **Verify RBAC:** Same endpoint, different roles = different responses
4. **Test Edge Cases:** Empty fields, special characters, maximum lengths
5. **Keep Tokens Handy:** Save multiple user tokens for quick testing
6. **Document Issues:** Note any unexpected responses for debugging

---

## 🎯 NEXT STEP AFTER TESTING

Once all tests pass (Day 4):
- Integrate into React frontend (create users form)
- Test complete login → dashboard flow
- Prepare for Phase 1B (Inventory APIs)

---

**Ready to Test?** Start with POST to `/api/auth/login` to get your JWT token!

