const { Client } = require('pg');

const client = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Connexion à la DB
client.connect()
  .then(() => console.log('✅ Connecté à PostgreSQL (RFID)'))
  .catch(err => console.error('❌ Erreur connexion DB (RFID):', err));

module.exports = {
  getAll: async () => {
    try {
      console.log('Début getAll'); // Log
      const result = await client.query('SELECT * FROM rfid_logs ORDER BY timestamp DESC');
      console.log('Résultat getAll:', result.rows); // Log
      return result.rows;
    } catch (err) {
      console.error('Erreur getAll:', err);
      throw new Error('Erreur lors de la récupération');
    }
  },

  getById: async (id) => {
    try {
      console.log('Début getById:', id); // Log
      const result = await client.query('SELECT * FROM rfid_logs WHERE id = $1', [id]);
      if (result.rows.length === 0) throw new Error('Non trouvé');
      console.log('Résultat getById:', result.rows[0]); // Log
      return result.rows[0];
    } catch (err) {
      console.error('Erreur getById:', err);
      throw err;
    }
  },

  create: async ({ card_id, reader_id, status, location }) => {
    console.log('Début create:', { card_id, reader_id, status, location }); // Log début
    try {
      const query = `
        INSERT INTO rfid_logs (card_id, reader_id, status, location)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const values = [card_id, reader_id, status, location];
      console.log('Exécution requête:', query, values); // Log avant requête
      const result = await client.query(query, values);
      console.log('Résultat create:', result.rows[0]); // Log après requête
      return result.rows[0];
    } catch (err) {
      console.error('Erreur create:', err); // Log erreur
      throw new Error('Erreur d\'insertion: ' + err.message);
    }
  },

  update: async (id, { card_id, reader_id, status, location }) => {
    try {
      console.log('Début update:', id, { card_id, reader_id, status, location }); // Log
      const result = await client.query(
        'UPDATE rfid_logs SET card_id=$1, reader_id=$2, status=$3, location=$4 WHERE id=$5 RETURNING *',
        [card_id, reader_id, status, location, id]
      );
      if (result.rows.length === 0) throw new Error('Non trouvé');
      console.log('Résultat update:', result.rows[0]); // Log
      return result.rows[0];
    } catch (err) {
      console.error('Erreur update:', err);
      throw new Error('Erreur de mise à jour');
    }
  },

  delete: async (id) => {
    try {
      console.log('Début delete:', id); // Log
      const result = await client.query('DELETE FROM rfid_logs WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) throw new Error('Non trouvé');
      console.log('Résultat delete:', result.rows[0]); // Log
      return 'Supprimé';
    } catch (err) {
      console.error('Erreur delete:', err);
      throw new Error('Erreur de suppression');
    }
  }
};