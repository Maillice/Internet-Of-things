const express = require('express');
const router = express.Router();
const rfidController = require('../controllers/rfidController');
const { validateRfidData, validateIdParam } = require('../middlewares/validators');

/**
 * @swagger
 * tags:
 *   name: RFID
 *   description: Gestion des logs RFID
 */

/**
 * @swagger
 * /rfid_logs:
 *   get:
 *     summary: Liste tous les logs RFID
 *     tags: [RFID]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Liste des logs RFID
 */
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await rfidController.getAll({
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100),
      filters
    });

    res.status(200).json({
      status: 'success',
      ...result
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /rfid_logs/{id}:
 *   get:
 *     summary: Récupère un log RFID spécifique
 *     tags: [RFID]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Log RFID trouvé
 *       404:
 *         description: Log RFID non trouvé
 */
router.get('/:id', validateIdParam, async (req, res, next) => {
  try {
    const data = await rfidController.getById(req.params.id);
    if (!data) {
      return res.status(404).json({
        status: 'fail',
        message: 'Entrée RFID non trouvée'
      });
    }
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /rfid_logs:
 *   post:
 *     summary: Crée un nouveau log RFID
 *     tags: [RFID]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RfidLog'
 *     responses:
 *       201:
 *         description: Log RFID créé
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Conflit (duplicata)
 */
router.post('/', validateRfidData, async (req, res, next) => {
  try {
    const newRecord = await rfidController.create(req.body);
    res.status(201).json({
      status: 'success',
      data: newRecord,
      message: 'Entrée RFID créée avec succès'
    });
  } catch (err) {
    if (err.code === '23505') { // Code d'erreur PostgreSQL pour les doublons
      return res.status(409).json({
        status: 'error',
        message: 'Ce tag RFID existe déjà',
        details: err.detail
      });
    }
    next(err);
  }
});

/**
 * @swagger
 * /rfid_logs/{id}:
 *   put:
 *     summary: Met à jour un log RFID
 *     tags: [RFID]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RfidLog'
 *     responses:
 *       200:
 *         description: Log RFID mis à jour
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Log RFID non trouvé
 */
router.put('/:id', validateIdParam, validateRfidData, async (req, res, next) => {
  try {
    const updatedRecord = await rfidController.update(
      req.params.id,
      req.body
    );
    
    if (!updatedRecord) {
      return res.status(404).json({
        status: 'fail',
        message: 'Entrée RFID non trouvée'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: updatedRecord,
      message: 'Entrée RFID mise à jour avec succès'
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        status: 'error',
        message: 'Conflit de données',
        details: err.detail
      });
    }
    next(err);
  }
});

/**
 * @swagger
 * /rfid_logs/{id}:
 *   delete:
 *     summary: Supprime un log RFID
 *     tags: [RFID]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Log RFID supprimé
 *       404:
 *         description: Log RFID non trouvé
 */
router.delete('/:id', validateIdParam, async (req, res, next) => {
  try {
    const result = await rfidController.delete(req.params.id);
    if (!result) {
      return res.status(404).json({
        status: 'fail',
        message: 'Entrée RFID non trouvée'
      });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;