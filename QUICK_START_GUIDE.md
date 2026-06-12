# 📚 KASIRIN QUICK REFERENCE GUIDE

**Version:** 1.1  
**Status:** Production Ready ✅  
**Last Updated:** April 21, 2026

---

## 🎯 WHAT YOU HAVE

A complete, production-grade **Point-of-Sale (POS), Inventory Management, and Store Information Website System** for your Apple store.

- ✅ Full POS system with sales tracking
- ✅ Real-time inventory management
- ✅ Cashier shift reconciliation
- ✅ Supplier purchase order system
- ✅ Business intelligence & reports
- ✅ Public website for store and product information
- ✅ Role-based user access
- ✅ Automated audit logging
- ✅ Mobile-responsive UI

### System Scope Clarification
- POS module is used for internal cashier transactions (staff only)
- Dashboard module is used for store operations and management
- Website module is used as public information media (not for customer checkout)

---

## 🚀 QUICK START

### Access the System
```
Frontend: http://localhost:3001
Backend API: http://localhost:5001/api
Database: localhost:5432 (postgres user)
```

### Login Credentials
```
Admin:       admin / admin123
Manager:     manager1 / admin123
Cashier:     kasir1 / admin123
Warehouse:   warehouse1 / admin123
```

### Start/Stop System
```bash
# Start
cd /Users/mac/Document/kasirin
docker-compose up -d

# Stop
docker-compose down

# Rebuild
docker-compose up -d --build
```

---

## 💡 KEY FEATURES AT A GLANCE

### 1️⃣ **POS (Point of Sale)**
- Scan or search products
- Add to cart with quantities
- Apply discounts
- Process payments (Cash/Card/QRIS)
- Print receipts
- Track daily sales

**Who uses it:** Cashiers, Managers  
**Access:** Dashboard → POS / Sales

### 2️⃣ **Inventory Management**
- View real-time stock levels
- Stock In (receive products)
- Stock Out (sales/damage)
- Adjust inventory
- Track stock movements
- Low stock alerts

**Who uses it:** Warehouse staff, Managers  
**Access:** Dashboard → Inventory

### 3️⃣ **Cashier Shifts**
- Open shift with float amount
- Track all transactions during shift
- Close shift with reconciliation
- Auto-balance cash drawer
- View performance metrics
- Daily shift reports

**Who uses it:** Cashiers, Managers  
**Access:** Dashboard → Shifts

### 4️⃣ **Purchase Orders**
- Create orders from suppliers
- Track order status
- Receive items (auto-updates stock)
- View low stock recommendations
- Manage suppliers

**Who uses it:** Managers, Warehouse staff  
**Access:** Dashboard → PO / Procurement

### 5️⃣ **Reports & Analytics**
- Daily sales summary
- Period sales analysis
- Product performance
- Cashier metrics
- Payment method breakdown
- Inventory valuation
- KPI dashboard

**Who uses it:** Managers, Owner  
**Access:** Dashboard → Reports

### 6️⃣ **User Management**
- Create new users
- Assign roles (5 types)
- Manage permissions
- View audit logs
- Deactivate users

**Who uses it:** Owner, Manager  
**Access:** Settings → Users

### 7️⃣ **Website Informasi Toko**
- Menampilkan profil toko
- Menampilkan informasi produk dan kategori
- Menampilkan kontak, alamat, dan jam operasional
- Menyampaikan promosi/informasi terbaru
- Menjadi media informasi publik, bukan kanal transaksi langsung

**Who uses it:** Customer (public), Marketing/Admin (content updates)
**Access:** Public website route (for example `/teamapple`)

---

## 🔐 USER ROLES & PERMISSIONS

### 👑 **OWNER** (Full Admin)
✅ All features  
✅ Create/manage users  
✅ Approve POs  
✅ View all reports  
✅ System settings  
✅ Deactivate users  

### 💼 **MANAGER**
✅ User management (except deactivate owner)  
✅ PO approval  
✅ Inventory oversight  
✅ Shift reconciliation  
✅ View all reports  
❌ System settings  

### 👁️ **SUPERVISOR**
✅ View reports  
✅ Monitor operations  
❌ Modify data  
❌ User management  

### 🛒 **CASHIER**
✅ POS operations  
✅ Stock out (sales)  
✅ Open/close own shift  
✅ View own profile  
❌ Other users' data  
❌ Inventory management  

### 📦 **WAREHOUSE**
✅ Stock in/out  
✅ Inventory adjustment  
✅ View levels  
✅ PO receiving  
❌ Sales operations  
❌ Other modules  

---

## 🔧 COMMON TASKS

### Task: Start a Shift
```
1. Login as Cashier
2. Dashboard → Shifts → "Open Shift"
3. Enter float amount (Rp)
4. Click "Open"
→ Shift is ready for transactions
```

### Task: Process a Sale
```
1. POS page → Search "iPhone 14"
2. Click product → Enter quantity
3. Add to cart → Repeat for more items
4. Checkout → Select payment method
5. Process → Print receipt
→ Sale recorded, stock updated
```

### Task: Receive Stock (PO)
```
1. Dashboard → Purchase Orders
2. Find PO → Click "Receive Items"
3. Enter received quantity per item
4. Click "Receive"
→ Stock updated automatically
```

### Task: Close Shift
```
1. POS → "Close Shift"
2. System shows expected amount
3. Enter actual cash count
4. Click "Reconcile"
→ Auto-checks for discrepancies
```

### Task: Check Low Stock
```
1. Dashboard → Inventory
2. View "Low Stock Items"
3. Click "Create PO" (auto-suggest)
→ Quantities pre-filled
```

### Task: View Daily Sales
```
1. Dashboard → Reports
2. Select "Daily Sales"
3. Pick date
→ See total, by product, by payment method
```

---

## 📊 THE 5 KEY DASHBOARDS

| Dashboard | Shows | For Whom |
|-----------|-------|----------|
| **Sales** | Daily totals, products sold, payments | Managers, Owner |
| **Inventory** | Stock levels, movements, low stock | Warehouse, Manager |
| **Shifts** | Cashier performance, times, earnings | Manager, Owner |
| **Suppliers** | POs, status, deliveries | Manager, Owner |
| **Reports** | All analytics & KPIs | Manager, Owner |

---

## 🔧 MAINTENANCE CHECKLIST

### Daily
```
□ Check system health: curl http://localhost:5001/health
□ Review audit logs for unusual activity
□ Check low stock alerts
□ Verify shift reconciliation
```

### Weekly
```
□ Review all reports
□ Check for errors in logs
□ Verify database backup completed
□ Test login as each role
```

### Monthly
```
□ Database cleanup/optimization
□ System performance review
□ Security audit
□ Backup verification test
```

---

## ⚠️ TROUBLESHOOTING

### "System Not Responding"
```bash
# Check containers
docker ps

# Restart if needed
docker-compose restart

# Check logs
docker logs kasirin_backend
```

### "Login Fails"
```
1. Check username/password
2. Check user is not deactivated
3. Restart backend: docker-compose restart backend
4. Check database: psql -U postgres -d kasirin_db
```

### "Stock Numbers Wrong"
```
1. Check stock_movements table for errors
2. Run inventory audit
3. Adjust inventory if needed via UI
4. Check audit_logs for who made changes
```

### "Sale Won't Process"
```
1. Check stock levels (Stock Out error?)
2. Check payment method selected
3. Verify user permissions
4. Check backend logs
```

---

## 📈 KEY METRICS TO MONITOR

### Daily
- Total sales (Rp)
- Number of transactions
- Payment methods used
- Shift discrepancies
- Low stock alerts

### Weekly
- Sales trend
- Top products
- Cashier performance
- Inventory turnover
- PO delivery status

### Monthly
- Revenue
- Customer count (if available)
- Profit (cost vs selling price)
- Staff productivity
- Inventory accuracy

---

## 🎓 BEST PRACTICES

### For Cashiers
✅ Always open shift before starting  
✅ Close shift at end of day  
✅ Record all discounts  
✅ Use correct payment method  
✅ Keep receipt printer working  

### For Warehouse
✅ Update stock immediately  
✅ Log all movements  
✅ Check quality before accepting  
✅ Alert manager of low stock  
✅ Verify supplier invoices  

### For Managers
✅ Review reports daily  
✅ Approve POs timely  
✅ Monitor discrepancies  
✅ Manage staff access  
✅ Keep audit logs clean  

### For Owner
✅ Extract financial reports monthly  
✅ Review KPIs quarterly  
✅ Plan inventory based on sales  
✅ Approve promotion discounts  
✅ Monitor staff and performance  

---

## 📱 QUICK API REFERENCE

### Get JWT Token
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Check Today's Sales
```bash
curl http://localhost:5001/api/reports/sales/daily?date=2026-03-12 \
  -H "Authorization: Bearer TOKEN"
```

### Get Stock Levels
```bash
curl http://localhost:5001/api/inventory/levels \
  -H "Authorization: Bearer TOKEN"
```

### Open Shift
```bash
curl -X POST http://localhost:5001/api/shifts/open \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id":4,"outlet_id":1,"float_amount":100000}'
```

---

## 📞 SUPPORT & HELP

### System Not Working?
1. Check Docker containers: `docker ps`
2. Check logs: `docker logs kasirin_backend`
3. Restart system: `docker-compose restart`
4. Last resort: Full rebuild: `docker-compose up -d --build`

### Database Backup/Restore
```bash
# Backup
docker exec kasirin_db pg_dump -U postgres kasirin_db > backup_DATE.sql

# Restore
docker exec -i kasirin_db psql -U postgres kasirin_db < backup_DATE.sql
```

### Add New User
```
1. Login as Owner or Manager
2. Settings → Users → "Add User"
3. Fill form (username, email, password, role)
4. Click "Create"
→ User can now login
```

---

## 🎯 SUCCESS INDICATORS

✅ System is successful when:
- Daily POS sales are recorded accurately
- Inventory counts match database
- Shift reconciliation is automatic
- Public website information is accessible and up to date
- Staff login with proper permissions
- Reports available for analysis
- No lost data (backups working)
- Response time < 500ms
- Zero downtime (containers running)

---

## 📋 DOCUMENT REFERENCE

| Document | Purpose |
|----------|---------|
| `IMPLEMENTATION_COMPLETE.md` | Full feature list |
| `DEPLOYMENT_COMPLETE.md` | Technical details |
| `API_SPECIFICATION.md` | API docs |
| `KASIRIN_ROADMAP.md` | Business roadmap |
| `PHASE1_SPRINT_PLAN.md` | Development plan |

---

## 🚀 YOU'RE ALL SET!

Everything is ready. The system is:
- ✅ Deployed
- ✅ Tested
- ✅ Production-ready
- ✅ Fully documented
- ✅ Backed up
- ✅ Monitored

**Start using it today!** 🎉

---

**Questions?** Check the documentation or restart the system.

**System Stable?** Keep it running! ✅

**Ready for More?** We can add more features anytime.

---

*Kasirin POS & Store Information System - Making Your Store Smart & Connected*

Good luck! 🚀

