import React, { useState, useEffect } from 'react';
import { getRfidLogs } from '../services/api';

const RfidLogs = () => {
  const [rfidLogs, setRfidLogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRfidLogs();
  }, []);

  const fetchRfidLogs = async () => {
    try {
      const data = await getRfidLogs();
      setRfidLogs(data);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Logs RFID</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">ID</th>
              <th className="p-2">Card ID</th>
              <th className="p-2">Reader ID</th>
              <th className="p-2">Statut</th>
              <th className="p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {rfidLogs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="p-2">{log.id}</td>
                <td className="p-2">{log.card_id}</td>
                <td className="p-2">{log.reader_id}</td>
                <td className="p-2">{log.status}</td>
                <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RfidLogs;