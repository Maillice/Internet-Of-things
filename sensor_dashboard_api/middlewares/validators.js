exports.validateGasData = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Validation gasData:`, req.body);
  const { sensor_id, value, alert_status } = req.body;
  if (!sensor_id) {
    return res.status(400).json({
      status: 'error',
      message: 'Le champ sensor_id est requis'
    });
  }
  if (value == null || isNaN(value)) {
    return res.status(400).json({
      status: 'error',
      message: 'Le champ value est invalide ou manquant'
    });
  }
  if (!alert_status) {
    return res.status(400).json({
      status: 'error',
      message: 'Le champ alert_status est requis'
    });
  }
  const validAlertStatuses = ['normal', 'warning', 'critical'];
  if (!validAlertStatuses.includes(alert_status)) {
    return res.status(400).json({
      status: 'error',
      message: `alert_status doit être l'une des valeurs suivantes : ${validAlertStatuses.join(', ')}`
    });
  }
  if (value < 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Le champ value doit être positif'
    });
  }
  next();
};

exports.validateIdParam = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Validation idParam:`, req.params.id);
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'L\'ID doit être un nombre positif'
    });
  }
  req.params.id = id;
  next();
};
exports.validateRfidData = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Validation rfidData:`, req.body);
  const { card_id, reader_id, status } = req.body;
  if (!card_id) {
    return res.status(400).json({
      status: 'error',
      message: 'Le champ card_id est requis'
    });
  }
  if (!reader_id) {
    return res.status(400).json({
      status: 'error',
      message: 'Le champ reader_id est requis'
    });
  }
  if (!status) {
    return res.status(400).json({
      status: 'error',
      message: 'Le champ status est requis'
    });
  }
  next();
};

exports.validateIntrusionData = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Validation intrusionData:`, req.body);
  const { sensor_id, detection, alert_status } = req.body;
  if (!sensor_id) {
    return res.status(400).json({
      status: 'error',
      message: 'Le champ sensor_id est requis'
    });
  }
  if (!detection) {
    return res.status(400).json({
      status: 'error',
      message: 'Le champ detection est requis'
    });
  }
  if (!alert_status) {
    return res.status(400).json({
      status: 'error',
      message: 'Le champ alert_status est requis'
    });
  }
  const validDetections = ['detected', 'cleared'];
  if (!validDetections.includes(detection)) {
    return res.status(400).json({
      status: 'error',
      message: `detection doit être l'une des valeurs suivantes : ${validDetections.join(', ')}`
    });
  }
  const validAlertStatuses = ['normal', 'warning', 'critical'];
  if (!validAlertStatuses.includes(alert_status)) {
    return res.status(400).json({
      status: 'error',
      message: `alert_status doit être l'une des valeurs suivantes : ${validAlertStatuses.join(', ')}`
    });
  }
  next();
};

exports.validateIdParam = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Validation idParam:`, req.params.id);
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  if (!id || isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'L\'ID doit être un nombre positif'
    });
  }
  req.params.id = parsedId;
  next();
};