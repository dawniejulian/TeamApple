const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

// Products Routes
app.use('/api/products', require('./routes/products'));

// Inventory Routes
app.use('/api/inventory', require('./routes/inventory'));

// Sales Routes
app.use('/api/sales', require('./routes/sales'));

// Dashboard Routes
app.use('/api/dashboard', require('./routes/dashboard'));

// Admin Routes
app.use('/api/admin', require('./routes/admin'));

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
