// backend/utils/dbHelpers.js
const pool = require('../config/database');

let storeDevicesReady = false;
let activityLogsReady = false;

/**
 * Ensure store_devices table exists
 */
async function ensureStoreDevicesTable() {
  if (storeDevicesReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS store_devices (
      id SERIAL PRIMARY KEY,
      device_id VARCHAR(255) NOT NULL UNIQUE,
      device_name VARCHAR(100) NOT NULL DEFAULT 'Perangkat Toko',
      ip_address VARCHAR(45),
      registered_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  storeDevicesReady = true;
}

/**
 * Ensure activity_logs table exists
 */
async function ensureActivityLogsTable() {
  if (activityLogsReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      username VARCHAR(100),
      action VARCHAR(100) NOT NULL,
      description TEXT,
      meta JSONB,
      device_id VARCHAR(255),
      ip_address VARCHAR(45),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
  `);

  activityLogsReady = true;
}

/**
 * Log an activity to the activity_logs table
 */
async function logActivity({ userId, username, action, description, meta, deviceId, ipAddress }) {
  try {
    await ensureActivityLogsTable();
    await pool.query(
      `INSERT INTO activity_logs (user_id, username, action, description, meta, device_id, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, username, action, description, meta ? JSON.stringify(meta) : null, deviceId || null, ipAddress || null]
    );
  } catch (error) {
    // Non-blocking — log error but don't fail the request
    console.error('[ActivityLog] Failed to log activity:', error.message);
  }
}

module.exports = { ensureStoreDevicesTable, ensureActivityLogsTable, logActivity };
