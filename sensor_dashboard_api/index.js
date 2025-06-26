require('dotenv').config(); // Charge les variables d'environnement depuis .env

console.log('Mot de passe :', typeof process.env.PGPASSWORD, process.env.PGPASSWORD);

const { Client } = require('pg');

// Configuration de la connexion PostgreSQL avec les variables d'environnement
const client = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
});

async function main() {
  try {
    // Connexion à la base PostgreSQL
    await client.connect();
    console.log('✅ Connexion réussie à PostgreSQL');

    // Insertion d'un enregistrement dans gas_levels
    await client.query(`
      INSERT INTO gas_levels (sensor_id, value, alert_status)
      VALUES ('MQ135', 45.7, 'normal');
    `);

    // Insertion d'un enregistrement dans intrusion_logs
    await client.query(`
      INSERT INTO intrusion_logs (sensor_id, detection, alert_status)
      VALUES ('Sensor123', true, 'alert');
    `);

    // Insertion d'un enregistrement dans rfid_logs
    await client.query(`
      INSERT INTO rfid_logs (card_id, reader_id, status, location)
      VALUES ('CARD456', 'Reader789', 'authorized', 'Entrée principale');
    `);

    // Sélection et affichage des données de gas_levels
    const gasLevels = await client.query('SELECT * FROM gas_levels');
    console.log('📋 Données gas_levels :', gasLevels.rows);

    // Sélection et affichage des données de intrusion_logs
    const intrusionLogs = await client.query('SELECT * FROM intrusion_logs');
    console.log('📋 Données intrusion_logs :', intrusionLogs.rows);

    // Sélection et affichage des données de rfid_logs
    const rfidLogs = await client.query('SELECT * FROM rfid_logs');
    console.log('📋 Données rfid_logs :', rfidLogs.rows);

  } catch (err) {
    // Affiche les erreurs éventuelles
    console.error('❌ Erreur PostgreSQL :', err);
  } finally {
    // Ferme la connexion proprement
    await client.end();
  }
}

main();
