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

  /**
   * Update PO status (DRAFT → APPROVED → SENT → RECEIVED)
   */
  static async updatePOStatus(req, res) {
    try {
      const { po_id } = req.params;
      const { status, notes } = req.body;

      const validStatuses = ['DRAFT', 'APPROVED', 'SENT', 'RECEIVED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be: ${validStatuses.join(', ')}` });
      }

      const result = await pool.query(
        `UPDATE purchase_orders
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [status, po_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'PO not found' });
      }

      res.json({
        success: true,
        message: `PO status updated to ${status}`,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Update PO status error:', error);
      res.status(500).json({ error: 'Failed to update PO' });
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
