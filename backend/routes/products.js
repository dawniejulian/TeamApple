// backend/routes/products.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const productUploadDir = path.join(__dirname, '..', 'uploads', 'products');
fs.mkdirSync(productUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, productUploadDir);
  },
  filename: (_req, file, cb) => {
    const sanitizedName = path
      .parse(file.originalname)
      .name
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .slice(0, 40);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${sanitizedName}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('File harus berupa gambar'));
      return;
    }
    cb(null, true);
  },
});

const uploadProductImages = (req, res, next) => {
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ])(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        status: 'ERROR',
        message: 'Ukuran tiap gambar maksimal 3MB',
      });
      return;
    }

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        status: 'ERROR',
        message: 'Maksimal 10 gambar per produk',
      });
      return;
    }

    res.status(400).json({
      status: 'ERROR',
      message: err.message || 'Upload gambar gagal',
    });
  });
};

const parseSpecifications = (specifications) => {
  if (specifications === undefined || specifications === null || specifications === '') {
    return null;
  }

  if (typeof specifications === 'object') {
    return specifications;
  }

  try {
    return JSON.parse(specifications);
  } catch (_error) {
    return null;
  }
};

const normalizeCode = (value = '') => value
  .toString()
  .replace(/[\s\u200B-\u200D\uFEFF]/g, '')
  .trim()
  .toLowerCase();

const getCodeCandidates = (value = '') => {
  const normalized = normalizeCode(value);
  if (!normalized) {
    return [];
  }

  const candidates = [normalized];
  // EAN-13 dimulai '0' → tambah versi 12-digit (UPC-A tanpa leading zero)
  if (/^\d{13}$/.test(normalized) && normalized.startsWith('0')) {
    candidates.push(normalized.slice(1));
  }
  // 12-digit → tambah versi dengan leading '0' (EAN-13)
  if (/^\d{12}$/.test(normalized)) {
    candidates.push(`0${normalized}`);
  }
  // 11-digit → tambah versi dengan leading '0' dan '00'
  if (/^\d{11}$/.test(normalized)) {
    candidates.push(`0${normalized}`);
    candidates.push(`00${normalized}`);
  }

  return [...new Set(candidates)];
};

const resolveUploadedFilePath = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return null;
  }

  if (!imageUrl.startsWith('/uploads/products/')) {
    return null;
  }

  return path.join(__dirname, '..', imageUrl.replace(/^\//, ''));
};

const deleteIfExists = async (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('Gagal menghapus file lama:', error.message);
    }
  }
};

const ensureProductImagesTable = async (dbClient) => {
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      image_url VARCHAR(500) NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbClient.query(`
    CREATE INDEX IF NOT EXISTS idx_product_images_product_id
    ON product_images(product_id)
  `);
};

const getUploadedImageUrls = (req) => {
  const files = [
    ...(req.files?.image || []),
    ...(req.files?.images || []),
  ];

  return files.map((file) => `/uploads/products/${file.filename}`);
};

const cleanupUploadedFiles = async (req) => {
  const uploadedUrls = getUploadedImageUrls(req);
  await Promise.all(uploadedUrls.map((url) => deleteIfExists(resolveUploadedFilePath(url))));
};

const buildImageList = (primaryImageUrl, galleryRows) => {
  const galleryUrls = (galleryRows || []).map((row) => row.image_url).filter(Boolean);
  if (galleryUrls.length > 0) {
    return galleryUrls;
  }

  if (primaryImageUrl) {
    return [primaryImageUrl];
  }

  return [];
};

const insertProductImages = async (dbClient, productId, imageUrls) => {
  if (!imageUrls || imageUrls.length === 0) {
    return;
  }

  for (let index = 0; index < imageUrls.length; index += 1) {
    const imageUrl = imageUrls[index];
    await dbClient.query(
      `
        INSERT INTO product_images (product_id, image_url, sort_order)
        VALUES ($1, $2, $3)
      `,
      [productId, imageUrl, index]
    );
  }
};

/**
 * PUBLIC ENDPOINTS - No Auth Required
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
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
    });
  }
});

router.get('/conditions/list', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name
      FROM product_conditions
      ORDER BY name
    `);

    res.json({
      status: 'SUCCESS',
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
    });
  }
});

router.get('/public/list', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id, p.name, p.sku, p.selling_price, p.description, p.category_id, p.image_url, p.social_links, p.specifications,
        c.name as category_name, pc.name as condition_name,
        COALESCE(inv.quantity_available, 0)::int AS quantity_available,
        COALESCE(inv.quantity_reserved, 0)::int AS quantity_reserved,
        COALESCE(inv.quantity_damaged, 0)::int AS quantity_damaged
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_conditions pc ON p.condition_id = pc.id
      LEFT JOIN LATERAL (
        SELECT 
          COALESCE(SUM(i.quantity_available), 0) AS quantity_available,
          COALESCE(SUM(i.quantity_reserved), 0) AS quantity_reserved,
          COALESCE(SUM(i.quantity_damaged), 0) AS quantity_damaged
        FROM inventory i
        WHERE i.product_id = p.id
      ) inv ON true
      WHERE p.is_active = true
      ORDER BY p.name ASC
    `);

    res.json({
      status: 'SUCCESS',
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
    });
  }
});

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { category_id, condition_id, search, barcode } = req.query;

    let query = `
      SELECT
        p.*, c.name as category_name, pc.name as condition_name,
        COALESCE(inv.stock_total, 0) AS stock_total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_conditions pc ON p.condition_id = pc.id
      LEFT JOIN LATERAL (
        SELECT COALESCE(SUM(i.quantity_available), 0)::int AS stock_total
        FROM inventory i
        WHERE i.product_id = p.id
      ) inv ON true
      WHERE p.is_active = true
    `;

    const params = [];
    let paramCount = 1;

    if (category_id) {
      query += ` AND p.category_id = $${paramCount}`;
      params.push(category_id);
      paramCount += 1;
    }

    if (condition_id) {
      query += ` AND p.condition_id = $${paramCount}`;
      params.push(condition_id);
      paramCount += 1;
    }

    if (barcode) {
      query += `
        AND (
          LOWER(TRIM(COALESCE(p.barcode::text, ''))) = ANY($${paramCount}::text[])
          OR LOWER(TRIM(COALESCE(p.sku::text, ''))) = ANY($${paramCount}::text[])
        )
      `;
      params.push(getCodeCandidates(barcode));
      paramCount += 1;
    }

    if (search) {
      const searchCandidates = getCodeCandidates(search);
      query += ` AND (p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount} OR p.barcode ILIKE $${paramCount}`;
      params.push(`%${search}%`);
      paramCount += 1;

      if (searchCandidates.length > 1) {
        query += `
          OR LOWER(TRIM(COALESCE(p.sku::text, ''))) = ANY($${paramCount}::text[])
          OR LOWER(TRIM(COALESCE(p.barcode::text, ''))) = ANY($${paramCount}::text[])
        `;
        params.push(searchCandidates);
        paramCount += 1;
      }

      query += `)`;
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await pool.query(query, params);
    await ensureProductImagesTable(pool);

    const productIds = result.rows.map((row) => row.id);
    let groupedImages = new Map();

    if (productIds.length > 0) {
      const imagesResult = await pool.query(
        `
          SELECT product_id, image_url, sort_order, id
          FROM product_images
          WHERE product_id = ANY($1::int[])
          ORDER BY product_id, sort_order, id
        `,
        [productIds]
      );

      groupedImages = imagesResult.rows.reduce((acc, row) => {
        if (!acc.has(row.product_id)) {
          acc.set(row.product_id, []);
        }
        acc.get(row.product_id).push(row);
        return acc;
      }, new Map());
    }

    const products = result.rows.map((product) => ({
      ...product,
      images: buildImageList(product.image_url, groupedImages.get(product.id) || []),
    }));

    res.json({
      status: 'SUCCESS',
      data: products,
      count: products.length,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
        SELECT
          p.*, c.name as category_name, pc.name as condition_name,
          COALESCE(inv.stock_total, 0) AS stock_total
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_conditions pc ON p.condition_id = pc.id
        LEFT JOIN LATERAL (
          SELECT COALESCE(SUM(i.quantity_available), 0)::int AS stock_total
          FROM inventory i
          WHERE i.product_id = p.id
        ) inv ON true
        WHERE p.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Produk tidak ditemukan',
      });
    }

    await ensureProductImagesTable(pool);

    const [variantsResult, imagesResult] = await Promise.all([
      pool.query(`SELECT * FROM product_variants WHERE product_id = $1`, [id]),
      pool.query(
        `
          SELECT image_url, sort_order, id
          FROM product_images
          WHERE product_id = $1
          ORDER BY sort_order, id
        `,
        [id]
      ),
    ]);

    const product = result.rows[0];
    product.variants = variantsResult.rows;
    product.images = buildImageList(product.image_url, imagesResult.rows);

    res.json({
      status: 'SUCCESS',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
    });
  }
});

router.post('/', uploadProductImages, async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      sku,
      barcode,
      name,
      category_id,
      condition_id,
      buy_price,
      selling_price,
      description,
      specifications,
      initial_stock,
      image_url,
    } = req.body;

    const uploadedImageUrls = getUploadedImageUrls(req);
    const imageUrls = uploadedImageUrls.length > 0
      ? uploadedImageUrls
      : (image_url ? [image_url] : []);

    const parsedInitialStock = Number(initial_stock ?? 0);
    if (Number.isNaN(parsedInitialStock) || parsedInitialStock < 0) {
      await cleanupUploadedFiles(req);
      return res.status(400).json({
        status: 'ERROR',
        message: 'Stok awal tidak valid',
      });
    }

    if (!sku || !name || !category_id) {
      await cleanupUploadedFiles(req);
      return res.status(400).json({
        status: 'ERROR',
        message: 'SKU, nama, dan kategori harus diisi',
      });
    }

    const finalBarcode = barcode || sku;

    // Set default condition if not provided (1 = New/Baru)
    const finalConditionId = condition_id || 1;

    await client.query('BEGIN');
    await ensureProductImagesTable(client);

    const specificationsJson = parseSpecifications(specifications);
    const primaryImage = imageUrls[0] || null;

    const result = await client.query(
      `
        INSERT INTO products
        (sku, barcode, name, category_id, condition_id, buy_price, selling_price, description, specifications, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `,
      [
        sku,
        finalBarcode,
        name,
        category_id,
        finalConditionId,
        buy_price,
        selling_price,
        description,
        specificationsJson,
        primaryImage,
      ]
    );

    if (imageUrls.length > 0) {
      await insertProductImages(client, result.rows[0].id, imageUrls);
    }

    const warehouseResult = await client.query(`
      INSERT INTO warehouse_locations (name, description)
      VALUES ('Gudang Utama', 'Lokasi default sistem')
      ON CONFLICT (name)
      DO UPDATE SET description = warehouse_locations.description
      RETURNING id
    `);

    await client.query(
      `
        INSERT INTO inventory (product_id, warehouse_location_id, quantity_available)
        VALUES ($1, $2, $3)
        ON CONFLICT (product_id, warehouse_location_id)
        DO UPDATE SET quantity_available = EXCLUDED.quantity_available
      `,
      [result.rows[0].id, warehouseResult.rows[0].id, parsedInitialStock]
    );

    if (parsedInitialStock > 0) {
      await client.query(
        `
          INSERT INTO stock_movements
          (product_id, warehouse_location_id, movement_type, quantity, reference_type, notes, created_by)
          VALUES ($1, $2, 'STOCK_IN', $3, 'INITIAL', 'Stok awal saat buat produk', $4)
        `,
        [result.rows[0].id, warehouseResult.rows[0].id, parsedInitialStock, req.user?.id || 1]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Produk berhasil ditambahkan',
      data: {
        ...result.rows[0],
        images: imageUrls,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    await cleanupUploadedFiles(req);
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
    });
  } finally {
    client.release();
  }
});

router.put('/:id', uploadProductImages, async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { name, barcode, selling_price, buy_price, description, remove_image, social_links, specifications } = req.body;
    const shouldRemoveImage = remove_image === true || remove_image === 'true';
    const specificationsJson = parseSpecifications(specifications);
    const uploadedImageUrls = getUploadedImageUrls(req);

    // Parse social_links — bisa dikirim sebagai JSON string atau object
    let parsedSocialLinks = null;
    if (social_links !== undefined && social_links !== null && social_links !== '') {
      try {
        parsedSocialLinks = typeof social_links === 'string' ? JSON.parse(social_links) : social_links;
      } catch (_e) {
        parsedSocialLinks = null;
      }
    }

    await client.query('BEGIN');
    await ensureProductImagesTable(client);

    const existingProductResult = await client.query(
      'SELECT image_url, social_links FROM products WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (existingProductResult.rows.length === 0) {
      await client.query('ROLLBACK');
      await cleanupUploadedFiles(req);
      return res.status(404).json({
        status: 'ERROR',
        message: 'Produk tidak ditemukan',
      });
    }

    const existingImageUrl = existingProductResult.rows[0].image_url;
    const existingSocialLinks = existingProductResult.rows[0].social_links || {};

    // Merge social_links — update hanya field yang dikirim
    const finalSocialLinks = parsedSocialLinks !== null
      ? { ...existingSocialLinks, ...parsedSocialLinks }
      : existingSocialLinks;

    const existingGalleryResult = await client.query(
      `
        SELECT image_url
        FROM product_images
        WHERE product_id = $1
        ORDER BY sort_order, id
      `,
      [id]
    );

    let existingImages = existingGalleryResult.rows.map((row) => row.image_url);
    if (existingImages.length === 0 && existingImageUrl) {
      existingImages = [existingImageUrl];
    }

    let finalImages = [...existingImages];

    if (shouldRemoveImage) {
      finalImages = [];
    }

    if (uploadedImageUrls.length > 0) {
      finalImages = [...finalImages, ...uploadedImageUrls];
    }

    const primaryImage = finalImages[0] || null;

    const result = await client.query(
      `
        UPDATE products
        SET name = COALESCE($1, name),
            barcode = COALESCE($2, barcode),
            selling_price = COALESCE($3, selling_price),
            buy_price = COALESCE($4, buy_price),
            description = COALESCE($5, description),
            image_url = $6,
            social_links = $7,
            specifications = COALESCE($8, specifications),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *
      `,
      [name, barcode, selling_price, buy_price, description, primaryImage, finalSocialLinks, specificationsJson, id]
    );

    await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);
    await insertProductImages(client, id, finalImages);

    await client.query('COMMIT');

    const removedImages = existingImages.filter((url) => !finalImages.includes(url));
    await Promise.all(removedImages.map((url) => deleteIfExists(resolveUploadedFilePath(url))));

    res.json({
      status: 'SUCCESS',
      message: 'Produk berhasil diperbarui',
      data: {
        ...result.rows[0],
        images: finalImages,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    await cleanupUploadedFiles(req);
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
    });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
        UPDATE products
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Produk tidak ditemukan',
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Produk berhasil dihapus',
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
    });
  }
});

module.exports = router;
