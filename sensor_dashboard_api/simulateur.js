const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
  const payload = JSON.stringify({
    sensor_id: 'SimMQ135',
    value: (Math.random() * 100).toFixed(2),
    alert_status: 'normal',
  });

  client.publish('iot/sensor/gas', payload, () => {
    console.log('📤 Message envoyé :', payload);
    client.end();
  });
});
