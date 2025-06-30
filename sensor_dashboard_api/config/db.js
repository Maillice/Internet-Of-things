const { Pool } = require('pg');

const dbConfig = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
  ssl: process.env.PGSSL === 'true' ? { 
    rejectUnauthorized: false,
    ca: process.env.PGSSLCERT // Ajoutez ceci si nécessaire
  } : false,
  connectionTimeoutMillis: 15000, // Augmentez à 15 secondes
  idleTimeoutMillis: 30000,
  max: 3 // Réduisez le nombre max de connexions
};

const pool = new Pool(dbConfig);

// Test de connexion amélioré
pool.query('SELECT NOW()')
  .then(res => {
    console.log('✅ Connecté à PostgreSQL avec succès. Heure du serveur:', res.rows[0].now);
  })
  .catch(err => {
    console.error('❌ Échec de la connexion PostgreSQL:', err);
    process.exit(1); // Quitte en cas d'échec
  });

// Logging des événements du pool
pool.on('connect', () => console.log('👉 Nouvelle connexion établie'));
pool.on('error', err => console.error('💥 Erreur du pool:', err));

module.exports = pool;