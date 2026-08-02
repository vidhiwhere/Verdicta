require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const sessionRoutes = require('./routes/session.routes');
const caseRoutes = require('./routes/case.routes');
const turnRoutes = require('./routes/turn.routes');
const auditRoutes = require('./routes/audit.routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/case', caseRoutes);
app.use('/api/turn', turnRoutes);
app.use('/api/audit', auditRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

module.exports = app;