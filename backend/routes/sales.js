// backend/routes/sales.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireStoreDevice } = require('../middleware/auth');
const { ensureActivityLogsTable, logActivity } = require('../utils/dbHelpers');

// Apply auth to all sales routes
router.use(authenticateToken);
// POST/PUT routes also require staff to be on a registered store device

/**
 * @route   GET /api/sales
 * @desc    Get all sales
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { channel_id, status, start_date, end_date } = req.query;
    
    let query = `
      SELECT s.*, sc.name as channel_name, u.first_name, u.last_name
      FROM sales s
      LEFT JOIN sales_channels sc ON s.sales_channel_id = sc.id
      LEFT JOIN users u ON s.sales_staff_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (channel_id) {
      query += ` AND s.sales_channel_id = $${paramCount}`;
      params.push(channel_id);
      paramCount++;
    }

    if (status) {
      query += ` AND s.transaction_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (start_date) {
      query += ` AND DATE(s.created_at) >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND DATE(s.created_at) <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    query += ` ORDER BY s.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({
      status: 'SUCCESS',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/sales/:id
 * @desc    Get sale detail
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get sale header
    const saleResult = await pool.query(`
      SELECT s.*, sc.name as channel_name
      FROM sales s
      LEFT JOIN sales_channels sc ON s.sales_channel_id = sc.id
      WHERE s.id = $1
    `, [id]);

    if (saleResult.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Transaksi tidak ditemukan'
      });
    }

    // Get sale items
    const itemsResult = await pool.query(`
      SELECT si.*, p.name as product_name, p.sku
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = $1
    `, [id]);

    const sale = saleResult.rows[0];
    sale.items = itemsResult.rows;

    res.json({
      status: 'SUCCESS',
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/sales
 * @desc    Create new sale transaction
 * @access  Private
 */
router.post('/', requireStoreDevice, async (req, res) => {
  try {
    const {
      sales_channel_id,
      customer_name,
      customer_phone,
      items,
      discount_amount,
      tax_amount,
      payment_method,
      notes
    } = req.body;

    const user_id = req.user?.id || 1;

    if (!sales_channel_id || !items || items.length === 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Channel penjualan dan item harus diisi'
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get currently active shift ID for this user
      const shiftQuery = await client.query(
        `SELECT id FROM cashier_shifts WHERE user_id = $1 AND closed_at IS NULL LIMIT 1`,
        [user_id]
      );
      const shiftId = shiftQuery.rows.length > 0 ? shiftQuery.rows[0].id : null;

      // Generate invoice number
      const invoiceResult = await client.query(`
        SELECT COUNT(*) as count FROM sales WHERE DATE(created_at) = CURRENT_DATE
      `);
      const invoiceNumber = `INV-${new Date().toISOString().split('T')[0]}-${String(invoiceResult.rows[0].count + 1).padStart(4, '0')}`;

      // Calculate totals
      let subtotal = 0;
      for (let item of items) {
        const itemSubtotal = item.quantity * item.unit_price;
        subtotal += itemSubtotal;
      }

      const totalDiscount = discount_amount || 0;
      const totalTax = tax_amount || 0;
      const totalAmount = subtotal - totalDiscount + totalTax;

      // Create sale
      const saleResult = await client.query(`
        INSERT INTO sales 
        (invoice_number, sales_channel_id, customer_name, customer_phone, subtotal, discount_amount, tax_amount, total_amount, payment_method, sales_staff_id, cashier_shift_id, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [invoiceNumber, sales_channel_id, customer_name || 'Walk-in Customer', customer_phone || null, subtotal, totalDiscount, totalTax, totalAmount, payment_method || 'CASH', user_id, shiftId, notes || null]);

      const saleId = saleResult.rows[0].id;

      // Insert items
      for (let item of items) {
        const itemSubtotal = item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);

        await client.query(`
          INSERT INTO sale_items 
          (sale_id, product_id, quantity, unit_price, discount_percent, subtotal)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [saleId, item.product_id, item.quantity, item.unit_price, item.discount_percent || 0, itemSubtotal]);

        // Reduce inventory
        await client.query(`
          UPDATE inventory 
          SET quantity_available = quantity_available - $1
          WHERE product_id = $2
        `, [item.quantity, item.product_id]);

        // Record movement
        await client.query(`
          INSERT INTO stock_movements 
          (product_id, warehouse_location_id, movement_type, quantity, reference_id, reference_type, created_by)
          VALUES ($1, 1, $2, $3, $4, $5, $6)
        `, [item.product_id, 'STOCK_OUT', item.quantity, saleId, 'SALE', user_id]);
      }

      // Update daily summary
      await client.query(`
        INSERT INTO daily_sales_summary (sale_date, total_sales_count, total_revenue, total_discount, total_items_sold)
        VALUES (CURRENT_DATE, 1, $1, $2, $3)
        ON CONFLICT (sale_date) DO UPDATE SET
          total_sales_count = daily_sales_summary.total_sales_count + 1,
          total_revenue = daily_sales_summary.total_revenue + $1,
          total_discount = daily_sales_summary.total_discount + $2,
          total_items_sold = daily_sales_summary.total_items_sold + $3
      `, [totalAmount, totalDiscount, items.length]);

      await client.query('COMMIT');

      // Log activity
      const deviceId = req.headers['x-device-id'];
      const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
      await logActivity({
        userId: user_id,
        username: req.user?.username,
        action: 'BUAT_TRANSAKSI',
        description: `Transaksi ${invoiceNumber} sebesar Rp ${totalAmount.toLocaleString('id-ID')}`,
        meta: { invoice_number: invoiceNumber, total_amount: totalAmount, items_count: items.length },
        deviceId,
        ipAddress
      });

      res.status(201).json({
        status: 'SUCCESS',
        message: 'Transaksi berhasil dibuat',
        data: {
          id: saleId,
          invoice_number: invoiceNumber,
          total_amount: totalAmount
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/sales/report/daily
 * @desc    Get daily sales report
 * @access  Private
 */
router.get('/report/daily', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT * FROM daily_sales_summary
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (start_date) {
      query += ` AND sale_date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND sale_date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    query += ` ORDER BY sale_date DESC`;

    const result = await pool.query(query, params);

    res.json({
      status: 'SUCCESS',
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/sales/simple
 * @desc    Create new sale transaction (simplified - single item)
 * @access  Private
 */
router.post('/simple', requireStoreDevice, async (req, res) => {
  try {
    const {
      product_id,
      quantity,
      price_per_unit,
      sales_channel_id,
      customer_name,
      customer_phone,
      notes,
      payment_method
    } = req.body;

    const user_id = req.user?.id || 1;

    if (!product_id || !quantity || !sales_channel_id) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Product ID, quantity, dan sales channel harus diisi'
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get currently active shift ID for this user
      const shiftQuery = await client.query(
        `SELECT id FROM cashier_shifts WHERE user_id = $1 AND closed_at IS NULL LIMIT 1`,
        [user_id]
      );
      const shiftId = shiftQuery.rows.length > 0 ? shiftQuery.rows[0].id : null;

      // Get product details
      const productResult = await client.query(`
        SELECT id, selling_price FROM products WHERE id = $1
      `, [product_id]);

      if (productResult.rows.length === 0) {
        throw new Error('Produk tidak ditemukan');
      }

      const product = productResult.rows[0];
      const unitPrice = price_per_unit || product.selling_price;

      // Generate invoice number
      const invoiceResult = await client.query(`
        SELECT COUNT(*) as count FROM sales WHERE DATE(created_at) = CURRENT_DATE
      `);
      const invoiceNumber = `INV-${new Date().toISOString().split('T')[0]}-${String(invoiceResult.rows[0].count + 1).padStart(4, '0')}`;

      // Calculate totals
      const subtotal = quantity * unitPrice;
      const totalAmount = subtotal;

      // Create sale
      const saleResult = await client.query(`
        INSERT INTO sales 
        (invoice_number, sales_channel_id, customer_name, customer_phone, subtotal, total_amount, payment_method, sales_staff_id, notes, cashier_shift_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [invoiceNumber, sales_channel_id, customer_name || 'Walk-in Customer', customer_phone || null, subtotal, totalAmount, payment_method || 'CASH', user_id, notes || null, shiftId]);

      const saleId = saleResult.rows[0].id;

      // Insert sale items
      await client.query(`
        INSERT INTO sale_items 
        (sale_id, product_id, quantity, unit_price, subtotal)
        VALUES ($1, $2, $3, $4, $5)
      `, [saleId, product_id, quantity, unitPrice, subtotal]);

      // Deduct inventory
      await client.query(`
        UPDATE inventory 
        SET quantity_available = quantity_available - $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $2
      `, [quantity, product_id]);

      // Record stock movement
      await client.query(`
        INSERT INTO stock_movements 
        (product_id, warehouse_location_id, movement_type, quantity, reference_id, reference_type, notes, created_by)
        VALUES ($1, 1, 'STOCK_OUT', $2, $3, 'SALE', $4, $5)
      `, [product_id, quantity, saleId, notes || null, user_id]);

      await client.query('COMMIT');

      // Log activity
      const deviceId = req.headers['x-device-id'];
      const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
      await logActivity({
        userId: user_id,
        username: req.user?.username,
        action: 'BUAT_TRANSAKSI',
        description: `Transaksi ${invoiceNumber} sebesar Rp ${totalAmount.toLocaleString('id-ID')}`,
        meta: { invoice_number: invoiceNumber, total_amount: totalAmount, product_id },
        deviceId,
        ipAddress
      });

      res.status(201).json({
        status: 'SUCCESS',
        message: 'Penjualan berhasil ditambahkan',
        data: {
          id: saleId,
          invoice_number: invoiceNumber,
          total_amount: totalAmount
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

module.exports = router;
