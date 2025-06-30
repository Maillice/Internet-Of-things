const { Client } = require('pg');

class IntrusionController {
  constructor(client) {
    this.client = client;
  }

  // Convertit les valeurs de détection en booléen
  _parseDetection(detection) {
    const detectionMap = {
      'detected': true,
      'cleared': false,
      'true': true,
      'false': false,
      true: true,
      false: false
    };

    if (detection in detectionMap) {
      return detectionMap[detection];
    }
    throw new Error("Valeur de détection invalide. Utilisez 'detected'/'cleared' ou true/false");
  }

  // Gestion centralisée des erreurs
  _handleError(action, error) {
    const errorMessages = {
      '23505': 'Un log identique existe déjà',
      '22P02': 'Format de données invalide',
      'default': `Erreur lors de ${action} le log d'intrusion`
    };

    console.error(`[${new Date().toISOString()}] Erreur ${action}:`, error);
    const message = errorMessages[error.code] || errorMessages.default;
    throw new Error(`${message} (${error.message})`);
  }

  async getAll() {
    try {
      console.log(`[${new Date().toISOString()}] Récupération de tous les logs d'intrusion`);
      const result = await this.client.query(
        'SELECT * FROM intrusion_logs ORDER BY timestamp DESC'
      );
      return result.rows;
    } catch (err) {
      this._handleError('la récupération', err);
    }
  }

  async getById(id) {
    try {
      console.log(`[${new Date().toISOString()}] Recherche intrusion ID: ${id}`);
      const result = await this.client.query(
        'SELECT * FROM intrusion_logs WHERE id = $1', 
        [id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Log d\'intrusion non trouvé');
      }
      
      return result.rows[0];
    } catch (err) {
      this._handleError('la recherche', err);
    }
  }

  async create(data) {
    const { sensor_id, detection, alert_status } = data;
    
    try {
      console.log(`[${new Date().toISOString()}] Création log intrusion:`, data);
      const detectionBoolean = this._parseDetection(detection);
      
      const result = await this.client.query(
        `INSERT INTO intrusion_logs 
         (sensor_id, detection, alert_status) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [sensor_id, detectionBoolean, alert_status]
      );
      
      return result.rows[0];
    } catch (err) {
      this._handleError('la création', err);
    }
  }

  async update(id, data) {
    const { sensor_id, detection, alert_status } = data;
    
    try {
      console.log(`[${new Date().toISOString()}] Mise à jour intrusion ID ${id}:`, data);
      const detectionBoolean = this._parseDetection(detection);
      
      const result = await this.client.query(
        `UPDATE intrusion_logs 
         SET sensor_id = $1, detection = $2, alert_status = $3 
         WHERE id = $4 
         RETURNING *`,
        [sensor_id, detectionBoolean, alert_status, id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Log d\'intrusion non trouvé');
      }
      
      return result.rows[0];
    } catch (err) {
      this._handleError('la mise à jour', err);
    }
  }

  async delete(id) {
    try {
      console.log(`[${new Date().toISOString()}] Suppression intrusion ID: ${id}`);
      const result = await this.client.query(
        `DELETE FROM intrusion_logs 
         WHERE id = $1 
         RETURNING *`,
        [id]
      );
      
      if (result.rows.length === 0) {
        console.warn(`[${new Date().toISOString()}] Aucun log trouvé pour suppression: ${id}`);
        return null;
      }
      
      return result.rows[0];
    } catch (err) {
      this._handleError('la suppression', err);
    }
  }
}

module.exports = (client) => new IntrusionController(client);