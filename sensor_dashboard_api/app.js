require('dotenv').config(); // Ajoute cette ligne en haut
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Ajoute un log pour vérifier les variables d'environnement
console.log('Env variables:', {
  PGUSER: process.env.PGUSER,
  PGPASSWORD: process.env.PGPASSWORD,
  PGHOST: process.env.PGHOST,
  PGDATABASE: process.env.PGDATABASE,
  PGPORT: process.env.PGPORT,
  PGSSL: process.env.PGSSL,
});

// Routes de base
app.get('/', (req, res) => {
  res.json({ message: "API IoT Dashboard" });
});

// Chargez les routes seulement si les fichiers existent
function loadRouteIfExists(path, routeFile) {
  try {
    app.use(path, require(routeFile));
  } catch (err) {
    console.warn(`Route ${path} non chargée: fichier ${routeFile} manquant`);
    app.use(path, (req, res) => {
      res.status(501).json({ error: "Endpoint non implémenté" });
    });
  }
}

loadRouteIfExists('/gas_levels', './routes/gas');
loadRouteIfExists('/intrusion_logs', './routes/intrusion');
loadRouteIfExists('/rfid_logs', './routes/rfid');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API démarrée sur http://localhost:${PORT}`);
  console.log(`🔌 Points d'accès:`);
  console.log(`   - /gas_levels`);
  console.log(`   - /intrusion_logs`);
  console.log(`   - /rfid_logs`);
});