const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticateToken, normalizeRole } = require('../middleware/auth');
const { sendCustomerVerificationEmail } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'kasirin_secret_key_2024';
const JWT_EXPIRES_IN = '8h';

let authSchemaReady = false;

async function ensureAuthSchema() {
  if (authSchemaReady) {
    return;
  }

  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT true');

  await pool.query(
    `UPDATE users
     SET email_verified = true
     WHERE email_verified IS NULL`
  );

  await pool.query(
    `CREATE TABLE IF NOT EXISTS customer_email_verifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(128) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );

  await pool.query(
    `INSERT INTO roles (name, description)
     VALUES ('CUSTOMER', 'Pelanggan website TeamApple')
     ON CONFLICT (name) DO NOTHING`
  );

  authSchemaReady = true;
}

function createToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * @route   POST /api/auth/login
 * @desc    Unified login for admin/staff/customer using username + password
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    await ensureAuthSchema();

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Username dan password harus diisi'
      });
    }

    const result = await pool.query(
      `SELECT u.*, COALESCE(u.email_verified, true) AS email_verified, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.username = $1 AND u.is_active = true`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Username atau password salah'
      });
    }

    const user = result.rows[0];
    const appRole = normalizeRole(user.role_name);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Username atau password salah'
      });
    }

    if (appRole === 'CUSTOMER' && !user.email_verified) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Akun customer belum diverifikasi. Cek email Anda untuk verifikasi akun.'
      });
    }

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = createToken({
      id: user.id,
      username: user.username,
      role: appRole
    });

    res.json({
      status: 'SUCCESS',
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: appRole,
          phone: user.phone,
          email_verified: !!user.email_verified
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

/**
 * @route   POST /api/auth/register-customer
 * @desc    Register new customer account with email verification
 * @access  Public
 */
router.post('/register-customer', async (req, res) => {
  try {
    await ensureAuthSchema();

    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Nama, email, username, dan password wajib diisi.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Password minimal 6 karakter.'
      });
    }

    const customerRoleResult = await pool.query('SELECT id FROM roles WHERE name = $1 LIMIT 1', ['CUSTOMER']);
    const customerRoleId = customerRoleResult.rows[0]?.id;

    if (!customerRoleId) {
      return res.status(500).json({
        status: 'ERROR',
        message: 'Role CUSTOMER tidak tersedia.'
      });
    }

    const duplicateCheck = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2 LIMIT 1',
      [username, email]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({
        status: 'ERROR',
        message: 'Username atau email sudah terdaftar.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `INSERT INTO users (username, email, password, first_name, role_id, is_active, email_verified)
       VALUES ($1, $2, $3, $4, $5, true, false)
       RETURNING id, username, email, first_name`,
      [username, email, hashedPassword, name, customerRoleId]
    );

    const user = userResult.rows[0];

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query('DELETE FROM customer_email_verifications WHERE user_id = $1', [user.id]);

    await pool.query(
      `INSERT INTO customer_email_verifications (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, verificationToken, expiresAt]
    );

    const emailResult = await sendCustomerVerificationEmail({
      to: user.email,
      name: user.first_name,
      token: verificationToken
    });

    res.status(201).json({
      status: 'SUCCESS',
      message: emailResult.delivered
        ? 'Akun customer berhasil dibuat. Silakan cek email untuk verifikasi akun.'
        : 'Akun customer berhasil dibuat. SMTP belum aktif, gunakan link verifikasi dari response (mode development).',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name
        },
        email_delivery: {
          delivered: emailResult.delivered,
          message: emailResult.message
        },
        verification_url: emailResult.delivered ? undefined : emailResult.verificationUrl
      }
    });
  } catch (error) {
    console.error('register-customer error:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        status: 'ERROR',
        message: 'Username atau email sudah terdaftar.'
      });
    }

    res.status(500).json({
      status: 'ERROR',
      message: 'Gagal membuat akun customer.'
    });
  }
});

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify customer email using verification token
 * @access  Public
 */
router.get('/verify-email', async (req, res) => {
  try {
    await ensureAuthSchema();

    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Token verifikasi tidak valid.'
      });
    }

    const verificationResult = await pool.query(
      `SELECT v.id, v.user_id, v.expires_at, v.used_at
       FROM customer_email_verifications v
       WHERE v.token = $1
       LIMIT 1`,
      [token]
    );

    if (verificationResult.rows.length === 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Token verifikasi tidak ditemukan.'
      });
    }

    const verification = verificationResult.rows[0];

    if (verification.used_at) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Token verifikasi sudah pernah digunakan.'
      });
    }

    if (new Date(verification.expires_at).getTime() < Date.now()) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Token verifikasi sudah kadaluarsa. Silakan daftar ulang.'
      });
    }

    await pool.query('UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1', [verification.user_id]);
    await pool.query('UPDATE customer_email_verifications SET used_at = NOW() WHERE id = $1', [verification.id]);

    res.json({
      status: 'SUCCESS',
      message: 'Akun customer berhasil diverifikasi. Silakan login.'
    });
  } catch (error) {
    console.error('verify-email error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Gagal memverifikasi akun customer.'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get('/me', authenticateToken, (req, res) => {
  const u = req.user;
  res.json({
    status: 'SUCCESS',
    data: {
      id: u.id,
      username: u.username,
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      role: u.role_name,
      phone: u.phone,
      last_login: u.last_login,
      email_verified: !!u.email_verified
    }
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    User logout (client should discard token)
 * @access  Private
 */
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    status: 'SUCCESS',
    message: 'Logout berhasil'
  });
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change current user password
 * @access  Private
 */
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Password lama dan baru harus diisi'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Password baru minimal 6 karakter'
      });
    }

    const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const isMatch = await bcrypt.compare(old_password, result.rows[0].password);

    if (!isMatch) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Password lama tidak sesuai'
      });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [newHash, req.user.id]);

    res.json({ status: 'SUCCESS', message: 'Password berhasil diubah' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

/**
 * @route   PUT /api/auth/change-profile
 * @desc    Change current user's username and/or password
 * @access  Private
 */
router.put('/change-profile', authenticateToken, async (req, res) => {
  try {
    const { username, old_password, new_password } = req.body;
    const userId = req.user.id;

    // 1. If username is changing, validate it
    if (username && username !== req.user.username) {
      if (username.length < 3) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Username minimal 3 karakter'
        });
      }

      // Check if username already exists
      const checkUsername = await pool.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, userId]);
      if (checkUsername.rows.length > 0) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Username sudah digunakan oleh akun lain'
        });
      }

      await pool.query('UPDATE users SET username = $1, updated_at = NOW() WHERE id = $2', [username, userId]);
    }

    // 2. If password is changing, validate and update it
    if (new_password) {
      if (!old_password) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Password lama harus diisi untuk mengubah password'
        });
      }

      if (new_password.length < 6) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Password baru minimal 6 karakter'
        });
      }

      const result = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
      const isMatch = await bcrypt.compare(old_password, result.rows[0].password);

      if (!isMatch) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Password lama tidak sesuai'
        });
      }

      const newHash = await bcrypt.hash(new_password, 10);
      await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [newHash, userId]);
    }

    res.json({
      status: 'SUCCESS',
      message: 'Profil berhasil diperbarui'
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

module.exports = router;
