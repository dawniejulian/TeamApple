// backend/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'kasirin_db',
  user: process.env.DB_USER || 'postgres',
  // always pass a string for password; pg will complain if it's undefined
  password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : '',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;
