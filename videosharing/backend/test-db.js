const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE || 'videoshare',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'Sece@123',
});

pool.query('SELECT * FROM users', (err, res) => {
  if (err) {
    console.error('Query error:', err);
  } else {
    console.log('Users:', res.rows);
  }
  pool.end();
});
