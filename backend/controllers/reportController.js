// backend/controllers/reportController.js
const pool = require('../config/database');

function resolveDateRange(query) {
  return {
    startDate: query.startDate || query.from || null,
    endDate: query.endDate || query.to || null
  };
}

class ReportController {
  // Daily sales summary
  static async getDailySales(req, res) {
    try {
      const targetDate = req.query.date || new Date().toISOString().split('T')[0];
      const result = await pool.query(
        `SELECT
          DATE(created_at) AS sale_date,
          COUNT(*)::int AS total_transactions,
          COALESCE(SUM(total_amount), 0) AS total_revenue,
          COALESCE(SUM(discount_amount), 0) AS total_discounts,
          COALESCE(SUM(tax_amount), 0) AS total_tax
         FROM sales
         WHERE DATE(created_at) = $1
         GROUP BY DATE(created_at)`,
        [targetDate]
      );

      res.json({
        success: true,
        data: result.rows[0] || {
          sale_date: targetDate,
          total_transactions: 0,
          total_revenue: 0,
          total_discounts: 0,
          total_tax: 0
        }
      });
    } catch (error) {
      console.error('Daily sales error:', error);
      res.status(500).json({ error: 'Failed to fetch daily sales' });
    }
  }

  // Period sales report in the shape expected by frontend
  static async getPeriodSales(req, res) {
    try {
      const { startDate, endDate } = resolveDateRange(req.query);
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate/endDate or from/to required' });
      }

      const dailyResult = await pool.query(
        `SELECT
          DATE(created_at) AS date,
          COUNT(*)::int AS transaction_count,
          COALESCE(SUM(total_amount), 0) AS revenue,
          COALESCE(SUM(discount_amount), 0) AS discounts
         FROM sales
         WHERE DATE(created_at) >= $1 AND DATE(created_at) <= $2
         GROUP BY DATE(created_at)
         ORDER BY DATE(created_at) DESC`,
        [startDate, endDate]
      );

      const summary = dailyResult.rows.reduce(
        (acc, row) => ({
          total_revenue: acc.total_revenue + Number(row.revenue),
          total_transactions: acc.total_transactions + Number(row.transaction_count),
          total_discounts: acc.total_discounts + Number(row.discounts)
        }),
        { total_revenue: 0, total_transactions: 0, total_discounts: 0 }
      );

      const salesListResult = await pool.query(
        `SELECT s.id, s.invoice_number, s.created_at, s.total_amount, s.payment_method, s.notes,
                COALESCE(NULLIF(TRIM(CONCAT(u.first_name, ' ', u.last_name)), ''), u.username) AS cashier_name,
                r.name as role_name,
                sc.name as channel_name,
                COALESCE(
                  (SELECT string_agg(concat(p.name, ' (x', si.quantity, ')'), ', ')
                   FROM sale_items si
                   JOIN products p ON si.product_id = p.id
                   WHERE si.sale_id = s.id), ''
                ) as items_summary
         FROM sales s
         LEFT JOIN users u ON s.sales_staff_id = u.id
         LEFT JOIN roles r ON u.role_id = r.id
         LEFT JOIN sales_channels sc ON s.sales_channel_id = sc.id
         WHERE DATE(s.created_at) >= $1 AND DATE(s.created_at) <= $2
         ORDER BY s.created_at DESC`,
        [startDate, endDate]
      );

      res.json({
        success: true,
        data: {
          ...summary,
          daily_sales: dailyResult.rows,
          transactions: salesListResult.rows
        }
      });
    } catch (error) {
      console.error('Period sales error:', error);
      res.status(500).json({ error: 'Failed to fetch period sales' });
    }
  }

  // Product sales placeholder based on available schema
  static async getProductSales(req, res) {
    try {
      const { limit = 20 } = req.query;
      const result = await pool.query(
        `SELECT id, sku, name, selling_price
         FROM products
         WHERE is_active = true
         ORDER BY id DESC
         LIMIT $1`,
        [Number(limit)]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Product sales error:', error);
      res.status(500).json({ error: 'Failed to fetch product sales' });
    }
  }

  // Cashier performance report
  static async getCashierPerformance(req, res) {
    try {
      const { startDate, endDate } = resolveDateRange(req.query);
      const params = [];
      let dateFilter = '';

      if (startDate && endDate) {
        params.push(startDate, endDate);
        dateFilter = 'AND DATE(s.created_at) >= $1 AND DATE(s.created_at) <= $2';
      }

      const query = `
        SELECT
          u.id,
          CASE 
            WHEN r.name = 'ADMIN' THEN 'Admin'
            ELSE COALESCE(NULLIF(TRIM(CONCAT(u.first_name, ' ', u.last_name)), ''), u.username)
          END AS cashier_name,
          COUNT(s.id)::int AS transaction_count,
          COALESCE(SUM(s.total_amount), 0) AS total_sales,
          COALESCE(SUM(s.discount_amount), 0) AS total_discounts
         FROM users u
         JOIN roles r ON u.role_id = r.id AND r.name IN ('ADMIN', 'STAFF')
         LEFT JOIN sales s ON u.id = s.sales_staff_id ${dateFilter}
         GROUP BY u.id, u.first_name, u.last_name, u.username, r.name
         ORDER BY total_sales DESC`;

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Cashier performance error:', error);
      res.status(500).json({ error: 'Failed to fetch cashier performance' });
    }
  }

  // Payment method breakdown
  static async getPaymentMethodReport(req, res) {
    try {
      const { startDate, endDate } = resolveDateRange(req.query);
      const params = [];
      let whereClause = '';

      if (startDate && endDate) {
        params.push(startDate, endDate);
        whereClause = 'WHERE DATE(created_at) >= $1 AND DATE(created_at) <= $2';
      }

      const query = `
        SELECT
          COALESCE(payment_method, 'UNKNOWN') AS payment_method,
          COUNT(*)::int AS transaction_count,
          COALESCE(SUM(total_amount), 0) AS total_amount
         FROM sales
         ${whereClause}
         GROUP BY payment_method
         ORDER BY total_amount DESC`;

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Payment method error:', error);
      res.status(500).json({ error: 'Failed to fetch payment report' });
    }
  }

  // Inventory valuation
  static async getInventoryValuation(req, res) {
    try {
      const itemsResult = await pool.query(
        `SELECT
          p.id,
          p.name AS product_name,
          COALESCE(SUM(i.quantity_available), 0)::int AS quantity,
          COALESCE(p.buy_price, 0) AS purchase_price,
          COALESCE(SUM(i.quantity_available) * p.buy_price, 0) AS valuation
         FROM products p
         LEFT JOIN inventory i ON p.id = i.product_id
         WHERE p.is_active = true
         GROUP BY p.id, p.name, p.buy_price
         ORDER BY valuation DESC`
      );

      const totalValuation = itemsResult.rows.reduce(
        (sum, item) => sum + Number(item.valuation),
        0
      );

      res.json({
        success: true,
        data: {
          total_valuation: totalValuation,
          items: itemsResult.rows
        }
      });
    } catch (error) {
      console.error('Inventory valuation error:', error);
      res.status(500).json({ error: 'Failed to fetch inventory valuation' });
    }
  }

  // Dashboard overview
  static async getDashboardOverview(req, res) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [todaySales, monthSales, lowStock, openPOs] = await Promise.all([
        pool.query(
          `SELECT COALESCE(SUM(total_amount), 0) AS revenue, COUNT(*)::int AS transactions
           FROM sales
           WHERE DATE(created_at) = $1`,
          [today]
        ),
        pool.query(
          `SELECT COALESCE(SUM(total_amount), 0) AS revenue, COUNT(*)::int AS transactions
           FROM sales
           WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`
        ),
        pool.query(
          `SELECT COUNT(DISTINCT product_id)::int AS low_stock
           FROM inventory
           WHERE quantity_available < 5`
        ),
        pool.query(
          `SELECT COUNT(*)::int AS open_pos
           FROM purchase_orders
           WHERE status IN ('DRAFT', 'APPROVED', 'SENT')`
        )
      ]);

      res.json({
        success: true,
        data: {
          today: {
            revenue: Number(todaySales.rows[0].revenue),
            transactions: Number(todaySales.rows[0].transactions)
          },
          month: {
            revenue: Number(monthSales.rows[0].revenue),
            transactions: Number(monthSales.rows[0].transactions)
          },
          alerts: {
            low_stock: Number(lowStock.rows[0].low_stock),
            open_pos: Number(openPOs.rows[0].open_pos)
          }
        }
      });
    } catch (error) {
      console.error('Dashboard overview error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard overview' });
    }
  }
}

module.exports = ReportController;
