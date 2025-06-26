import React, { useEffect, useState } from 'react';

function GasDashboard() {
  const [data, setData] = useState([]);

  const fetchData = () => {
    fetch('http://localhost:3000/gas_levels')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error('Erreur API :', err));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📊 Gas Sensor Dashboard (Temps réel)</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Sensor</th>
            <th>Value</th>
            <th>Status</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {data.map(entry => (
            <tr key={entry.id}>
              <td>{entry.id}</td>
              <td>{entry.sensor_id}</td>
              <td>{entry.value}</td>
              <td>{entry.alert_status}</td>
              <td>{new Date(entry.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GasDashboard;
