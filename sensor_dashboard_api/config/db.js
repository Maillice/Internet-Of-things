const { Client } = require('pg');

const client = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
});

client.connect()
  .then(() => console.log('✅ Connecté à PostgreSQL avec succès'))
  .catch((err) => console.error('❌ Erreur de connexion PostgreSQL :', err));

module.exports = client;
