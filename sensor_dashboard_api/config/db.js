const { Client } = require('pg');
require('dotenv').config();

// Configuration améliorée avec gestion d'erreur renforcée
const dbConfig = {
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`,
  ssl: {
    rejectUnauthorized: false,  // Obligatoire pour Render
    require: true              // Force l'utilisation de SSL
  },
  connectionTimeoutMillis: 30000,  // Timeout augmenté à 30s
  query_timeout: 20000,            // Timeout pour les requêtes
  statement_timeout: 20000         // Timeout pour les statements
};

const client = new Client(dbConfig);

// Mécanisme de connexion avec reconnexion automatique
async function connectDB(maxRetries = 3, retryDelay = 5000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Tentative de connexion ${attempt}/${maxRetries}...`);
      await client.connect();
      
      // Vérification active de la connexion
      const res = await client.query('SELECT NOW() AS db_time');
      console.log('✅ Connecté à PostgreSQL avec succès');
      console.log(`🕒 Heure du serveur DB: ${res.rows[0].db_time}`);
      
      // Vérification des tables
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      console.log('📊 Tables disponibles:', tables.rows.map(r => r.table_name));
      
      return client;
    } catch (err) {
      console.error(`❌ Échec de la tentative ${attempt}:`, err.message);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Nouvelle tentative dans ${retryDelay/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        // Réinitialisation du client si la connexion a échoué
        if (client._connected) {
          await client.end();
        }
        client = new Client(dbConfig); // Recréation du client
      } else {
        throw new Error(`Échec de connexion après ${maxRetries} tentatives: ${err.message}`);
      }
    }
  }
}

// Gestion des erreurs de connexion inattendues
client.on('error', (err) => {
  console.error('💥 Erreur inattendue du client PostgreSQL:', err);
});

// Export avec vérification de connexion
module.exports = {
  connectDB,
  getClient: () => {
    if (!client._connected) {
      throw new Error('Client PostgreSQL non connecté');
    }
    return client;
  }
};