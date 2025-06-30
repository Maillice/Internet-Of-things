const express = require('express');
const router = express.Router();
const RfidController = require('../controllers/rfidController');
const { validateRfidData, validateIdParam } = require('../middlewares/validators');

// Utiliser le client injecté via req.dbClient (pas d'importation de config/db)
router.use((req, res, next) => {
  req.rfidController = RfidController(req.dbClient); // Instancier avec le client de la requête
  next();
});

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
 *     summary: Liste tous les logs RFID avec pagination
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
 *       500:
 *         description: Erreur serveur
 */
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const data = await rfidController.getAll();
    const start = (page - 1) * limit;
    const paginatedData = data.slice(start, start + limit);
    res.status(200).json({
      status: 'success',
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100),
      total: data.length,
      data: paginatedData
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
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', validateIdParam, async (req, res, next) => {
  try {
    const data = await rfidController.getById(req.params.id);
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
 *             type: object
 *             properties:
 *               card_id:
 *                 type: string
 *               reader_id:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [granted, denied, pending]
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Log RFID créé
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Conflit (duplicata)
 *       500:
 *         description: Erreur serveur
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
    if (err.code === '23505') {
      return res.status(409).json({
        status: 'error',
        message: 'Ce tag RFID existe déjà',
        details: err.message
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
 *             type: object
 *             properties:
 *               card_id:
 *                 type: string
 *               reader_id:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [granted, denied, pending]
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Log RFID mis à jour
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Log RFID non trouvé
 *       409:
 *         description: Conflit de données
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', validateIdParam, validateRfidData, async (req, res, next) => {
  try {
    const updatedRecord = await rfidController.update(req.params.id, req.body);
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
        details: err.message
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
 *       500:
 *         description: Erreur serveur
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
    res.status(204).json(); // Utilisation de 204 avec réponse vide
  } catch (err) {
    next(err);
  }
});

// Middleware global d'erreur
router.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Erreur routeur RFID:`, err);
  const status = err.message.includes('non trouvée') ? 404 : 500;
  res.status(status).json({
    status: 'error',
    message: err.message
  });
});

module.exports = router;