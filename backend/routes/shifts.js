// backend/routes/shifts.js
const express = require('express');
const router = express.Router();
const ShiftController = require('../controllers/shiftController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

/**
 * Shift Management Endpoints
 */

// Open a new shift
router.post('/open', requireRole('STAFF', 'MANAGER', 'ADMIN'), ShiftController.openShift);

// Close a shift with reconciliation
router.put('/:shift_id/close', requireRole('STAFF', 'MANAGER', 'ADMIN'), ShiftController.closeShift);

// Get current open shift for user
router.get('/open-shift', ShiftController.getOpenShift);

// Get shift history
router.get('/history', ShiftController.getShiftHistory);

// Get shift summary/performance
router.get('/:shift_id/summary', ShiftController.getShiftSummary);

// Get daily shift report (all cashiers for a day)
router.get('/daily-report', ShiftController.getDailyReport);

module.exports = router;
