const { Client } = require('pg');

class RfidController {
  constructor(client) {
    this.client = client;
  }

  // Méthode privée pour la gestion des erreurs
  _handleError(action, error) {
    const errorMap = {
      '23505': 'Une entrée RFID identique existe déjà',
      '22P02': 'Format de données invalide',
      '23503': 'Violation de clé étrangère',
      'default': `Erreur lors de ${action} l'entrée RFID`
    };

    console.error(`[RFID] Erreur ${action}:`, error);
    const message = errorMap[error.code] || errorMap.default;
    const err = new Error(`${message} (${error.message})`);
    err.type = 'RFID_ERROR';
    throw err;
  }

  // Validation des données RFID
  _validateRfidData(data) {
    const { card_id, reader_id, status, location } = data;
    
    if (!card_id || !reader_id) {
      throw new Error('card_id et reader_id sont requis');
    }

    if (!['granted', 'denied', 'pending'].includes(status)) {
      throw new Error('Statut invalide (granted/denied/pending)');
    }

    return {
      card_id: card_id.toString(),
      reader_id: reader_id.toString(),
      status,
      location: location || 'inconnu'
    };
  }

  async getAll() {
    try {
      console.log('[RFID] Récupération de toutes les entrées');
      const result = await this.client.query(`
        SELECT id, card_id, reader_id, status, location, 
               to_char(timestamp, 'YYYY-MM-DD HH24:MI:SS') as timestamp 
        FROM rfid_logs 
        ORDER BY timestamp DESC
      `);
      return result.rows;
    } catch (err) {
      this._handleError('la récupération', err);
    }
  }

  async getById(id) {
    try {
      console.log(`[RFID] Recherche entrée ID: ${id}`);
      const result = await this.client.query(`
        SELECT id, card_id, reader_id, status, location,
               to_char(timestamp, 'YYYY-MM-DD HH24:MI:SS') as timestamp
        FROM rfid_logs 
        WHERE id = $1`, 
        [id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Entrée RFID non trouvée');
      }
      
      return result.rows[0];
    } catch (err) {
      this._handleError('la recherche', err);
    }
  }

  async create(data) {
    try {
      console.log('[RFID] Création nouvelle entrée:', data);
      const validatedData = this._validateRfidData(data);
      
      const result = await this.client.query(
        `INSERT INTO rfid_logs 
         (card_id, reader_id, status, location) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [
          validatedData.card_id,
          validatedData.reader_id,
          validatedData.status,
          validatedData.location
        ]
      );
      
      return result.rows[0];
    } catch (err) {
      this._handleError('la création', err);
    }
  }

  async update(id, data) {
    try {
      console.log(`[RFID] Mise à jour entrée ID: ${id}`, data);
      const validatedData = this._validateRfidData(data);
      
      const result = await this.client.query(
        `UPDATE rfid_logs 
         SET card_id = $1, reader_id = $2, status = $3, location = $4 
         WHERE id = $5 
         RETURNING *`,
        [
          validatedData.card_id,
          validatedData.reader_id,
          validatedData.status,
          validatedData.location,
          id
        ]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Entrée RFID non trouvée');
      }
      
      return result.rows[0];
    } catch (err) {
      this._handleError('la mise à jour', err);
    }
  }

  async delete(id) {
    try {
      console.log(`[RFID] Suppression entrée ID: ${id}`);
      const result = await this.client.query(
        `DELETE FROM rfid_logs 
         WHERE id = $1 
         RETURNING id, card_id`,
        [id]
      );
      
      if (result.rows.length === 0) {
        console.warn(`[RFID] Aucune entrée trouvée pour suppression ID: ${id}`);
        return null;
      }
      
      return { 
        message: 'Entrée RFID supprimée',
        deletedId: result.rows[0].id,
        cardId: result.rows[0].card_id
      };
    } catch (err) {
      this._handleError('la suppression', err);
    }
  }
}

// Factory pour l'injection de dépendance
module.exports = (client) => new RfidController(client);