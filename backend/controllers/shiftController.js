// backend/controllers/shiftController.js
const pool = require('../config/database');

class ShiftController {
  /**
   * Open a cashier shift
   */
  static async openShift(req, res) {
    try {
      const user_id = req.user.id; // Use authenticated user ID
      const { outlet_id = 1, float_amount = 0, notes } = req.body;
      
      if (!user_id) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // Check for existing open shift
      const existingShift = await pool.query(
        `SELECT id FROM cashier_shifts 
         WHERE user_id = $1 AND outlet_id = $2 AND closed_at IS NULL`,
        [user_id, outlet_id]
      );

      if (existingShift.rows.length > 0) {
        return res.status(400).json({ error: 'User has an open shift already' });
      }

      // Create shift
      const result = await pool.query(
        `INSERT INTO cashier_shifts 
         (outlet_id, user_id, float_amount, opened_at, status)
         VALUES ($1, $2, $3, NOW(), $4)
         RETURNING id, outlet_id, user_id, float_amount, opened_at, status`,
        [outlet_id, user_id, float_amount, 'OPEN']
      );

      res.status(201).json({
        success: true,
        message: 'Shift opened successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Open shift error:', error);
      res.status(500).json({ error: 'Failed to open shift' });
    }
  }

  /**
   * Close a cashier shift with reconciliation
   */
  static async closeShift(req, res) {
    try {
      const shift_id = req.params.shift_id; // Get from URL params
      const { actual_amount, discrepancy_notes } = req.body;
      
      if (!shift_id || actual_amount === undefined) {
        return res.status(400).json({ error: 'Shift ID and actual amount required' });
      }

      // Get shift details
      const shiftResult = await pool.query(
        `SELECT * FROM cashier_shifts WHERE id = $1`,
        [shift_id]
      );

      if (shiftResult.rows.length === 0) {
        return res.status(404).json({ error: 'Shift not found' });
      }

      const shift = shiftResult.rows[0];

      // Calculate total transactions and sales for this shift
      const txnResult = await pool.query(
        `SELECT COALESCE(SUM(total_amount), 0) as total_sales,
                COALESCE(COUNT(id), 0)::int as total_transactions
         FROM sales
         WHERE cashier_shift_id = $1`,
        [shift_id]
      );

      const totalSales = parseFloat(txnResult.rows[0].total_sales || 0);
      const totalTransactions = parseInt(txnResult.rows[0].total_transactions || 0, 10);
      const expectedAmount = parseFloat(shift.float_amount) + totalSales;
      const discrepancy = parseFloat(actual_amount) - expectedAmount;

      // Update shift with closing details
      const updateResult = await pool.query(
        `UPDATE cashier_shifts
         SET closed_at = NOW(), 
             actual_amount = $1,
             total_sales = $2,
             total_transactions = $3,
             expected_amount = $4,
             discrepancy = $5,
             status = $6,
             discrepancy_notes = $7
         WHERE id = $8
         RETURNING *`,
        [
          actual_amount,
          totalSales,
          totalTransactions,
          expectedAmount,
          discrepancy,
          discrepancy === 0 ? 'CLOSED_OK' : 'CLOSED_DISCREPANCY',
          discrepancy_notes,
          shift_id
        ]
      );

      res.json({
        success: true,
        message: 'Shift closed successfully',
        data: updateResult.rows[0],
        summary: {
          float: shift.float_amount,
          totalSales: totalSales,
          expected: expectedAmount,
          actual: actual_amount,
          discrepancy: discrepancy,
          discrepancyPercent: ((Math.abs(discrepancy) / expectedAmount) * 100).toFixed(2) + '%'
        }
      });
    } catch (error) {
      console.error('Close shift error:', error);
      res.status(500).json({ error: 'Failed to close shift' });
    }
  }

  /**
   * Get open shift (for current user)
   */
  static async getOpenShift(req, res) {
    try {
      const user_id = req.user.id; // Use authenticated user ID
      const { outlet_id = 1 } = req.query;
      
      if (!user_id) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const result = await pool.query(
        `SELECT 
          cs.id, cs.outlet_id, cs.user_id, cs.opened_at, cs.closed_at,
          cs.float_amount, cs.status, cs.created_at, cs.updated_at,
          u.username, u.email, u.first_name, u.last_name,
          COALESCE((SELECT SUM(total_amount) FROM sales WHERE cashier_shift_id = cs.id), 0)::FLOAT as total_sales,
          (cs.float_amount + COALESCE((SELECT SUM(total_amount) FROM sales WHERE cashier_shift_id = cs.id), 0))::FLOAT as expected_amount,
          COALESCE((SELECT COUNT(id) FROM sales WHERE cashier_shift_id = cs.id), 0)::INT as total_transactions
         FROM cashier_shifts cs
         LEFT JOIN users u ON cs.user_id = u.id
         WHERE cs.user_id = $1 AND cs.outlet_id = $2 AND cs.closed_at IS NULL`,
        [user_id, outlet_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No open shift found' });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Get open shift error:', error);
      res.status(500).json({ error: 'Failed to fetch shift' });
    }
  }

  /**
   * Get shift history
   */
  static async getShiftHistory(req, res) {
    try {
      const { user_id, outlet_id = 1, days = 30 } = req.query;
      let query = `
        SELECT 
          cs.id, cs.outlet_id, cs.user_id, cs.opened_at, cs.closed_at,
          cs.float_amount, cs.total_sales, cs.total_transactions,
          cs.expected_amount, cs.actual_amount, cs.discrepancy,
          cs.status, cs.discrepancy_notes, u.username, u.first_name, u.last_name
         FROM cashier_shifts cs
         LEFT JOIN users u ON cs.user_id = u.id
         WHERE cs.outlet_id = $1
      `;
      
      const params = [outlet_id];
      if (user_id) {
        query += ` AND cs.user_id = $${params.length + 1}`;
        params.push(user_id);
      }
      
      query += ' ORDER BY cs.opened_at DESC LIMIT 50';
      
      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('Shift history error:', error);
      res.status(500).json({ error: 'Failed to fetch shift history' });
    }
  }

  /**
   * Get shift summary (performance metrics)
   */
  static async getShiftSummary(req, res) {
    try {
      const { shift_id } = req.params;
      
      if (!shift_id) {
        return res.status(400).json({ error: 'Shift ID required' });
      }

      // Get shift details with calculations
      const result = await pool.query(
        `SELECT 
          cs.*,
          u.username, u.first_name, u.last_name,
          COUNT(DISTINCT s.id) as total_txn,
          COALESCE(SUM(s.total_amount), 0) as total_sales_value,
          COALESCE(AVG(s.total_amount), 0) as avg_txn_value,
          COALESCE(SUM(CASE WHEN s.discount_amount > 0 THEN 1 ELSE 0 END), 0) as txn_with_discount,
          COALESCE(SUM(s.discount_amount), 0) as total_discount
         FROM cashier_shifts cs
         LEFT JOIN users u ON cs.user_id = u.id
         LEFT JOIN sales s ON cs.id = s.cashier_shift_id
         WHERE cs.id = $1
         GROUP BY cs.id, u.username, u.first_name, u.last_name`,
        [shift_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Shift not found' });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Shift summary error:', error);
      res.status(500).json({ error: 'Failed to fetch shift summary' });
    }
  }

  /**
   * Get daily shift report
   */
  static async getDailyReport(req, res) {
    try {
      const { outlet_id = 1, date } = req.query;
      const targetDate = date ? new Date(date) : new Date();
      const dateStr = targetDate.toISOString().split('T')[0];

      const result = await pool.query(
        `SELECT 
          u.id, u.username, u.first_name, u.last_name,
          COUNT(DISTINCT cs.id) as shifts_count,
          COUNT(DISTINCT s.id) as total_txn,
          COALESCE(SUM(s.total_amount), 0) as total_sales,
          COALESCE(SUM(s.discount_amount), 0) as total_discount,
          COALESCE(SUM(CASE WHEN pm.name = 'Cash' THEN s.total_amount ELSE 0 END), 0) as cash_sales
         FROM users u
         LEFT JOIN cashier_shifts cs ON u.id = cs.user_id AND DATE(cs.opened_at) = $1
         LEFT JOIN sales s ON cs.id = s.cashier_shift_id
         LEFT JOIN payment_methods pm ON s.payment_method_id = pm.id
         WHERE cs.outlet_id = $2 AND cs.closed_at IS NOT NULL
         GROUP BY u.id, u.username, u.first_name, u.last_name
         ORDER BY u.username`,
        [dateStr, outlet_id]
      );

      res.json({
        success: true,
        date: dateStr,
        data: result.rows
      });
    } catch (error) {
      console.error('Daily report error:', error);
      res.status(500).json({ error: 'Failed to fetch daily report' });
    }
  }
}

module.exports = ShiftController;
