const express = require('express');
const { runAudit } = require('../controllers/audit.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/:sessionId', requireAuth, runAudit);

module.exports = router;