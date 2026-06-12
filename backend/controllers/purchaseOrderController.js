// backend/controllers/purchaseOrderController.js
const pool = require('../config/database');

class PurchaseOrderController {
  /**
   * Create new purchase order
   */
  static async createPO(req, res) {
    try {
      const { supplier_name, supplier_email, items, notes } = req.body;
      
      if (!supplier_name || !items || items.length === 0) {
        return res.status(400).json({ error: 'Supplier name and items required' });
      }

      // Create PO header
      const poResult = await pool.query(
        `INSERT INTO purchase_orders 
         (supplier_name, supplier_email, status, created_by, notes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, supplier_name, supplier_email, status, created_by`,
        [supplier_name, supplier_email || null, 'DRAFT', req.user?.id || 1, notes]
      );

      const poId = poResult.rows[0].id;
      let totalAmount = 0;

      // Add PO items
      for (const item of items) {
        const itemResult = await pool.query(
          `INSERT INTO purchase_order_items 
           (purchase_order_id, product_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4)
           RETURNING id, quantity, unit_price`,
          [poId, item.product_id, item.quantity, item.unit_price]
        );

        totalAmount += Number(itemResult.rows[0].quantity) * Number(itemResult.rows[0].unit_price);
      }

      // Update PO with total
      const updatedResult = await pool.query(
        `UPDATE purchase_orders 
         SET total_amount = $1 
         WHERE id = $2
         RETURNING *`,
        [totalAmount, poId]
      );

      res.status(201).json({
        success: true,
        message: 'Purchase order created',
        data: updatedResult.rows[0],
        itemCount: items.length
      });
    } catch (error) {
      console.error('Create PO error:', error);
      res.status(500).json({ error: 'Failed to create PO' });
    }
  }

  /**
   * Get all POs with filters
   */
  static async listPOs(req, res) {
    try {
      const { supplier_name, status = 'ACTIVE' } = req.query;
      
      let query = `
        SELECT 
          po.*,
          COUNT(DISTINCT poi.id) as item_count
        FROM purchase_orders po
        LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
        WHERE 1=1
      `;

      const params = [];

      if (status === 'ACTIVE') {
        query += ` AND po.status IN ($${params.length + 1}, $${params.length + 2}, $${params.length + 3}, $${params.length + 4}, $${params.length + 5})`;
        params.push('DRAFT', 'APPROVED', 'SENT', 'RECEIVED', 'PARTIAL');
      } else if (status !== 'ALL') {
        query += ` AND po.status = $${params.length + 1}`;
        params.push(status);
      }

      if (supplier_name) {
        query += ` AND po.supplier_name ILIKE $${params.length + 1}`;
        params.push(`%${supplier_name}%`);
      }

      query += ' GROUP BY po.id ORDER BY po.created_at DESC';

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('List POs error:', error);
      res.status(500).json({ error: 'Failed to fetch POs' });
    }
  }

  /**
   * Get specific PO with items
   */
  static async getPODetail(req, res) {
    try {
      const { po_id } = req.params;

      const poResult = await pool.query(
        `SELECT 
          po.*,
          u.username as created_by_user
         FROM purchase_orders po
         LEFT JOIN users u ON po.created_by = u.id
         WHERE po.id = $1`,
        [po_id]
      );

      if (poResult.rows.length === 0) {
        return res.status(404).json({ error: 'PO not found' });
      }

      // Get items
      const itemsResult = await pool.query(
        `SELECT 
          poi.*, p.name as product_name, p.sku,
          (poi.quantity * poi.unit_price) as line_total,
          poi.quantity_received
         FROM purchase_order_items poi
         JOIN products p ON poi.product_id = p.id
         WHERE poi.purchase_order_id = $1`,
        [po_id]
      );

      res.json({
        success: true,
        data: {
          po: poResult.rows[0],
          items: itemsResult.rows,
          itemCount: itemsResult.rows.length
        }
      });
    } catch (error) {
      console.error('Get PO detail error:', error);
      res.status(500).json({ error: 'Failed to fetch PO' });
    }
  }

  static async updatePOStatus(req, res) {
    try {
      const { po_id } = req.params;
      const { status, notes } = req.body;

      const validStatuses = ['DRAFT', 'APPROVED', 'SENT', 'RECEIVED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be: ${validStatuses.join(', ')}` });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // 1. Get the current PO header to check its previous status
        const poQuery = await client.query(
          `SELECT status FROM purchase_orders WHERE id = $1 FOR UPDATE`,
          [po_id]
        );

        if (poQuery.rows.length === 0) {
          throw new Error('PO tidak ditemukan');
        }

        const oldStatus = poQuery.rows[0].status;

        // If status hasn't changed, we can just commit and return
        if (oldStatus === status) {
          await client.query('COMMIT');
          return res.json({
            success: true,
            message: `PO status sudah bernilai ${status}`,
            data: { id: po_id, status }
          });
        }

        // Get items for this PO
        const itemsQuery = await client.query(
          `SELECT product_id, quantity FROM purchase_order_items WHERE purchase_order_id = $1`,
          [po_id]
        );
        const poItems = itemsQuery.rows;

        // Default warehouse ID is 1
        const targetWarehouseId = 1; 

        // Let's resolve warehouse location or ensure warehouse Gudang Utama exist
        const whResult = await client.query(`
          INSERT INTO warehouse_locations (name, description)
          VALUES ('Gudang Utama', 'Lokasi default sistem')
          ON CONFLICT (name)
          DO UPDATE SET description = warehouse_locations.description
          RETURNING id
        `);
        const warehouseId = whResult.rows[0].id;

        // Handle inventory logic based on status changes
        if (status === 'SENT') {
          // Transitioning TO SENT (In Transit / Sedang Dalam Perjalanan): Increment quantity_reserved (Stok Dipesan)
          for (const item of poItems) {
            await client.query(`
              INSERT INTO inventory (product_id, warehouse_location_id, quantity_available, quantity_reserved, quantity_damaged, updated_at)
              VALUES ($1, $2, 0, $3, 0, CURRENT_TIMESTAMP)
              ON CONFLICT (product_id, warehouse_location_id)
              DO UPDATE SET
                quantity_reserved = inventory.quantity_reserved + EXCLUDED.quantity_reserved,
                updated_at = CURRENT_TIMESTAMP
            `, [item.product_id, warehouseId, item.quantity]);
          }
        } 
        else if (status === 'RECEIVED') {
          // Transitioning TO RECEIVED (Telah Diterima):
          for (const item of poItems) {
            if (oldStatus === 'SENT') {
              // Decrement quantity_reserved (Stok Dipesan) and increment quantity_available (Stok Tersedia)
              await client.query(`
                INSERT INTO inventory (product_id, warehouse_location_id, quantity_available, quantity_reserved, quantity_damaged, updated_at)
                VALUES ($1, $2, $3, 0, 0, CURRENT_TIMESTAMP)
                ON CONFLICT (product_id, warehouse_location_id)
                DO UPDATE SET
                  quantity_available = inventory.quantity_available + EXCLUDED.quantity_available,
                  quantity_reserved = GREATEST(0, inventory.quantity_reserved - EXCLUDED.quantity_available),
                  updated_at = CURRENT_TIMESTAMP
              `, [item.product_id, warehouseId, item.quantity]);
            } else {
              // Just increment quantity_available directly (was draft/approved, didn't reserve)
              await client.query(`
                INSERT INTO inventory (product_id, warehouse_location_id, quantity_available, quantity_reserved, quantity_damaged, updated_at)
                VALUES ($1, $2, $3, 0, 0, CURRENT_TIMESTAMP)
                ON CONFLICT (product_id, warehouse_location_id)
                DO UPDATE SET
                  quantity_available = inventory.quantity_available + EXCLUDED.quantity_available,
                  updated_at = CURRENT_TIMESTAMP
              `, [item.product_id, warehouseId, item.quantity]);
            }

            // Also record movement
            await client.query(`
              INSERT INTO stock_movements 
              (product_id, warehouse_location_id, movement_type, quantity, reference_id, reference_type, notes, created_by)
              VALUES ($1, $2, 'STOCK_IN', $3, $4, 'PURCHASE', $5, $6)
            `, [item.product_id, warehouseId, item.quantity, po_id, notes || 'Diterima dari Purchase Order', req.user?.id || 1]);
            
            // Mark all items as fully received since status is RECEIVED
            await client.query(`
              UPDATE purchase_order_items
              SET quantity_received = quantity
              WHERE purchase_order_id = $1 AND product_id = $2
            `, [po_id, item.product_id]);
          }
        } 
        else if (status === 'CANCELLED' || status === 'DRAFT' || status === 'APPROVED') {
          // If moving AWAY from SENT, decrement quantity_reserved (Stok Dipesan)
          if (oldStatus === 'SENT') {
            for (const item of poItems) {
              await client.query(`
                UPDATE inventory
                SET quantity_reserved = GREATEST(0, quantity_reserved - $1),
                    updated_at = CURRENT_TIMESTAMP
                WHERE product_id = $2 AND warehouse_location_id = $3
              `, [item.quantity, item.product_id, warehouseId]);
            }
          }
        }

        // Update PO status
        const updateResult = await client.query(
          `UPDATE purchase_orders
           SET status = $1, updated_at = NOW()
           WHERE id = $2
           RETURNING *`,
          [status, po_id]
        );

        await client.query('COMMIT');
        res.json({
          success: true,
          message: `PO status updated to ${status}`,
          data: updateResult.rows[0]
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Update PO status error:', error);
      res.status(500).json({ error: error.message || 'Failed to update PO' });
    }
  }

  /**
   * Receive PO items (partial or full)
   */
  static async receivePOItems(req, res) {
    try {
      const { po_id } = req.params;
      const { items } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'No items to receive' });
      }

      let totalReceived = 0;

      for (const item of items) {
        // Update received quantity
        await pool.query(
          `UPDATE purchase_order_items
           SET quantity_received = COALESCE(quantity_received, 0) + $1
           WHERE id = $2`,
          [item.received_qty, item.item_id]
        );

        totalReceived += item.received_qty;
      }

      // Update PO status if fully received
      const poResult = await pool.query(
        `SELECT 
          (SELECT SUM(quantity) FROM purchase_order_items WHERE purchase_order_id = $1) as total_qty,
          (SELECT SUM(COALESCE(quantity_received, 0)) FROM purchase_order_items WHERE purchase_order_id = $1) as total_received
         FROM purchase_orders WHERE id = $1`,
        [po_id]
      );

      const po = poResult.rows[0];
      const newStatus = po.total_received >= po.total_qty ? 'RECEIVED' : 'PARTIAL';

      const updateResult = await pool.query(
        `UPDATE purchase_orders
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [newStatus, po_id]
      );

      res.json({
        success: true,
        message: `Received ${totalReceived} items`,
        data: updateResult.rows[0],
        status: newStatus
      });
    } catch (error) {
      console.error('Receive items error:', error);
      res.status(500).json({ error: 'Failed to receive items' });
    }
  }

  /**
   * Get low stock recommendation (for creating PO)
   */
  static async getLowStockForPO(req, res) {
    try {
      const result = await pool.query(
        `SELECT 
          p.id, p.name, p.sku, p.cost_price,
          COALESCE(SUM(CASE WHEN i.quantity > 0 THEN i.quantity ELSE 0 END), 0) as on_hand
         FROM products p
         LEFT JOIN inventory i ON p.id = i.product_id
         GROUP BY p.id, p.name, p.sku, p.cost_price
         ORDER BY on_hand ASC
         LIMIT 20`
      );

      res.json({
        success: true,
        message: `${result.rows.length} products for PO recommendation`,
        data: result.rows
      });
    } catch (error) {
      console.error('Low stock error:', error);
      res.status(500).json({ error: 'Failed to fetch low stock items' });
    }
  }
}

module.exports = PurchaseOrderController;
