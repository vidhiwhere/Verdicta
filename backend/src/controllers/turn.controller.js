const pool = require('../config/db');
const { getCourtroomResponse } = require('../services/geminiService');
const { asyncHandler } = require('../middleware/errorHandler');

const submitTurn = asyncHandler(async (req, res) => {
    const { sessionId, userArgument } = req.body;
    if (!sessionId || !userArgument) {
        return res.status(400).json({ error: 'sessionId and userArgument are required' });
    }

    const sessionResult = await pool.query(
        'SELECT * FROM sessions WHERE id = $1 AND user_id = $2',
        [sessionId, req.user.id]
    );
    const session = sessionResult.rows[0];
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    if (session.status !== 'active') {
        return res.status(400).json({ error: `Session is ${session.status}, not active` });
    }

    await pool.query(
        `INSERT INTO transcripts (session_id, role, content) VALUES ($1, 'user', $2)`,
        [sessionId, userArgument]
    );

    let aiTurn;
    if (session.mode === 'generative') {
        const transcriptResult = await pool.query(
            'SELECT role, content FROM transcripts WHERE session_id = $1 ORDER BY created_at ASC',
            [sessionId]
        );

        aiTurn = await getCourtroomResponse({
            caseBrief: session.case_brief,
            jurisdiction: session.jurisdiction,
            transcript: transcriptResult.rows,
            userArgument,
        });
    } else {
        // TODO: replace with real branch-dialogue lookup from mockScenarios
        aiTurn = {
            role: 'judge',
            content: 'Offline mode branch dialogue not yet wired up for this case.',
        };
    }

    await pool.query(
        `INSERT INTO transcripts (session_id, role, content) VALUES ($1, $2, $3)`,
        [sessionId, aiTurn.role, aiTurn.content]
    );

    res.json({ response: aiTurn });
});

module.exports = { submitTurn };