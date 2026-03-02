// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

/**
 * @route   GET /api/dashboard/summary
 * @desc    Get dashboard summary
 * @access  Private
 */
router.get('/summary', async (req, res) => {
  try {
    // Today's sales
    const todayResult = await pool.query(`
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM sales
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    // This month's sales
    const monthlyResult = await pool.query(`
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM sales
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    // Total products
    const productsResult = await pool.query(`
      SELECT COUNT(*) as total_products FROM products WHERE is_active = true
    `);

    // Low stock alerts
    const lowStockResult = await pool.query(`
      SELECT COUNT(*) as low_stock_products
      FROM inventory i
      JOIN stock_alerts sa ON i.product_id = sa.product_id
      WHERE i.quantity_available <= sa.min_quantity
    `);

    res.json({
      status: 'SUCCESS',
      data: {
        today: todayResult.rows[0],
        this_month: monthlyResult.rows[0],
        total_products: productsResult.rows[0],
        low_stock: lowStockResult.rows[0]
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/dashboard/top-products
 * @desc    Get top selling products
 * @access  Private
 */
router.get('/top-products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        COUNT(si.id) as times_sold,
        SUM(si.quantity) as total_quantity,
        SUM(si.subtotal) as total_revenue
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE DATE(si.created_at) >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY p.id, p.name, p.sku
      ORDER BY times_sold DESC
      LIMIT 10
    `);

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
 * @route   GET /api/dashboard/sales-by-channel
 * @desc    Get sales by channel
 * @access  Private
 */
router.get('/sales-by-channel', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        sc.name as channel,
        COUNT(s.id) as total_transactions,
        SUM(s.total_amount) as total_revenue,
        COUNT(DISTINCT s.customer_name) as total_customers
      FROM sales s
      JOIN sales_channels sc ON s.sales_channel_id = sc.id
      WHERE DATE(s.created_at) >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY sc.name
      ORDER BY total_revenue DESC
    `);

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

module.exports = router;
