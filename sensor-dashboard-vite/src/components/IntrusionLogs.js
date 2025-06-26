import React, { useState, useEffect } from 'react';
import { getIntrusionLogs } from '../services/api';

const IntrusionLogs = () => {
  const [intrusionLogs, setIntrusionLogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIntrusionLogs();
  }, []);

  const fetchIntrusionLogs = async () => {
    try {
      const data = await getIntrusionLogs();
      setIntrusionLogs(data);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Logs d'Intrusion</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">ID</th>
              <th className="p-2">Sensor ID</th>
              <th className="p-2">Détecté</th>
              <th className="p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {intrusionLogs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="p-2">{log.id}</td>
                <td className="p-2">{log.sensor_id}</td>
                <td className="p-2">{log.detected ? 'Oui' : 'Non'}</td>
                <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IntrusionLogs;