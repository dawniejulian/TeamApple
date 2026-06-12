// backend/routes/inventory.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

async function resolveWarehouseId(client, warehouseId) {
  if (warehouseId) return Number(warehouseId);

  const result = await client.query(`
    INSERT INTO warehouse_locations (name, description)
    VALUES ('Gudang Utama', 'Lokasi default sistem')
    ON CONFLICT (name)
    DO UPDATE SET description = warehouse_locations.description
    RETURNING id
  `);

  return Number(result.rows[0].id);
}

// Apply auth to all inventory routes
router.use(authenticateToken);

/**
 * @route   GET /api/inventory
 * @desc    Get all inventory
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { product_id, warehouse_id } = req.query;

    let query = `
      SELECT i.*, p.name as product_name, p.sku, wl.name as warehouse_name,
             COALESCE((SELECT SUM(quantity) FROM sale_items WHERE product_id = p.id), 0)::integer AS quantity_sold
      FROM inventory i
      JOIN products p ON i.product_id = p.id AND p.is_active = true
      JOIN warehouse_locations wl ON i.warehouse_location_id = wl.id
      WHERE 1=1
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
    const parsedQty = Number(quantity);

    if (!product_id || !parsedQty || parsedQty <= 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Product ID dan quantity harus diisi'
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const targetWarehouseId = await resolveWarehouseId(client, warehouse_id);

      // Upsert inventory row so stock-in works even when inventory is initially empty.
      await client.query(`
        INSERT INTO inventory (product_id, warehouse_location_id, quantity_available, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (product_id, warehouse_location_id)
        DO UPDATE SET
          quantity_available = inventory.quantity_available + EXCLUDED.quantity_available,
          updated_at = CURRENT_TIMESTAMP
          `, [product_id, targetWarehouseId, parsedQty]);

      // Record movement
      await client.query(`
        INSERT INTO stock_movements 
        (product_id, warehouse_location_id, movement_type, quantity, reference_type, notes, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [product_id, targetWarehouseId, 'STOCK_IN', parsedQty, 'PURCHASE', notes, user_id]);

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
    const parsedQty = Number(quantity);

    if (!product_id || !parsedQty || parsedQty <= 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Product ID dan quantity harus diisi'
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const targetWarehouseId = await resolveWarehouseId(client, warehouse_id);

      // Check available stock
      const inventoryResult = await client.query(`
        SELECT quantity_available FROM inventory 
        WHERE product_id = $1 AND warehouse_location_id = $2
      `, [product_id, targetWarehouseId]);

      if (inventoryResult.rows.length === 0 || inventoryResult.rows[0].quantity_available < parsedQty) {
        throw new Error('Stok tidak cukup');
      }

      // Update inventory
      await client.query(`
        UPDATE inventory 
        SET quantity_available = quantity_available - $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $2 AND warehouse_location_id = $3
      `, [parsedQty, product_id, targetWarehouseId]);

      // Record movement
      await client.query(`
        INSERT INTO stock_movements 
        (product_id, warehouse_location_id, movement_type, quantity, reference_type, notes, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [product_id, targetWarehouseId, 'STOCK_OUT', parsedQty, type || 'SALE', notes, user_id]);

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
        COALESCE((SELECT SUM(quantity) FROM sale_items WHERE product_id = p.id), 0)::integer AS quantity_sold,
        (i.quantity_available + i.quantity_reserved + i.quantity_damaged) as total_quantity
      FROM inventory i
      JOIN products p ON i.product_id = p.id AND p.is_active = true
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

/**
 * @route   POST /api/inventory/update-status
 * @desc    Move stock status (Tersedia, Dipesan, Rusak)
 * @access  Private (MANAGER/STAFF)
 */
router.post('/update-status', async (req, res) => {
  try {
    const { product_id, warehouse_id, quantity, action, notes } = req.body;
    const user_id = req.user?.id || 1;
    const parsedQty = Number(quantity);

    if (!product_id || !parsedQty || parsedQty <= 0 || !action) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Product ID, quantity, dan action harus diisi dengan benar'
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const targetWarehouseId = await resolveWarehouseId(client, warehouse_id);

      // Get current inventory
      const invResult = await client.query(`
        SELECT quantity_available, quantity_reserved, quantity_damaged
        FROM inventory
        WHERE product_id = $1 AND warehouse_location_id = $2
      `, [product_id, targetWarehouseId]);

      if (invResult.rows.length === 0) {
        throw new Error('Inventory untuk produk ini belum dibuat. Tambahkan stok terlebih dahulu.');
      }

      const inv = invResult.rows[0];
      const available = Number(inv.quantity_available || 0);
      const reserved = Number(inv.quantity_reserved || 0);
      const damaged = Number(inv.quantity_damaged || 0);

      let updateQuery = '';
      let updateParams = [];
      let movementType = '';

      if (action === 'reserve') {
        if (available < parsedQty) {
          throw new Error(`Stok tersedia tidak cukup (Tersedia: ${available}, Dibutuhkan: ${parsedQty})`);
        }
        updateQuery = `
          UPDATE inventory
          SET quantity_available = quantity_available - $1,
              quantity_reserved = quantity_reserved + $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE product_id = $2 AND warehouse_location_id = $3
        `;
        updateParams = [parsedQty, product_id, targetWarehouseId];
        movementType = 'STOCK_RESERVE';
      } else if (action === 'damage') {
        if (available < parsedQty) {
          throw new Error(`Stok tersedia tidak cukup (Tersedia: ${available}, Dibutuhkan: ${parsedQty})`);
        }
        updateQuery = `
          UPDATE inventory
          SET quantity_available = quantity_available - $1,
              quantity_damaged = quantity_damaged + $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE product_id = $2 AND warehouse_location_id = $3
        `;
        updateParams = [parsedQty, product_id, targetWarehouseId];
        movementType = 'STOCK_DAMAGE';
      } else if (action === 'release-reserve') {
        if (reserved < parsedQty) {
          throw new Error(`Stok dipesan tidak cukup (Dipesan: ${reserved}, Dibutuhkan: ${parsedQty})`);
        }
        updateQuery = `
          UPDATE inventory
          SET quantity_reserved = quantity_reserved - $1,
              quantity_available = quantity_available + $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE product_id = $2 AND warehouse_location_id = $3
        `;
        updateParams = [parsedQty, product_id, targetWarehouseId];
        movementType = 'STOCK_RELEASE_RESERVE';
      } else if (action === 'release-damage') {
        if (damaged < parsedQty) {
          throw new Error(`Stok rusak tidak cukup (Rusak: ${damaged}, Dibutuhkan: ${parsedQty})`);
        }
        updateQuery = `
          UPDATE inventory
          SET quantity_damaged = quantity_damaged - $1,
              quantity_available = quantity_available + $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE product_id = $2 AND warehouse_location_id = $3
        `;
        updateParams = [parsedQty, product_id, targetWarehouseId];
        movementType = 'STOCK_RELEASE_DAMAGE';
      } else {
        throw new Error('Action tidak valid. Gunakan reserve, damage, release-reserve, atau release-damage');
      }

      await client.query(updateQuery, updateParams);

      // Record movement
      await client.query(`
        INSERT INTO stock_movements 
        (product_id, warehouse_location_id, movement_type, quantity, reference_type, notes, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [product_id, targetWarehouseId, movementType, parsedQty, 'MANUAL', notes || 'Update status stok manual', user_id]);

      await client.query('COMMIT');

      res.json({
        status: 'SUCCESS',
        message: 'Status stok berhasil diperbarui'
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
