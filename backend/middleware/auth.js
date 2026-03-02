// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'kasirin_secret_key_2024';

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

    req.user = result.rows[0];
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
    if (!roles.includes(req.user.role_name)) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Akses ditolak. Role tidak mencukupi.'
      });
    }
    next();
  };
};

module.exports = { authenticateToken, requireRole };
