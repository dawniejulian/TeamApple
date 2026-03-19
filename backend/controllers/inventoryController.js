// backend/controllers/inventoryController.js
const pool = require('../config/database');

class InventoryController {
  /**
   * Get all stock levels with product details
   */
  static async getStockLevels(req, res) {
    try {
      const { warehouse_id = 1, product_id, outlet_id } = req.query;
      let query = `
        SELECT 
          sl.id, sl.product_id, sl.warehouse_id, sl.on_hand, 
          sl.reserved, sl.minimum, sl.reorder_point,
          p.sku, p.name, p.cost_price, p.selling_price, p.barcode,
          w.name as warehouse_name
        FROM stock_levels sl
        JOIN products p ON sl.product_id = p.id
        JOIN warehouses w ON sl.warehouse_id = w.id
        WHERE sl.warehouse_id = $1
      `;
      
      const params = [warehouse_id];
      if (product_id) {
        query += ` AND sl.product_id = $${params.length + 1}`;
        params.push(product_id);
      }
      
      const result = await pool.query(query + ' ORDER BY p.name', params);
      
      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('Stock levels error:', error);
      res.status(500).json({ error: 'Failed to fetch stock levels' });
    }
  }

  /**
   * Stock In (receiving stock)
   */
  static async stockIn(req, res) {
    try {
      const { product_id, quantity, warehouse_id = 1, reference_type, reference_id, notes } = req.body;
      
      if (!product_id || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid product ID or quantity' });
      }

      // Update stock
      const updateResult = await pool.query(
        `UPDATE stock_levels 
         SET on_hand = on_hand + $1, updated_at = NOW()
         WHERE product_id = $2 AND warehouse_id = $3
         RETURNING *`,
        [quantity, product_id, warehouse_id]
      );

      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: 'Stock level not found' });
      }

      // Log movement
      await pool.query(
        `INSERT INTO stock_movements 
         (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id, user_id, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [product_id, warehouse_id, 'IN', quantity, reference_type || 'PO', reference_id || NULL, req.user?.id || 1, notes]
      );

      res.json({
        success: true,
        message: `Added ${quantity} units to stock`,
        data: updateResult.rows[0]
      });
    } catch (error) {
      console.error('Stock in error:', error);
      res.status(500).json({ error: 'Failed to update stock' });
    }
  }

  /**
   * Stock Out (reducing stock for sales/adjustments)
   */
  static async stockOut(req, res) {
    try {
      const { product_id, quantity, warehouse_id = 1, reason = 'SALE', reference_id, notes } = req.body;
      
      if (!product_id || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid product ID or quantity' });
      }

      // Check if sufficient stock
      const checkResult = await pool.query(
        `SELECT on_hand FROM stock_levels 
         WHERE product_id = $1 AND warehouse_id = $2`,
        [product_id, warehouse_id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Stock not found' });
      }

      const { on_hand } = checkResult.rows[0];
      if (on_hand < quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock. Available: ${on_hand}` 
        });
      }

      // Update stock
      const updateResult = await pool.query(
        `UPDATE stock_levels 
         SET on_hand = on_hand - $1, updated_at = NOW()
         WHERE product_id = $2 AND warehouse_id = $3
         RETURNING *`,
        [quantity, product_id, warehouse_id]
      );

      // Log movement
      await pool.query(
        `INSERT INTO stock_movements 
         (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id, user_id, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [product_id, warehouse_id, 'OUT', quantity, reason, reference_id || NULL, req.user?.id || 1, notes]
      );

      res.json({
        success: true,
        message: `Removed ${quantity} units from stock`,
        data: updateResult.rows[0]
      });
    } catch (error) {
      console.error('Stock out error:', error);
      res.status(500).json({ error: 'Failed to update stock' });
    }
  }

  /**
   * Get stock movements history
   */
  static async getStockMovements(req, res) {
    try {
      const { product_id, days = 30 } = req.query;
      let query = `
        SELECT 
          sm.*, p.name as product_name, p.sku,
          u.username as user_name
        FROM stock_movements sm
        LEFT JOIN products p ON sm.product_id = p.id
        LEFT JOIN users u ON sm.user_id = u.id
        WHERE sm.created_at >= NOW() - INTERVAL '${days} days'
      `;
      
      const params = [];
      if (product_id) {
        query += ` AND sm.product_id = $1`;
        params.push(product_id);
      }
      
      const result = await pool.query(query + ' ORDER BY sm.created_at DESC LIMIT 500', params);
      
      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('Stock movements error:', error);
      res.status(500).json({ error: 'Failed to fetch movements' });
    }
  }

  /**
   * Check low stock items
   */
  static async getLowStock(req, res) {
    try {
      const { warehouse_id = 1 } = req.query;
      
      const result = await pool.query(
        `SELECT 
          sl.*, p.name, p.sku, p.cost_price, p.selling_price,
          w.name as warehouse_name
        FROM stock_levels sl
        JOIN products p ON sl.product_id = p.id
        JOIN warehouses w ON sl.warehouse_id = w.id
        WHERE sl.warehouse_id = $1 AND (sl.on_hand < sl.minimum OR sl.on_hand < sl.reorder_point)
        ORDER BY sl.on_hand ASC`,
        [warehouse_id]
      );

      res.json({
        success: true,
        data: result.rows,
        lowStockCount: result.rows.length
      });
    } catch (error) {
      console.error('Low stock check error:', error);
      res.status(500).json({ error: 'Failed to check low stock' });
    }
  }

  /**
   * Adjust stock (for inventory corrections)
   */
  static async adjustStock(req, res) {
    try {
      const { product_id, adjustment, warehouse_id = 1, reason, notes } = req.body;
      
      if (!product_id || adjustment === undefined) {
        return res.status(400).json({ error: 'Product ID and adjustment value required' });
      }

      const updateResult = await pool.query(
        `UPDATE stock_levels 
         SET on_hand = on_hand + $1, updated_at = NOW()
         WHERE product_id = $2 AND warehouse_id = $3
         RETURNING *`,
        [adjustment, product_id, warehouse_id]
      );

      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: 'Stock not found' });
      }

      // Log adjustment
      const movementType = adjustment > 0 ? 'IN' : 'OUT';
      await pool.query(
        `INSERT INTO stock_movements 
         (product_id, warehouse_id, movement_type, quantity, reference_type, user_id, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [product_id, warehouse_id, movementType, Math.abs(adjustment), reason || 'ADJUSTMENT', req.user?.id || 1, notes]
      );

      res.json({
        success: true,
        message: `Stock adjusted by ${adjustment}`,
        data: updateResult.rows[0]
      });
    } catch (error) {
      console.error('Stock adjustment error:', error);
      res.status(500).json({ error: 'Failed to adjust stock' });
    }
  }
}

module.exports = InventoryController;
