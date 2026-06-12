// backend/routes/activity-logs.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { ensureActivityLogsTable } = require('../utils/dbHelpers');

// All routes require login
router.use(authenticateToken);

/**
 * @route   GET /api/activity-logs
 * @desc    Get activity logs — each user only sees their own logs (filtered by user_id)
 *          Supports optional query: ?date=YYYY-MM-DD
 * @access  Private (ADMIN + STAFF)
 */
router.get('/', async (req, res) => {
  try {
    await ensureActivityLogsTable();

    const { date } = req.query;
    const userId = req.user.id;

    const params = [userId];
    let dateFilter = '';

    if (date) {
      // Validate date format
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ status: 'ERROR', message: 'Format tanggal tidak valid. Gunakan YYYY-MM-DD.' });
      }
      dateFilter = ' AND DATE(created_at) = $2';
      params.push(date);
    } else {
      // Default: today
      dateFilter = ' AND DATE(created_at) = CURRENT_DATE';
    }

    const result = await pool.query(
      `SELECT id, action, description, meta, device_id, ip_address, created_at
       FROM activity_logs
       WHERE user_id = $1${dateFilter}
       ORDER BY created_at DESC
       LIMIT 200`,
      params
    );

    res.json({
      status: 'SUCCESS',
      data: result.rows,
      count: result.rows.length,
      filter_date: date || new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

/**
 * @route   GET /api/activity-logs/available-dates
 * @desc    Get list of dates that have activity logs for the current user
 * @access  Private (ADMIN + STAFF)
 */
router.get('/available-dates', async (req, res) => {
  try {
    await ensureActivityLogsTable();

    const result = await pool.query(
      `SELECT DISTINCT DATE(created_at) as log_date
       FROM activity_logs
       WHERE user_id = $1
       ORDER BY log_date DESC
       LIMIT 30`,
      [req.user.id]
    );

    res.json({
      status: 'SUCCESS',
      data: result.rows.map(r => r.log_date)
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

module.exports = router;
