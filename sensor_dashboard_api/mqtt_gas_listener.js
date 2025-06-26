require('dotenv').config();
const mqtt = require('mqtt');
const { Client } = require('pg');

// Connexion PostgreSQL
const pgClient = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
});

pgClient.connect()
  .then(() => console.log('✅ Connecté à PostgreSQL'))
  .catch(err => console.error('❌ Erreur PostgreSQL :', err));

// Connexion MQTT
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com'); // ou ton propre broker local

mqttClient.on('connect', () => {
  console.log('📡 Connecté à MQTT');
  mqttClient.subscribe('iot/sensor/gas'); // sujet MQTT à écouter
});

mqttClient.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    const { sensor_id, value, alert_status } = data;

    await pgClient.query(
      `INSERT INTO gas_levels (sensor_id, value, alert_status) VALUES ($1, $2, $3)`,
      [sensor_id, value, alert_status]
    );
    console.log('✅ Insertion réussie :', data);
  } catch (err) {
    console.error('❌ Erreur insertion ou parsing :', err.message);
  }
});
