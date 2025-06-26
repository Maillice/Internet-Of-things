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
  .then(() => console.log('✅ Connecté à PostgreSQL (Intrusion)'))
  .catch(err => console.error('❌ Erreur connexion DB (Intrusion):', err));

module.exports = {
  getAll: async () => {
    try {
      console.log(`[${new Date().toISOString()}] Début getAll intrusion`);
      const result = await client.query('SELECT * FROM intrusion_logs ORDER BY timestamp DESC');
      console.log(`[${new Date().toISOString()}] Résultat getAll intrusion:`, result.rows);
      return result.rows;
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Erreur getAll intrusion:`, err);
      throw new Error('Erreur lors de la récupération des logs d\'intrusion');
    }
  },

  getById: async (id) => {
    try {
      console.log(`[${new Date().toISOString()}] Début getById intrusion:`, id);
      const result = await client.query('SELECT * FROM intrusion_logs WHERE id = $1', [id]);
      if (result.rows.length === 0) throw new Error('Log d\'intrusion non trouvé');
      console.log(`[${new Date().toISOString()}] Résultat getById intrusion:`, result.rows[0]);
      return result.rows[0];
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Erreur getById intrusion:`, err);
      throw err;
    }
  },

  create: async ({ sensor_id, detection, alert_status }) => {
    console.log(`[${new Date().toISOString()}] Début create intrusion:`, { sensor_id, detection, alert_status });
    try {
      // Convertir detection en booléen
      const detectionBoolean = detection === 'detected' ? true : detection === 'cleared' ? false : null;
      if (detectionBoolean === null) {
        throw new Error('Valeur de detection invalide');
      }
      const query = `
        INSERT INTO intrusion_logs (sensor_id, detection, alert_status)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const values = [sensor_id, detectionBoolean, alert_status];
      console.log(`[${new Date().toISOString()}] Exécution requête intrusion:`, query, values);
      const result = await client.query(query, values);
      console.log(`[${new Date().toISOString()}] Résultat create intrusion:`, result.rows[0]);
      return result.rows[0];
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Erreur create intrusion:`, err);
      throw new Error('Erreur lors de l\'ajout du log d\'intrusion: ' + err.message);
    }
  },

  update: async (id, { sensor_id, detection, alert_status }) => {
    console.log(`[${new Date().toISOString()}] Début update intrusion:`, id, { sensor_id, detection, alert_status });
    try {
      // Convertir detection en booléen
      const detectionBoolean = detection === 'detected' ? true : detection === 'cleared' ? false : null;
      if (detectionBoolean === null) {
        throw new Error('Valeur de detection invalide');
      }
      const query = `
        UPDATE intrusion_logs 
        SET sensor_id=$1, detection=$2, alert_status=$3
        WHERE id=$4 
        RETURNING *
      `;
      const values = [sensor_id, detectionBoolean, alert_status, id];
      console.log(`[${new Date().toISOString()}] Exécution requête intrusion:`, query, values);
      const result = await client.query(query, values);
      if (result.rows.length === 0) throw new Error('Log d\'intrusion non trouvé');
      console.log(`[${new Date().toISOString()}] Résultat update intrusion:`, result.rows[0]);
      return result.rows[0];
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Erreur update intrusion:`, err);
      throw err;
    }
  },

  delete: async (id) => {
    console.log(`[${new Date().toISOString()}] Début delete intrusion:`, id);
    try {
      const result = await client.query(
        'DELETE FROM intrusion_logs WHERE id = $1 RETURNING *',
        [id]
      );
      if (result.rows.length === 0) throw new Error('Log d\'intrusion non trouvé');
      console.log(`[${new Date().toISOString()}] Résultat delete intrusion:`, result.rows[0]);
      return result.rows[0];
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Erreur delete intrusion:`, err);
      throw err;
    }
  }
};