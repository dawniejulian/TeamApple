// backend/routes/auth.js
const express = require('express');
const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Username dan password harus diisi'
      });
    }

    // TODO: Implement login logic
    // 1. Validate user exists
    // 2. Check password
    // 3. Generate JWT token
    // 4. Return token and user info

    res.json({
      status: 'SUCCESS',
      message: 'Login berhasil',
      data: {
        token: 'jwt_token_here',
        user: {
          id: 1,
          username: username,
          email: 'user@example.com',
          role: 'STAFF'
        }
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
 * @route   POST /api/auth/logout
 * @desc    User logout
 * @access  Private
 */
router.post('/logout', (req, res) => {
  res.json({
    status: 'SUCCESS',
    message: 'Logout berhasil'
  });
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh', (req, res) => {
  res.json({
    status: 'SUCCESS',
    message: 'Token refreshed',
    data: {
      token: 'new_jwt_token_here'
    }
  });
});

module.exports = router;
