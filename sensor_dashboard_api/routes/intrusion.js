const express = require('express');
const router = express.Router();
const intrusionController = require('../controllers/intrusionController');
const { validateIntrusionData, validateIdParam } = require('../middlewares/validators');

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
    console.error(`[${new Date().toISOString()}] Erreur GET /intrusion_logs:`, err);
    next(err);
  }
});

// GET specific intrusion log
router.get('/:id', validateIdParam, async (req, res, next) => {
  try {
    const data = await intrusionController.getById(req.params.id);
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Erreur GET /intrusion_logs/:id:`, err);
    next(err);
  }
});

// POST new intrusion log
router.post('/', validateIntrusionData, async (req, res, next) => {
  try {
    console.log(`[${new Date().toISOString()}] Requête POST /intrusion_logs reçue:`, req.body);
    const newRecord = await intrusionController.create(req.body);
    res.status(201).json({
      status: 'success',
      data: newRecord,
      message: 'Entrée intrusion créée avec succès'
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Erreur POST /intrusion_logs:`, err);
    next(err);
  }
});

// UPDATE intrusion log
router.put('/:id', validateIdParam, validateIntrusionData, async (req, res, next) => {
  try {
    console.log(`[${new Date().toISOString()}] Requête PUT /intrusion_logs/:id reçue:`, req.params.id, req.body);
    const updatedRecord = await intrusionController.update(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: updatedRecord,
      message: 'Entrée intrusion mise à jour avec succès'
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Erreur PUT /intrusion_logs/:id:`, err);
    next(err);
  }
});

// DELETE intrusion log
router.delete('/:id', validateIdParam, async (req, res, next) => {
  try {
    console.log(`[${new Date().toISOString()}] Requête DELETE /intrusion_logs/:id reçue:`, req.params.id);
    const result = await intrusionController.delete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
      message: 'Entrée intrusion supprimée avec succès'
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Erreur DELETE /intrusion_logs/:id:`, err);
    next(err);
  }
});

module.exports = router;