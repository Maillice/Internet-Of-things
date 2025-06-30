const express = require('express');
const router = express.Router();
const GasController = require('../controllers/gasController');
const { validateGasData, validateIdParam } = require('../middlewares/validators');

// Instanciation du contrôleur avec un client PostgreSQL (à configurer dans votre app principale)
const client = require('../config/db'); // Exemple : importez votre client PG ici
const gasController = GasController(client);

// GET all gas levels
router.get('/', async (req, res, next) => {
  try {
    const data = await gasController.getAll();
    res.status(200).json({
      status: 'success',
      results: data.length,
      data
    });
  } catch (err) {
    next(err); // Passe l'erreur au middleware d'erreur global
  }
});

// GET specific gas level by ID
router.get('/:id', validateIdParam, async (req, res, next) => {
  try {
    const data = await gasController.getById(req.params.id);
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (err) {
    next(err);
  }
});

// POST new gas level
router.post('/', validateGasData, async (req, res, next) => {
  try {
    const newRecord = await gasController.create(req.body);
    res.status(201).json({
      status: 'success',
      data: newRecord,
      message: 'Entrée gaz créée avec succès'
    });
  } catch (err) {
    next(err);
  }
});

// PUT update gas level by ID
router.put('/:id', validateIdParam, validateGasData, async (req, res, next) => {
  try {
    const updatedRecord = await gasController.update(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: updatedRecord,
      message: 'Entrée gaz mise à jour avec succès'
    });
  } catch (err) {
    next(err);
  }
});

// DELETE gas level by ID
router.delete('/:id', validateIdParam, async (req, res, next) => {
  try {
    const deletedRecord = await gasController.delete(req.params.id);
    if (!deletedRecord) {
      return res.status(404).json({
        status: 'fail',
        message: `Aucun niveau de gaz trouvé avec l'ID ${req.params.id}`,
        data: null
      });
    }
    res.status(200).json({
      status: 'success',
      data: deletedRecord,
      message: `Niveau de gaz ID ${req.params.id} supprimé avec succès`
    });
  } catch (err) {
    next(err);
  }
});

// Middleware global d'erreur (optionnel, à ajouter dans app.js)
router.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Erreur routeur gas:`, err);
  const status = err.message.includes('non trouvé') ? 404 : 500;
  res.status(status).json({
    status: 'error',
    message: err.message
  });
});

module.exports = router;