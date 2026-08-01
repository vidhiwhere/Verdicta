const pool = require('../config/db');
const { generateAudit } = require('../services/geminiService');
const { asyncHandler } = require('../middleware/errorHandler');

const runAudit = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const sessionResult = await pool.query(
        'SELECT * FROM sessions WHERE id = $1 AND user_id = $2',
        [sessionId, req.user.id]
    );
    const session = sessionResult.rows[0];
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }

    const existing = await pool.query(
        'SELECT * FROM audit_results WHERE session_id = $1',
        [sessionId]
    );
    if (existing.rows.length > 0) {
        return res.json({ audit: existing.rows[0] });
    }

    const transcriptResult = await pool.query(
        'SELECT role, content FROM transcripts WHERE session_id = $1 ORDER BY created_at ASC',
        [sessionId]
    );

    const auditData = await generateAudit({
        caseBrief: session.case_brief,
        transcript: transcriptResult.rows,
    });

    const insertResult = await pool.query(
        `INSERT INTO audit_results (session_id, scores, strengths, weaknesses, recommendations)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
            sessionId,
            JSON.stringify(auditData.scores),
            JSON.stringify(auditData.strengths || []),
            JSON.stringify(auditData.weaknesses || []),
            JSON.stringify(auditData.recommendations || []),
        ]
    );

    await pool.query(`UPDATE sessions SET status = 'completed' WHERE id = $1`, [sessionId]);

    res.json({ audit: insertResult.rows[0] });
});

module.exports = { runAudit };