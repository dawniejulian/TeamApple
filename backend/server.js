const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded product images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS
const frontendOrigins = (process.env.FRONTEND_URL || 'http://localhost:3001')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const extraProtocolOrigins = frontendOrigins.flatMap(origin => {
  if (!origin.includes('://')) return [origin];
  if (origin.startsWith('http://')) {
    return [origin, origin.replace('http://', 'https://')];
  }
  if (origin.startsWith('https://')) {
    return [origin, origin.replace('https://', 'http://')];
  }
  return [origin];
});

// Add localhost variants for Docker internal networking
const corsOrigins = [
  ...new Set([
    ...frontendOrigins,
    ...extraProtocolOrigins,
    'http://localhost:3000',      // Docker internal frontend port
    'http://localhost:3001',      // Host binding
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://frontend:3000',       // Docker network service name
  ])
];

const privateNetworkOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (corsOrigins.includes(origin) || privateNetworkOriginPattern.test(origin)) {
      return callback(null, true);
    }
    console.warn(`⚠️ CORS warning: ${origin} not in allowed list`);
    // In production, reject. In dev, allow with warning
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Kasirin API Server Running',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// API ROUTES (Placeholder)
// ============================================================================

// Auth Routes
app.use('/api/auth', require('./routes/auth'));

// Users Routes
app.use('/api/users', require('./routes/users'));

// Products Routes
app.use('/api/products', require('./routes/products'));

// Inventory Routes
app.use('/api/inventory', require('./routes/inventory'));

// Shifts Routes
app.use('/api/shifts', require('./routes/shifts'));

// Purchase Orders Routes
app.use('/api/purchase-orders', require('./routes/purchase-orders'));

// Sales Routes
app.use('/api/sales', require('./routes/sales'));

// Reports Routes
app.use('/api/reports', require('./routes/reports'));

// Dashboard Routes
app.use('/api/dashboard', require('./routes/dashboard'));

// AI Assistant Routes
app.use('/api/ai', require('./routes/ai'));

// Admin Routes
app.use('/api/admin', require('./routes/admin'));

// Store Devices Routes
app.use('/api/devices', require('./routes/devices'));

// Activity Logs Routes
app.use('/api/activity-logs', require('./routes/activity-logs'));

// Integrations Routes
app.use('/api/integrations', require('./routes/integrations'));

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'ERROR',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    status: 'ERROR',
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Kasirin API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
