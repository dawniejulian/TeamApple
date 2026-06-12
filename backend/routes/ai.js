const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// Batasi hanya role operasional yang valid di sistem
router.post('/ask', requireRole('ADMIN', 'MANAGER', 'STAFF', 'VIEWER'), AIController.askAssistant);

module.exports = router;
