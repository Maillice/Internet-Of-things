const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'sensor_dashboard',
  password: process.env.PGPASSWORD || 'iot123',
  port: parseInt(process.env.PGPORT) || 5432,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20, // Nombre max de connexions
  idleTimeoutMillis: 30000
});

// Test automatique au démarrage
pool.query('SELECT NOW()')
  .then(res => console.log(`✅ PostgreSQL connecté (${res.rows[0].now})`))
  .catch(err => {
    console.error('❌ Erreur PostgreSQL:', err.message);
    process.exit(1);
  });

module.exports = {
  query: (text, params) => pool.query(text, params),
  end: () => pool.end()
};