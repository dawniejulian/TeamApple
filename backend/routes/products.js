// backend/routes/products.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * PUBLIC ENDPOINTS - No Auth Required
 */

/**
 * @route   GET /api/products/categories/list
 * @desc    Get all categories for dropdown
 * @access  Public
 */
router.get('/categories/list', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description 
      FROM categories 
      WHERE is_active = true 
      ORDER BY name
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
 * @route   GET /api/products/conditions/list
 * @desc    Get all product conditions for dropdown
 * @access  Public
 */
router.get('/conditions/list', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name 
      FROM product_conditions
      ORDER BY name
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
 * PROTECTED ENDPOINTS - Auth Required
 */

// Apply auth to remaining product routes
router.use(authenticateToken);

/**
 * @route   GET /api/products
 * @desc    Get all products
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { category_id, condition_id, search } = req.query;
    
    let query = `
      SELECT p.*, c.name as category_name, pc.name as condition_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_conditions pc ON p.condition_id = pc.id
      WHERE p.is_active = true
    `;
    
    const params = [];
    let paramCount = 1;

    if (category_id) {
      query += ` AND p.category_id = $${paramCount}`;
      params.push(category_id);
      paramCount++;
    }

    if (condition_id) {
      query += ` AND p.condition_id = $${paramCount}`;
      params.push(condition_id);
      paramCount++;
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({
      status: 'SUCCESS',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT p.*, c.name as category_name, pc.name as condition_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_conditions pc ON p.condition_id = pc.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Produk tidak ditemukan'
      });
    }

    // Get variants
    const variantsResult = await pool.query(`
      SELECT * FROM product_variants WHERE product_id = $1
    `, [id]);

    const product = result.rows[0];
    product.variants = variantsResult.rows;

    res.json({
      status: 'SUCCESS',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private (ADMIN/MANAGER)
 */
router.post('/', async (req, res) => {
  try {
    const {
      sku,
      name,
      category_id,
      condition_id,
      buy_price,
      selling_price,
      description,
      specifications
    } = req.body;

    if (!sku || !name || !category_id || !condition_id) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'SKU, nama, kategori, dan kondisi harus diisi'
      });
    }

    const result = await pool.query(`
      INSERT INTO products 
      (sku, name, category_id, condition_id, buy_price, selling_price, description, specifications)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [sku, name, category_id, condition_id, buy_price, selling_price, description, JSON.stringify(specifications)]);

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Produk berhasil ditambahkan',
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
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (ADMIN/MANAGER)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, selling_price, buy_price, description } = req.body;

    const result = await pool.query(`
      UPDATE products 
      SET name = COALESCE($1, name),
          selling_price = COALESCE($2, selling_price),
          buy_price = COALESCE($3, buy_price),
          description = COALESCE($4, description),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [name, selling_price, buy_price, description, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Produk tidak ditemukan'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Produk berhasil diperbarui',
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
 * @route   DELETE /api/products/:id
 * @desc    Soft delete product
 * @access  Private (ADMIN)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE products 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Produk tidak ditemukan'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Produk berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

module.exports = router;
