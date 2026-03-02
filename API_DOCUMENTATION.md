# KASIRIN - API DOCUMENTATION

## Overview

Kasirin API adalah RESTful API untuk sistem manajemen stok dan penjualan toko Apple. API ini dibangun dengan Express.js dan PostgreSQL.

**Base URL**: `http://localhost:5000/api`

**Content-Type**: `application/json`

## Authentication

Gunakan JWT token dalam header:

```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "status": "SUCCESS",
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "status": "ERROR",
  "message": "Error message describing what went wrong",
  "error": {}
}
```

---

## Endpoints

### 1. Authentication

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@kasirin.local",
      "role": "ADMIN"
    }
  }
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

#### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <token>
```

---

### 2. Products

#### Get All Products
```http
GET /products?category_id=1&condition_id=1&search=iPad
Authorization: Bearer <token>
```

**Query Parameters**:
- `category_id` (optional): Filter by category
- `condition_id` (optional): Filter by condition
- `search` (optional): Search by name or SKU

**Response**:
```json
{
  "status": "SUCCESS",
  "data": [
    {
      "id": 1,
      "sku": "PROD-001",
      "name": "iPad Air 5",
      "category_id": 1,
      "category_name": "iPad",
      "condition_id": 1,
      "condition_name": "Baru",
      "buy_price": 4500000,
      "selling_price": 5500000,
      "is_active": true
    }
  ],
  "count": 1
}
```

#### Get Product by ID
```http
GET /products/:id
Authorization: Bearer <token>
```

**Response**:
```json
{
  "status": "SUCCESS",
  "data": {
    "id": 1,
    "sku": "PROD-001",
    "name": "iPad Air 5",
    "category_name": "iPad",
    "condition_name": "Baru",
    "selling_price": 5500000,
    "variants": [
      {
        "id": 1,
        "variant_name": "Color",
        "variant_value": "Silver"
      },
      {
        "id": 2,
        "variant_name": "Storage",
        "variant_value": "64GB"
      }
    ]
  }
}
```

#### Create Product
```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "sku": "PROD-005",
  "name": "iPad Air 5 64GB Silver",
  "category_id": 1,
  "condition_id": 1,
  "buy_price": 4500000,
  "selling_price": 5500000,
  "description": "iPad Air 5th Generation",
  "specifications": {
    "memory": "64GB",
    "color": "Silver"
  }
}
```

#### Update Product
```http
PUT /products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "iPad Air 5 updated",
  "selling_price": 5750000
}
```

#### Delete Product
```http
DELETE /products/:id
Authorization: Bearer <token>
```

---

### 3. Inventory

#### Get All Inventory
```http
GET /inventory?product_id=1&warehouse_id=1
Authorization: Bearer <token>
```

**Response**:
```json
{
  "status": "SUCCESS",
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "iPad Air 5",
      "warehouse_location_id": 1,
      "warehouse_name": "Toko Depan",
      "quantity_available": 5,
      "quantity_reserved": 2,
      "quantity_damaged": 0
    }
  ]
}
```

#### Add Stock (Stock In)
```http
POST /inventory/stock-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": 1,
  "warehouse_id": 1,
  "quantity": 10,
  "notes": "Pembelian dari distributor"
}
```

#### Remove Stock (Stock Out)
```http
POST /inventory/stock-out
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": 1,
  "warehouse_id": 1,
  "quantity": 2,
  "type": "DAMAGE",
  "notes": "Rusak saat pengiriman"
}
```

#### Get Inventory Report
```http
GET /inventory/report
Authorization: Bearer <token>
```

---

### 4. Sales

#### Get All Sales
```http
GET /sales?channel_id=1&status=COMPLETED&start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <token>
```

**Query Parameters**:
- `channel_id` (optional): Filter by sales channel
- `status` (optional): COMPLETED, PENDING, CANCELLED
- `start_date` (optional): Start date
- `end_date` (optional): End date

**Response**:
```json
{
  "status": "SUCCESS",
  "data": [
    {
      "id": 1,
      "invoice_number": "INV-2024-01-01-0001",
      "sales_channel_id": 1,
      "channel_name": "Toko Fisik",
      "customer_name": "John Doe",
      "customer_phone": "08123456789",
      "subtotal": 5500000,
      "discount_amount": 500000,
      "tax_amount": 500000,
      "total_amount": 5500000,
      "payment_method": "CASH",
      "transaction_status": "COMPLETED",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Sale Detail
```http
GET /sales/:id
Authorization: Bearer <token>
```

#### Create Sale
```http
POST /sales
Authorization: Bearer <token>
Content-Type: application/json

{
  "sales_channel_id": 1,
  "customer_name": "Budi Santoso",
  "customer_phone": "08987654321",
  "items": [
    {
      "product_id": 1,
      "quantity": 1,
      "unit_price": 5500000,
      "discount_percent": 5
    }
  ],
  "discount_amount": 275000,
  "tax_amount": 0,
  "payment_method": "CASH"
}
```

#### Get Daily Report
```http
GET /sales/report/daily?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <token>
```

---

### 5. Dashboard

#### Get Summary
```http
GET /dashboard/summary
Authorization: Bearer <token>
```

**Response**:
```json
{
  "status": "SUCCESS",
  "data": {
    "today": {
      "total_transactions": 5,
      "total_revenue": 27500000
    },
    "this_month": {
      "total_transactions": 42,
      "total_revenue": 231500000
    },
    "total_products": {
      "total_products": 48
    },
    "low_stock": {
      "low_stock_products": 3
    }
  }
}
```

#### Get Top Products
```http
GET /dashboard/top-products
Authorization: Bearer <token>
```

#### Get Sales by Channel
```http
GET /dashboard/sales-by-channel
Authorization: Bearer <token>
```

---

### 6. Admin

#### Get All Users
```http
GET /admin/users
Authorization: Bearer <token>
```

#### Create User
```http
POST /admin/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@kasirin.local",
  "password": "password123",
  "first_name": "Ahmad",
  "last_name": "Kurniawan",
  "role_id": 3,
  "phone": "081234567890"
}
```

#### Get Activity Logs
```http
GET /admin/activity-logs?limit=100&offset=0
Authorization: Bearer <token>
```

#### Get Settings
```http
GET /admin/settings
Authorization: Bearer <token>
```

#### Update Settings
```http
PUT /admin/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "store_name": "Apple Store Yogyakarta",
  "default_currency": "IDR",
  "tax_rate": 10
}
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Validasi input gagal |
| 401 | Unauthorized | Token tidak valid atau expired |
| 403 | Forbidden | User tidak memiliki akses |
| 404 | Not Found | Resource tidak ditemukan |
| 500 | Internal Server Error | Server error |

---

## Rate Limiting

API tidak memiliki rate limiting pada development environment. Untuk production, implementasikan rate limiting untuk security.

---

## Contoh Implementasi Client

### JavaScript/Fetch
```javascript
const token = 'your_jwt_token_here';

fetch('http://localhost:5000/api/products', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

### Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

api.get('/products')
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
```

---

**Last Updated**: March 2026
