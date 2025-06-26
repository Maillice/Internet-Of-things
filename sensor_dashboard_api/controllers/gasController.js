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
  .then(() => console.log('✅ Connecté à PostgreSQL (Gas)'))
  .catch(err => console.error('❌ Erreur connexion DB (Gas):', err));

module.exports = {
  getAll: async () => {
    try {
      console.log(`[${new Date().toISOString()}] Début getAll gas`);
      const result = await client.query('SELECT * FROM gas_levels ORDER BY timestamp DESC');
      console.log(`[${new Date().toISOString()}] Résultat getAll gas:`, result.rows);
      return result.rows;
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Erreur getAll gas:`, err);
      throw new Error('Erreur lors de la récupération des niveaux de gaz: ' + err.message);
    }
  },

  getById: async (id) => {
    try {
      console.log(`[${new Date().toISOString()}] Début getById gas:`, id);
      const result = await client.query('SELECT * FROM gas_levels WHERE id = $1', [id]);
      if (result.rows.length === 0) throw new Error('Niveau de gaz non trouvé');
      console.log(`[${new Date().toISOString()}] Résultat getById gas:`, result.rows[0]);
      return result.rows[0];
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Erreur getById gas:`, err);
      throw err;
    }
  },

  create: async ({ sensor_id, value, alert_status }) => {
    console.log(`[${new Date().toISOString()}] Début create gas:`, { sensor_id, value, alert_status });
    try {
      const query = `
        INSERT INTO gas_levels (sensor_id, value, alert_status)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const values = [sensor_id, value, alert_status];
      console.log(`[${new Date().toISOString()}] Exécution requête gas:`, query, values);
      const result = await client.query(query, values);
      console.log(`[${new Date().toISOString()}] Résultat create gas:`, result.rows[0]);
      return result.rows[0];
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Erreur create gas:`, err);
      throw new Error('Erreur lors de l\'ajout du niveau de gaz: ' + err.message);
    }
  },

 update: async (id, { sensor_id, value, alert_status }) => {
  console.log(`[${new Date().toISOString()}] Début update gas:`, id, { sensor_id, value, alert_status });
  try {
    const query = `
      UPDATE gas_levels 
      SET sensor_id=$1, value=$2, alert_status=$3
      WHERE id=$4 
      RETURNING *
    `;
    const values = [sensor_id, value, alert_status, id];
    console.log(`[${new Date().toISOString()}] Exécution requête gas:`, query, values);
    const result = await client.query(query, values);
    if (result.rows.length === 0) throw new Error('Niveau de gaz non trouvé');
    console.log(`[${new Date().toISOString()}] Résultat update gas:`, result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Erreur update gas:`, err);
    throw new Error('Erreur lors de la mise à jour du niveau de gaz: ' + err.message);
  }
},

  delete: async (id) => {
    console.log(`[${new Date().toISOString()}] Début delete gas:`, id);
    try {
      const query = `
        DELETE FROM gas_levels 
        WHERE id = $1 
        RETURNING *
      `;
      const values = [id];
      console.log(`[${new Date().toISOString()}] Exécution requête gas:`, query, values);
      const result = await client.query(query, values);
      if (result.rows.length === 0) throw new Error('Niveau de gaz non trouvé');
      console.log(`[${new Date().toISOString()}] Résultat delete gas:`, result.rows[0]);
      return result.rows[0];
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Erreur delete gas:`, err);
      throw new Error('Erreur lors de la suppression du niveau de gaz: ' + err.message);
    }
  }
};