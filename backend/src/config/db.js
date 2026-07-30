const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : false,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle Postgres client', err);
    process.exit(-1);
});

module.exports = pool;