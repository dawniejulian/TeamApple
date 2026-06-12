// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { ensureStoreDevicesTable } = require('../utils/dbHelpers');

const JWT_SECRET = process.env.JWT_SECRET || 'kasirin_secret_key_2024';

const ADMIN_ROLES = new Set(['ADMIN', 'OWNER', 'MANAGER']);
const STAFF_ROLES = new Set(['STAFF', 'VIEWER', 'CASHIER', 'WAREHOUSE', 'SUPERVISOR']);
const CUSTOMER_ROLES = new Set(['CUSTOMER', 'PELANGGAN']);

const normalizeRole = (roleName) => {
  const normalized = String(roleName || '').toUpperCase();

  if (ADMIN_ROLES.has(normalized)) {
    return 'ADMIN';
  }

  if (STAFF_ROLES.has(normalized)) {
    return 'STAFF';
  }

  if (CUSTOMER_ROLES.has(normalized)) {
    return 'CUSTOMER';
  }

  return 'STAFF';
};

const canAccessRoute = (userRole, requiredRoles) => {
  const normalizedUserRole = normalizeRole(userRole);
  const normalizedRequiredRoles = new Set(requiredRoles.map(normalizeRole));

  if (normalizedUserRole === 'CUSTOMER') {
    return normalizedRequiredRoles.has('CUSTOMER');
  }

  if (normalizedUserRole === 'ADMIN') {
    return true;
  }

  if (normalizedUserRole === 'STAFF') {
    return normalizedRequiredRoles.has('STAFF');
  }

  return false;
};

/**
 * Middleware to verify JWT and attach user to request
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'ERROR',
      message: 'Token akses diperlukan'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get fresh user data from DB
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name,
              u.phone, u.is_active, u.last_login, u.role_id,
              COALESCE(u.email_verified, true) AS email_verified,
              r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1 AND u.is_active = true`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User tidak ditemukan atau tidak aktif'
      });
    }

    req.user = {
      ...result.rows[0],
      role_name: normalizeRole(result.rows[0].role_name)
    };
    next();
  } catch (error) {
    return res.status(403).json({
      status: 'ERROR',
      message: 'Token tidak valid atau sudah kadaluarsa'
    });
  }
};

/**
 * Middleware to restrict access by role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'ERROR', message: 'Unauthorized' });
    }

    if (!canAccessRoute(req.user.role_name, roles)) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Akses ditolak. Role tidak mencukupi.'
      });
    }
    next();
  };
};

/**
 * Middleware to restrict POS/kasir access:
 * - ADMIN: always allowed from any device
 * - STAFF: only allowed if X-Device-ID header matches a registered store device
 */
const requireStoreDevice = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: 'ERROR', message: 'Unauthorized' });
  }

  const role = req.user.role_name;

  // Admin always passes
  if (role === 'ADMIN') {
    return next();
  }

  // Staff must be on a registered store device
  if (role === 'STAFF') {
    const deviceId = req.headers['x-device-id'];

    if (!deviceId) {
      return res.status(403).json({
        status: 'DEVICE_NOT_REGISTERED',
        message: 'Perangkat tidak dikenal. Minta Admin untuk mendaftarkan perangkat ini.'
      });
    }

    try {
      await ensureStoreDevicesTable();
      const result = await pool.query(
        'SELECT id FROM store_devices WHERE device_id = $1 AND is_active = true',
        [deviceId]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({
          status: 'DEVICE_NOT_REGISTERED',
          message: 'Perangkat ini belum terdaftar sebagai perangkat toko. Minta Admin untuk mendaftarkan perangkat ini.',
          device_id: deviceId
        });
      }

      return next();
    } catch (error) {
      console.error('Device check error:', error);
      return res.status(500).json({ status: 'ERROR', message: 'Gagal verifikasi perangkat' });
    }
  }

  // Customer and other roles: blocked from POS
  return res.status(403).json({
    status: 'ERROR',
    message: 'Akses ditolak. Role tidak mencukupi untuk mengakses kasir.'
  });
};

module.exports = { authenticateToken, requireRole, requireStoreDevice, normalizeRole };
