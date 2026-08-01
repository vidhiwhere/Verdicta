const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

const createSession = asyncHandler(async (req, res) => {
    const { mode, caseTitle, caseBrief, jurisdiction } = req.body;

    if (!['standard', 'generative'].includes(mode)) {
        return res.status(400).json({ error: "mode must be 'standard' or 'generative'" });
    }

    const result = await pool.query(
        `INSERT INTO sessions (user_id, mode, case_title, case_brief, jurisdiction)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.user.id, mode, caseTitle || null, caseBrief || null, jurisdiction || null]
    );

    res.status(201).json({ session: result.rows[0] });
});

const getSession = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const sessionResult = await pool.query(
        'SELECT * FROM sessions WHERE id = $1 AND user_id = $2',
        [id, req.user.id]
    );
    if (sessionResult.rows.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
    }

    const transcriptResult = await pool.query(
        'SELECT role, content, created_at FROM transcripts WHERE session_id = $1 ORDER BY created_at ASC',
        [id]
    );

    res.json({
        session: sessionResult.rows[0],
        transcript: transcriptResult.rows,
    });
});

const listSessions = asyncHandler(async (req, res) => {
    const result = await pool.query(
        'SELECT * FROM sessions WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user.id]
    );
    res.json({ sessions: result.rows });
});

module.exports = { createSession, getSession, listSessions };