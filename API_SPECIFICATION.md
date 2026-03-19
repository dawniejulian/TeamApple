# KASIRIN - API Specification (OpenAPI 3.0)

## 📡 BASE URL
```
http://localhost:5001/api
```

---

## 🔐 Authentication
Semua endpoint (kecuali `/auth/login`) memerlukan:
```
Authorization: Bearer {JWT_TOKEN}
```

---

## 📋 PHASE 1 APIs (Priority Implementation)

### 1. SALES (Transaksi)

#### Create Sale
```
POST /sales
Content-Type: application/json

{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "discount_percent": 0
    }
  ],
  "discount_amount": 0,
  "tax_percent": 10,
  "payment_method": "CASH",
  "paid_amount": 20000000,
  "customer_id": null (optional)
}

Response:
{
  "status": "success",
  "data": {
    "id": 1,
    "invoice_number": "INV-2026-03-10-0001",
    "total_amount": 20000000,
    "change_amount": 0,
    "payment_method": "CASH",
    "items": [...]
  }
}
```

#### Get Sale Detail
```
GET /sales/{id}

Response:
{
  "status": "success",
  "data": {
    "id": 1,
    "sales_number": "INV-2026-03-10-0001",
    "total_amount": 20000000,
    "items": [
      {
        "product_id": 1,
        "product_name": "iPhone 14 Pro",
        "quantity": 2,
        "price": 10000000,
        "subtotal": 20000000
      }
    ],
    "created_at": "2026-03-10T10:30:00Z"
  }
}
```

#### List Sales (with pagination)
```
GET /sales?page=1&limit=20&start_date=2026-03-01&end_date=2026-03-31

Response:
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "invoice_number": "INV-2026-03-10-0001",
      "total_amount": 20000000,
      "created_at": "2026-03-10T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

#### Print/Email Receipt
```
POST /sales/{id}/receipt/print
POST /sales/{id}/receipt/email
POST /sales/{id}/receipt/whatsapp

{
  "email": "customer@email.com",
  "phone": "+62812345678"
}

Response:
{
  "status": "success",
  "message": "Struk berhasil dikirim"
}
```

---

### 2. INVENTORY (Stok)

#### Get Stock Level
```
GET /inventory?warehouse_id=1&product_id=1

Response:
{
  "status": "success",
  "data": [
    {
      "product_id": 1,
      "product_name": "iPhone 14 Pro",
      "warehouse_id": 1,
      "quantity_on_hand": 10,
      "quantity_reserved": 2,
      "minimum_quantity": 5,
      "status": "OK" | "LOW" | "OUT_OF_STOCK"
    }
  ]
}
```

#### Stock In (Receive Goods)
```
POST /inventory/stock-in
Content-Type: application/json

{
  "warehouse_id": 1,
  "reference_type": "purchase_order",
  "reference_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 10,
      "notes": "Kondisi barang baik"
    }
  ]
}

Response:
{
  "status": "success",
  "data": {
    "id": 1,
    "movement_number": "STK-IN-2026-0001",
    "total_items": 10
  }
}
```

#### Stock Out (Remove/Return)
```
POST /inventory/stock-out

{
  "warehouse_id": 1,
  "movement_type": "return" | "damage" | "adjustment",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "notes": "Barang rusak"
    }
  ]
}
```

#### Low Stock Alert
```
GET /inventory/alerts

Response:
{
  "status": "success",
  "data": {
    "low_stock": [
      {
        "product_id": 1,
        "product_name": "iPhone 14 Pro",
        "current": 3,
        "minimum": 5,
        "warehouse": "Gudang Utama"
      }
    ],
    "out_of_stock": [...]
  }
}
```

---

### 3. PRODUCTS (Manajemen Produk)

#### Create Product
```
POST /products
Content-Type: multipart/form-data

{
  "name": "iPhone 14 Pro",
  "sku": "IP14PRO128GB",
  "barcode": "8901234567890",
  "category_id": 1,
  "purchase_price": 8000000,
  "selling_price": 10000000,
  "unit": "pcs",
  "description": "...",
  "photo": [file]
}
```

#### Update Product
```
PUT /products/{id}

{
  "name": "iPhone 14 Pro Max",
  "selling_price": 11000000,
  "photo": [file] (optional)
}
```

#### Search by Barcode
```
GET /products/barcode/{barcode}

Response:
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "iPhone 14 Pro",
    "selling_price": 10000000,
    "stock": 10
  }
}
```

#### Get All Products (with filters)
```
GET /products?category_id=1&search=iPhone&page=1&limit=20

Response:
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "iPhone 14 Pro",
      "sku": "IP14PRO128GB",
      "category": "Smartphone",
      "selling_price": 10000000,
      "photo_url": "https://..."
    }
  ],
  "pagination": {...}
}
```

---

### 4. CASHIER SHIFT

#### Open Shift
```
POST /shifts/open

{
  "opening_balance": 5000000,
  "notes": "Shift pagi"
}

Response:
{
  "status": "success",
  "data": {
    "shift_id": 1,
    "cashier": "Admin",
    "shift_start": "2026-03-10T08:00:00Z",
    "opening_balance": 5000000
  }
}
```

#### Close Shift
```
PUT /shifts/{id}/close

{
  "closing_balance": 25000000,
  "notes": "Tutup shift tanpa selisih"
}

Response:
{
  "status": "success",
  "data": {
    "shift_id": 1,
    "total_transactions": 15,
    "expected_amount": 20000000,
    "closing_balance": 25000000,
    "difference": 5000000,
    "status": "CLOSED"
  }
}
```

#### Get Shift Summary
```
GET /shifts/{id}

Response:
{
  "status": "success",
  "data": {
    "shift_id": 1,
    "cashier": "Admin",
    "date": "2026-03-10",
    "shift_start": "08:00:00",
    "shift_end": "17:00:00",
    "opening_balance": 5000000,
    "closing_balance": 25000000,
    "total_sales": 15,
    "total_revenue": 150000000,
    "difference": 5000000,
    "transactions": [...]
  }
}
```

---

### 5. AUTH

#### Login
```
POST /auth/login

{
  "username": "admin",
  "password": "password123"
}

Response:
{
  "status": "success",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@kasirin.com",
      "role": "owner",
      "name": "Admin Kasirin"
    }
  }
}
```

#### Logout
```
POST /auth/logout
Authorization: Bearer {token}

Response:
{
  "status": "success",
  "message": "Logged out successfully"
}
```

#### Refresh Token
```
POST /auth/refresh
Authorization: Bearer {token}

Response:
{
  "status": "success",
  "data": {
    "token": "eyJhbGc..."
  }
}
```

---

### 6. USERS (User Management) ✨ NEW

#### Create User
```
POST /users
Authorization: Bearer {token} (admin only)

{
  "username": "kasir1",
  "email": "kasir1@kasirin.com",
  "password": "securepass123",
  "name": "Kasir Pertama",
  "role": "cashier" | "supervisor" | "manager" | "owner",
  "phone": "081234567890"
}
```

#### List Users
```
GET /users?page=1&limit=20&role=cashier

Response:
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "username": "admin",
      "name": "Admin Kasirin",
      "email": "admin@kasirin.com",
      "role": "owner",
      "is_active": true,
      "last_login": "2026-03-10T10:30:00Z"
    }
  ],
  "pagination": {...}
}
```

#### Update User
```
PUT /users/{id}

{
  "name": "Admin Baru",
  "email": "admin.baru@kasirin.com",
  "role": "manager"
}
```

#### Deactivate User
```
PUT /users/{id}/deactivate

Response:
{
  "status": "success",
  "message": "User deactivated"
}
```

---

## 📊 PHASE 2-3 APIs (Reports & Analytics)

### Reports

#### Sales Report
```
GET /reports/sales?start_date=2026-03-01&end_date=2026-03-31&group_by=daily|weekly|monthly

Response:
{
  "status": "success",
  "data": {
    "period": "2026-03",
    "total_transactions": 150,
    "total_revenue": 1500000000,
    "average_transaction": 10000000,
    "by_date": [
      {
        "date": "2026-03-10",
        "transactions": 15,
        "revenue": 150000000
      }
    ],
    "by_category": [
      {
        "category": "Smartphone",
        "revenue": 1000000000,
        "percentage": 66.67
      }
    ]
  }
}
```

#### Top Products Report
```
GET /reports/top-products?period=month&limit=10

Response:
{
  "status": "success",
  "data": [
    {
      "rank": 1,
      "product_name": "iPhone 14 Pro",
      "total_sold": 25,
      "revenue": 250000000,
      "percentage": 25
    }
  ]
}
```

#### Cashier Performance
```
GET /reports/cashier-performance?start_date=2026-03-01&end_date=2026-03-31

Response:
{
  "status": "success",
  "data": [
    {
      "cashier": "Admin",
      "total_transactions": 50,
      "total_revenue": 500000000,
      "average_per_transaction": 10000000,
      "discrepancies": 0
    }
  ]
}
```

---

## 🔄 Error Response Format

```json
{
  "status": "error",
  "code": "INVALID_REQUEST",
  "message": "Field validation failed",
  "errors": {
    "product_id": ["Product ID is required"],
    "quantity": ["Quantity must be greater than 0"]
  }
}
```

---

## ✅ Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## 🔗 PAGINATION STANDARD

All list endpoints support:
```
GET /endpoint?page=1&limit=20&sort=created_at&order=DESC

Response includes:
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

---

Dokumentasi lengkap akan diupdate seiring implementasi! 📝
