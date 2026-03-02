// backend/routes/inventory.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

/**
 * @route   GET /api/inventory
 * @desc    Get all inventory
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { product_id, warehouse_id } = req.query;

    let query = `
      SELECT i.*, p.name as product_name, p.sku, wl.name as warehouse_name
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      JOIN warehouse_locations wl ON i.warehouse_location_id = wl.id
    `;

    const params = [];
    let paramCount = 1;

    if (product_id) {
      query += ` AND i.product_id = $${paramCount}`;
      params.push(product_id);
      paramCount++;
    }

    if (warehouse_id) {
      query += ` AND i.warehouse_location_id = $${paramCount}`;
      params.push(warehouse_id);
    }

    query += ` ORDER BY p.name ASC`;

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
 * @route   POST /api/inventory/stock-in
 * @desc    Add stock (receiving goods)
 * @access  Private (MANAGER/STAFF)
 */
router.post('/stock-in', async (req, res) => {
  try {
    const { product_id, warehouse_id, quantity, notes } = req.body;
    const user_id = req.user?.id || 1; // From JWT middleware

    if (!product_id || !warehouse_id || !quantity) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Product ID, warehouse ID, dan quantity harus diisi'
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update inventory
      await client.query(`
        UPDATE inventory 
        SET quantity_available = quantity_available + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $2 AND warehouse_location_id = $3
      `, [quantity, product_id, warehouse_id]);

      // Record movement
      await client.query(`
        INSERT INTO stock_movements 
        (product_id, warehouse_location_id, movement_type, quantity, reference_type, notes, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [product_id, warehouse_id, 'STOCK_IN', quantity, 'PURCHASE', notes, user_id]);

      await client.query('COMMIT');

      res.status(201).json({
        status: 'SUCCESS',
        message: 'Stok berhasil ditambahkan'
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
 * @route   POST /api/inventory/stock-out
 * @desc    Remove stock (selling/damage)
 * @access  Private (STAFF)
 */
router.post('/stock-out', async (req, res) => {
  try {
    const { product_id, warehouse_id, quantity, type, notes } = req.body;
    const user_id = req.user?.id || 1;

    if (!product_id || !warehouse_id || !quantity) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Product ID, warehouse ID, dan quantity harus diisi'
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check available stock
      const inventoryResult = await client.query(`
        SELECT quantity_available FROM inventory 
        WHERE product_id = $1 AND warehouse_location_id = $2
      `, [product_id, warehouse_id]);

      if (inventoryResult.rows.length === 0 || inventoryResult.rows[0].quantity_available < quantity) {
        throw new Error('Stok tidak cukup');
      }

      // Update inventory
      await client.query(`
        UPDATE inventory 
        SET quantity_available = quantity_available - $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $2 AND warehouse_location_id = $3
      `, [quantity, product_id, warehouse_id]);

      // Record movement
      await client.query(`
        INSERT INTO stock_movements 
        (product_id, warehouse_location_id, movement_type, quantity, reference_type, notes, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [product_id, warehouse_id, 'STOCK_OUT', quantity, type || 'SALE', notes, user_id]);

      await client.query('COMMIT');

      res.json({
        status: 'SUCCESS',
        message: 'Stok berhasil dikurangi'
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
 * @route   GET /api/inventory/report
 * @desc    Get inventory report
 * @access  Private
 */
router.get('/report', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.sku,
        p.name,
        c.name as category,
        wl.name as warehouse,
        i.quantity_available,
        i.quantity_reserved,
        i.quantity_damaged,
        (i.quantity_available + i.quantity_reserved + i.quantity_damaged) as total_quantity
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN warehouse_locations wl ON i.warehouse_location_id = wl.id
      ORDER BY p.name, wl.name
    `);

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

module.exports = router;
