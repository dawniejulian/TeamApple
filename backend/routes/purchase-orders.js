// backend/routes/purchase-orders.js
const express = require('express');
const router = express.Router();
const POController = require('../controllers/purchaseOrderController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

/**
 * Purchase Order Endpoints
 */

// Create new PO (manager/owner only)
router.post('/', requireRole('MANAGER', 'ADMIN'), POController.createPO);

// List all POs with filters
router.get('/', POController.listPOs);

// Get specific PO details
router.get('/:po_id', POController.getPODetail);

// Update PO status (manager/owner only)
router.put('/:po_id/status', requireRole('MANAGER', 'ADMIN'), POController.updatePOStatus);

// Receive items (warehouse/manager/owner)
router.post('/:po_id/receive', requireRole('STAFF', 'MANAGER', 'ADMIN'), POController.receivePOItems);

// Get low stock recommendation for new PO
router.get('/low-stock/recommend', POController.getLowStockForPO);

module.exports = router;
