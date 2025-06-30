const express = require('express');
const router = express.Router();
const IntrusionController = require('../controllers/intrusionController');
const { validateIntrusionData, validateIdParam } = require('../middlewares/validators');

// Instanciation du contrôleur avec un client PostgreSQL (à configurer dans votre app principale)
const client = require('../config/db'); // Exemple : importez votre client PG ici
const intrusionController = IntrusionController(client);

// GET all intrusion logs
router.get('/', async (req, res, next) => {
  try {
    const data = await intrusionController.getAll();
    res.status(200).json({
      status: 'success',
      count: data.length,
      data
    });
  } catch (err) {
    next(err);
  }
});

// GET specific intrusion log by ID
router.get('/:id', validateIdParam, async (req, res, next) => {
  try {
    const data = await intrusionController.getById(req.params.id);
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (err) {
    next(err);
  }
});

// POST new intrusion log
router.post('/', validateIntrusionData, async (req, res, next) => {
  try {
    const newRecord = await intrusionController.create(req.body);
    res.status(201).json({
      status: 'success',
      data: newRecord,
      message: 'Entrée intrusion créée avec succès'
    });
  } catch (err) {
    next(err);
  }
});

// PUT update intrusion log by ID
router.put('/:id', validateIdParam, validateIntrusionData, async (req, res, next) => {
  try {
    const updatedRecord = await intrusionController.update(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: updatedRecord,
      message: 'Entrée intrusion mise à jour avec succès'
    });
  } catch (err) {
    next(err);
  }
});

// DELETE intrusion log by ID
router.delete('/:id', validateIdParam, async (req, res, next) => {
  try {
    const deletedRecord = await intrusionController.delete(req.params.id);
    if (!deletedRecord) {
      return res.status(404).json({
        status: 'fail',
        message: `Aucun log d'intrusion trouvé avec l'ID ${req.params.id}`,
        data: null
      });
    }
    res.status(200).json({ // Utilisation de 200 avec réponse au lieu de 204
      status: 'success',
      data: deletedRecord,
      message: `Log d'intrusion ID ${req.params.id} supprimé avec succès`
    });
  } catch (err) {
    next(err);
  }
});

// Middleware global d'erreur
router.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Erreur routeur intrusion:`, err);
  const status = err.message.includes('non trouvé') ? 404 : 500;
  res.status(status).json({
    status: 'error',
    message: err.message
  });
});

module.exports = router;