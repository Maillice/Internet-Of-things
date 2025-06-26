// Middleware de gestion d'erreurs centralisé
function errorHandler(err, req, res, next) {
  console.error(err.stack); // Log l'erreur pour le débogage

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    // En développement, on peut ajouter plus de détails
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = { errorHandler };