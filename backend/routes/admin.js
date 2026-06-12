// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Apply auth + ADMIN role to all admin routes
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (ADMIN)
 */
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
             r.name as role, u.phone, u.is_active, u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
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
 * @route   POST /api/admin/users
 * @desc    Create new user
 * @access  Private (ADMIN)
 */
router.post('/users', async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role_id, phone } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Username, email, dan password harus diisi'
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(`
      INSERT INTO users (username, email, password, first_name, last_name, role_id, phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, username, email, first_name, last_name, role_id
    `, [username, email, hashedPassword, first_name, last_name, role_id, phone]);

    res.status(201).json({
      status: 'SUCCESS',
      message: 'User berhasil dibuat',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/activity-logs
 * @desc    Get activity logs
 * @access  Private (ADMIN)
 */
router.get('/activity-logs', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const result = await pool.query(`
      SELECT a.*, u.username
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      status: 'SUCCESS',
      data: result.rows,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/settings
 * @desc    Get system settings
 * @access  Private (ADMIN)
 */
router.get('/settings', (req, res) => {
  res.json({
    status: 'SUCCESS',
    data: {
      app_name: process.env.APP_NAME || 'Kasirin',
      store_name: 'Apple Store',
      store_address: 'Yogyakarta',
      default_currency: 'IDR',
      tax_rate: 10,
      invoice_prefix: 'INV'
    }
  });
});

/**
 * @route   PUT /api/admin/settings
 * @desc    Update system settings
 * @access  Private (ADMIN)
 */
router.put('/settings', (req, res) => {
  // TODO: Implement settings update
  res.json({
    status: 'SUCCESS',
    message: 'Pengaturan berhasil diperbarui'
  });
});

module.exports = router;
