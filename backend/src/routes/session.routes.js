const express = require('express');
const { createSession, getSession, listSessions } = require('../controllers/session.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.post('/', createSession);
router.get('/', listSessions);
router.get('/:id', getSession);

module.exports = router;