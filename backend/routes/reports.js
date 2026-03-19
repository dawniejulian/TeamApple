// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All reporting routes require authentication
router.use(authenticateToken);

/**
 * Sales Reports
 */

// Daily sales summary
router.get('/sales/daily', ReportController.getDailySales);

// Period sales (with date range)
router.get('/sales/period', ReportController.getPeriodSales);

// Product sales breakdown
router.get('/sales/products', ReportController.getProductSales);

/**
 * Cashier Reports
 */

// Cashier performance
router.get('/cashier/performance', requireRole('MANAGER', 'ADMIN'), ReportController.getCashierPerformance);

/**
 * Payment Reports
 */

// Payment method breakdown
router.get('/payments/breakdown', ReportController.getPaymentMethodReport);

/**
 * Inventory Reports
 */

// Inventory valuation
router.get('/inventory/valuation', requireRole('MANAGER', 'ADMIN'), ReportController.getInventoryValuation);

/**
 * Dashboard
 */

// Quick dashboard overview
router.get('/dashboard/overview', ReportController.getDashboardOverview);

module.exports = router;
