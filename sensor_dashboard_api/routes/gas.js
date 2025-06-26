const express = require('express');
const router = express.Router();
const gasController = require('../controllers/gasController');
const { validateGasData, validateIdParam } = require('../middlewares/validators');

// GET all gas levels
router.get('/', async (req, res, next) => {
  try {
    const data = await gasController.getAll();
    res.json({
      status: 'success',
      results: data.length,
      data
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Erreur GET /gas_levels:`, err);
    next(err);
  }
});

// GET specific gas level
router.get('/:id', validateIdParam, async (req, res, next) => {
  try {
    const data = await gasController.getById(req.params.id);
    res.json({
      status: 'success',
      data
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Erreur GET /gas_levels/:id:`, err);
    next(err);
  }
});

// POST new gas level
router.post('/', validateGasData, async (req, res, next) => {
  try {
    console.log(`[${new Date().toISOString()}] Requête POST /gas_levels reçue:`, req.body);
    const newRecord = await gasController.create(req.body);
    res.status(201).json({
      status: 'success',
      data: newRecord,
      message: 'Entrée gaz créée avec succès'
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Erreur POST /gas_levels:`, err);
    next(err);
  }
});

// UPDATE gas level
router.put('/:id', validateIdParam, validateGasData, async (req, res, next) => {
  try {
    console.log(`[${new Date().toISOString()}] Requête PUT /gas_levels/:id reçue:`, req.params.id, req.body);
    const updatedRecord = await gasController.update(req.params.id, req.body);
    res.json({
      status: 'success',
      data: updatedRecord,
      message: 'Entrée gaz mise à jour avec succès'
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Erreur PUT /gas_levels/:id:`, err);
    next(err);
  }
});

// DELETE gas level
router.delete('/:id', validateIdParam, async (req, res, next) => {
  try {
    console.log(`[${new Date().toISOString()}] Requête DELETE /gas_levels/:id reçue:`, req.params.id);
    const deletedRecord = await gasController.delete(req.params.id);
    res.status(200).json({
      status: 'success',
      data: deletedRecord,
      message: 'Entrée gaz supprimée avec succès'
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Erreur DELETE /gas_levels/:id:`, err);
    next(err);
  }
});

module.exports = router;
