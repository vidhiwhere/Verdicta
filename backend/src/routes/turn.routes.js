const express = require('express');
const { submitTurn } = require('../controllers/turn.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, submitTurn);

module.exports = router;