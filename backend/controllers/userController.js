const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class UserController {
  /**
   * Get all users (managers and admins only)
   */
  async getAllUsers(req, res) {
    try {
      const result = await pool.query(
        `SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
                u.phone, r.name as role, u.is_active, u.last_login, u.created_at
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.id
         WHERE u.is_active = true
         ORDER BY u.created_at DESC LIMIT 100`
      );

      res.json({
        status: 'success',
        data: result.rows
      });
    } catch (error) {
      console.error('getAllUsers error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch users',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Create new user (managers and admins only)
   */
  async createUser(req, res) {
    try {
      const { username, email, password, first_name, last_name, phone, role_id } = req.body;

      // Validation
      if (!username || !email || !password || !first_name || !role_id) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 6 characters'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const result = await pool.query(
        `INSERT INTO users (username, email, password, first_name, last_name, phone, role_id, outlet_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
         RETURNING id, username, email, first_name, last_name, phone, role_id, created_at`,
        [username, email, hashedPassword, first_name, last_name, phone, role_id, req.user.outlet_id || 1]
      );

      res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('createUser error:', error);

      // Handle duplicate username/email
      if (error.code === '23505') {
        return res.status(409).json({
          status: 'error',
          message: 'Username or email already exists'
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Failed to create user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update user details (managers and admins only)
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { first_name, last_name, email, phone, role_id } = req.body;

      // Validation
      if (!id) {
        return res.status(400).json({
          status: 'error',
          message: 'User ID required'
        });
      }

      // Build dynamic update query
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (first_name !== undefined) {
        updates.push(`first_name = $${paramCount++}`);
        values.push(first_name);
      }
      if (last_name !== undefined) {
        updates.push(`last_name = $${paramCount++}`);
        values.push(last_name);
      }
      if (email !== undefined) {
        updates.push(`email = $${paramCount++}`);
        values.push(email);
      }
      if (phone !== undefined) {
        updates.push(`phone = $${paramCount++}`);
        values.push(phone);
      }
      if (role_id !== undefined) {
        updates.push(`role_id = $${paramCount++}`);
        values.push(role_id);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'No fields to update'
        });
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email, first_name, last_name, phone, role_id`;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      res.json({
        status: 'success',
        message: 'User updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('updateUser error:', error);

      if (error.code === '23505') {
        return res.status(409).json({
          status: 'error',
          message: 'Email already exists'
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Failed to update user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Deactivate user (admin only)
   */
  async deactivateUser(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          status: 'error',
          message: 'User ID required'
        });
      }

      const result = await pool.query(
        `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id, username`
        , [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      res.json({
        status: 'success',
        message: 'User deactivated',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('deactivateUser error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to deactivate user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(req, res) {
    try {
      const result = await pool.query(
        `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.phone,
                r.name as role, r.id as role_id
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.id
         WHERE u.id = $1 AND u.is_active = true`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found or inactive'
        });
      }

      res.json({
        status: 'success',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('getCurrentUser error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch user profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.phone,
                r.name as role, r.id as role_id, u.is_active, u.last_login, u.created_at
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.id
         WHERE u.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      res.json({
        status: 'success',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('getUserById error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new UserController();
