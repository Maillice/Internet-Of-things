// controllers/gasController.js
const { Client } = require('pg');

class GasController {
  constructor(client) {
    this.client = client;
  }

  async getAll() {
    try {
      console.log(`[${new Date().toISOString()}] Début getAll gas`);
      const result = await this.client.query(
        'SELECT * FROM gas_levels ORDER BY timestamp DESC'
      );
      console.log(`[${new Date().toISOString()}] ${result.rows.length} résultats trouvés`);
      return result.rows;
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Erreur getAll gas:`, err);
      throw this._createError('récupération', err);
    }
  }

  async getById(id) {
    try {
      console.log(`[${new Date().toISOString()}] Recherche gas ID: ${id}`);
      const result = await this.client.query(
        'SELECT * FROM gas_levels WHERE id = $1', 
        [id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Niveau de gaz non trouvé');
      }
      
      return result.rows[0];
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Erreur getById:`, err);
      throw this._createError('recherche', err);
    }
  }

  async create(data) {
    const { sensor_id, value, alert_status } = data;
    try {
      console.log(`[${new Date().toISOString()}] Création gas:`, data);
      const query = `
        INSERT INTO gas_levels (sensor_id, value, alert_status)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const result = await this.client.query(query, [
        sensor_id, 
        value, 
        alert_status
      ]);
      return result.rows[0];
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Erreur création:`, err);
      throw this._createError('création', err);
    }
  }

  async update(id, data) {
    const { sensor_id, value, alert_status } = data;
    try {
      console.log(`[${new Date().toISOString()}] Mise à jour gas ID ${id}:`, data);
      const query = `
        UPDATE gas_levels 
        SET sensor_id = $1, value = $2, alert_status = $3
        WHERE id = $4
        RETURNING *
      `;
      const result = await this.client.query(query, [
        sensor_id,
        value,
        alert_status,
        id
      ]);
      
      if (result.rows.length === 0) {
        throw new Error('Niveau de gaz non trouvé');
      }
      
      return result.rows[0];
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Erreur mise à jour:`, err);
      throw this._createError('mise à jour', err);
    }
  }

  async delete(id) {
    try {
      console.log(`[${new Date().toISOString()}] Suppression gas ID: ${id}`);
      const query = `
        DELETE FROM gas_levels 
        WHERE id = $1
        RETURNING *
      `;
      const result = await this.client.query(query, [id]);
      
      if (result.rows.length === 0) {
        console.warn(`[${new Date().toISOString()}] Aucun gas trouvé pour suppression: ${id}`);
        return null;
      }
      
      return result.rows[0];
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Erreur suppression:`, err);
      throw this._createError('suppression', err);
    }
  }

  _createError(action, originalError) {
    const errorMap = {
      '23505': 'Un enregistrement avec ces valeurs existe déjà',
      '22P02': 'Format de données invalide',
      default: `Erreur lors de la ${action} du niveau de gaz`
    };

    const code = originalError.code || 'default';
    const message = errorMap[code] || errorMap.default;
    
    return new Error(`${message} (${originalError.message})`);
  }
}

// Version alternative pour l'export si vous préférez une fonction factory
module.exports = (client) => {
  return new GasController(client);
};

// Ou export direct si vous instanciez ailleurs
// module.exports = GasController;