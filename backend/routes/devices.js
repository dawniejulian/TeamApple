// backend/routes/devices.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ensureStoreDevicesTable, logActivity } = require('../utils/dbHelpers');

// All routes require login + ADMIN role
router.use(authenticateToken);

/**
 * @route   GET /api/devices/check
 * @desc    Check if the current device is registered (used by frontend on POS load)
 * @access  Private (ADMIN + STAFF)
 */
router.get('/check', async (req, res) => {
  try {
    await ensureStoreDevicesTable();

    const role = req.user.role_name;

    // Admin always allowed
    if (role === 'ADMIN') {
      return res.json({
        status: 'SUCCESS',
        is_registered: true,
        is_admin: true,
        message: 'Admin diizinkan mengakses kasir dari perangkat mana saja.'
      });
    }

    const deviceId = req.headers['x-device-id'];

    if (!deviceId) {
      return res.json({
        status: 'SUCCESS',
        is_registered: false,
        device_id: null,
        message: 'Tidak ada Device ID yang dikirim.'
      });
    }

    const result = await pool.query(
      'SELECT id, device_name, created_at FROM store_devices WHERE device_id = $1 AND is_active = true',
      [deviceId]
    );

    if (result.rows.length === 0) {
      return res.json({
        status: 'SUCCESS',
        is_registered: false,
        device_id: deviceId,
        message: 'Perangkat belum terdaftar.'
      });
    }

    return res.json({
      status: 'SUCCESS',
      is_registered: true,
      device_id: deviceId,
      device_name: result.rows[0].device_name,
      registered_at: result.rows[0].created_at,
      message: 'Perangkat terdaftar sebagai perangkat toko.'
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

// Routes below: ADMIN only
router.use(requireRole('ADMIN'));

/**
 * @route   GET /api/devices
 * @desc    Get all registered store devices
 * @access  Private (ADMIN)
 */
router.get('/', async (req, res) => {
  try {
    await ensureStoreDevicesTable();

    const result = await pool.query(`
      SELECT d.id, d.device_id, d.device_name, d.ip_address, d.is_active,
             d.created_at, d.updated_at,
             u.username as registered_by_username
      FROM store_devices d
      LEFT JOIN users u ON d.registered_by = u.id
      ORDER BY d.created_at DESC
    `);

    res.json({
      status: 'SUCCESS',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

/**
 * @route   POST /api/devices/register
 * @desc    Register a device as a store device
 * @access  Private (ADMIN)
 */
router.post('/register', async (req, res) => {
  try {
    await ensureStoreDevicesTable();

    const { device_id, device_name } = req.body;
    const ip_address = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

    if (!device_id || !device_name) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Device ID dan nama perangkat harus diisi.'
      });
    }

    if (device_name.trim().length < 3) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Nama perangkat minimal 3 karakter.'
      });
    }

    const result = await pool.query(
      `INSERT INTO store_devices (device_id, device_name, ip_address, registered_by, is_active)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (device_id) DO UPDATE SET
         device_name = EXCLUDED.device_name,
         ip_address = EXCLUDED.ip_address,
         registered_by = EXCLUDED.registered_by,
         is_active = true,
         updated_at = NOW()
       RETURNING *`,
      [device_id, device_name.trim(), ip_address, req.user.id]
    );

    await logActivity({
      userId: req.user.id,
      username: req.user.username,
      action: 'DAFTARKAN_PERANGKAT',
      description: `Mendaftarkan perangkat "${device_name.trim()}" (ID: ${device_id})`,
      deviceId: device_id,
      ipAddress: ip_address
    });

    res.status(201).json({
      status: 'SUCCESS',
      message: `Perangkat "${device_name.trim()}" berhasil didaftarkan.`,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

/**
 * @route   PUT /api/devices/:id
 * @desc    Update device name or active status
 * @access  Private (ADMIN)
 */
router.put('/:id', async (req, res) => {
  try {
    await ensureStoreDevicesTable();

    const { id } = req.params;
    const { device_name, is_active } = req.body;

    const result = await pool.query(
      `UPDATE store_devices
       SET device_name = COALESCE($1, device_name),
           is_active = COALESCE($2, is_active),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [device_name?.trim() || null, is_active !== undefined ? is_active : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'Perangkat tidak ditemukan.' });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Perangkat berhasil diperbarui.',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

/**
 * @route   DELETE /api/devices/:id
 * @desc    Remove a device from the store device list (soft delete)
 * @access  Private (ADMIN)
 */
router.delete('/:id', async (req, res) => {
  try {
    await ensureStoreDevicesTable();

    const { id } = req.params;

    const result = await pool.query(
      `UPDATE store_devices SET is_active = false, updated_at = NOW()
       WHERE id = $1 RETURNING device_name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'Perangkat tidak ditemukan.' });
    }

    await logActivity({
      userId: req.user.id,
      username: req.user.username,
      action: 'HAPUS_PERANGKAT',
      description: `Menonaktifkan perangkat "${result.rows[0].device_name}"`,
    });

    res.json({
      status: 'SUCCESS',
      message: `Perangkat "${result.rows[0].device_name}" berhasil dinonaktifkan.`
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

module.exports = router;
