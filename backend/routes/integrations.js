const express = require('express');
const router = express.Router();

const { authenticateToken, requireRole } = require('../middleware/auth');
const { testMarketplaceConnection } = require('../controllers/integrationController');

router.use(authenticateToken);
router.use(requireRole('ADMIN', 'MANAGER'));

router.post('/marketplace/test', testMarketplaceConnection);

module.exports = router;
