const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

function signToken(user) {
    return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
}

const register = asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
        [email, passwordHash, name || null]
    );

    const user = result.rows[0];
    const token = signToken(user);
    res.status(201).json({ user, token });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);
    res.json({
        user: { id: user.id, email: user.email, name: user.name, created_at: user.created_at },
        token,
    });
});

const me = asyncHandler(async (req, res) => {
    const result = await pool.query(
        'SELECT id, email, name, created_at FROM users WHERE id = $1',
        [req.user.id]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
});

module.exports = { register, login, me };