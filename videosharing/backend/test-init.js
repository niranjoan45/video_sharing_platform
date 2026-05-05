require('dotenv').config();
const { pool, initDB } = require('./db');

initDB().then(() => {
  console.log('initDB success');
  pool.end();
}).catch(err => {
  console.error('initDB error:', err);
  pool.end();
});
