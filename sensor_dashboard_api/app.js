require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();

// Configuration CORS améliorée
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://internet-of-things-rm0l.onrender.com'] 
    : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

// Configuration PostgreSQL avec gestion SSL
const dbConfig = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 30000 // Augmenter à 30 secondes
};
const client = new Client(dbConfig);

// Connexion à la base de données
async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL avec succès');
    
    // Vérification des tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables disponibles:', res.rows.map(r => r.table_name));
    
  } catch (err) {
    console.error('❌ Erreur de connexion à PostgreSQL:', err.stack);
    process.exit(1);
  }
}

// Middleware pour injecter le client DB dans les requêtes
app.use((req, res, next) => {
  req.dbClient = client;
  next();
});

// Routes de base
app.get('/', (req, res) => {
  res.json({ 
    message: "API IoT Dashboard",
    status: "actif",
    db_connected: client._connected,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Endpoint de santé
app.get('/health', async (req, res) => {
  try {
    await client.query('SELECT 1');
    res.json({
      status: 'healthy',
      db: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      db: 'disconnected',
      error: err.message
    });
  }
});

// Chargement dynamique des routes
function loadRouteIfExists(path, routeFile) {
  try {
    const router = require(routeFile);
    // Injecter le client DB dans le router
    router.client = client;
    app.use(path, router);
    console.log(`✓ Route ${path} chargée depuis ${routeFile}`);
  } catch (err) {
    console.warn(`⚠ Route ${path} non chargée: ${err.message}`);
    app.use(path, (req, res) => {
      res.status(501).json({ 
        error: "Endpoint non implémenté",
        details: `Fichier ${routeFile} manquant ou erroné`
      });
    });
  }
}

// Chargement des routes
loadRouteIfExists('/gas_levels', './routes/gas');
loadRouteIfExists('/intrusion_logs', './routes/intrusion');
loadRouteIfExists('/rfid_logs', './routes/rfid');

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Erreur interne du serveur',
    request_id: req.id
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 API démarrée sur http://localhost:${PORT}`);
    console.log(`🔌 Points d'accès:`);
    console.log(`   - /gas_levels`);
    console.log(`   - /intrusion_logs`);
    console.log(`   - /rfid_logs`);
    console.log(`   - /health (check de santé)`);
  });
}

startServer();

// Gestion propre de la fermeture
process.on('SIGTERM', async () => {
  await client.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await client.end();
  process.exit(0);
});