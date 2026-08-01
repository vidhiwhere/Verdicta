const express = require('express');
const { listScenarios, getScenario, generateCustomCase } = require('../controllers/case.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/scenarios', listScenarios);
router.get('/scenarios/:id', getScenario);
router.post('/generate', requireAuth, generateCustomCase);

module.exports = router;