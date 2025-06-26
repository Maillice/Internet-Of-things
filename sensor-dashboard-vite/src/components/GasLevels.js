import React, { useState, useEffect } from 'react';
import { getGasLevels, createGasLevel, updateGasLevel, deleteGasLevel } from '../services/api';

const GasLevels = () => {
  const [gasLevels, setGasLevels] = useState([]);
  const [formData, setFormData] = useState({
    sensor_id: '',
    value: '',
    alert_status: 'normal',
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGasLevels();
  }, []);

  const fetchGasLevels = async () => {
    try {
      const data = await getGasLevels();
      setGasLevels(data);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        value: Number(formData.value),
      };
      if (editId) {
        await updateGasLevel(editId, data);
        setEditId(null);
      } else {
        await createGasLevel(data);
      }
      setFormData({ sensor_id: '', value: '', alert_status: 'normal' });
      fetchGasLevels();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'opération');
    }
  };

  const handleEdit = (level) => {
    setFormData({
      sensor_id: level.sensor_id,
      value: level.value,
      alert_status: level.alert_status,
    });
    setEditId(level.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Confirmer la suppression ?')) {
      try {
        await deleteGasLevel(id);
        fetchGasLevels();
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Niveaux de Gaz</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Sensor ID</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={formData.sensor_id}
            onChange={(e) => setFormData({ ...formData, sensor_id: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Valeur</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            required
            min="0"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Statut Alerte</label>
          <select
            className="w-full border rounded p-2"
            value={formData.alert_status}
            onChange={(e) => setFormData({ ...formData, alert_status: e.target.value })}
          >
            <option value="normal">Normal</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {editId ? 'Mettre à jour' : 'Ajouter'}
        </button>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">ID</th>
              <th className="p-2">Sensor ID</th>
              <th className="p-2">Valeur</th>
              <th className="p-2">Statut</th>
              <th className="p-2">Timestamp</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {gasLevels.map((level) => (
              <tr key={level.id} className="border-t">
                <td className="p-2">{level.id}</td>
                <td className="p-2">{level.sensor_id}</td>
                <td className="p-2">{level.value}</td>
                <td className="p-2">{level.alert_status}</td>
                <td className="p-2">{new Date(level.timestamp).toLocaleString()}</td>
                <td className="p-2">
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                    onClick={() => handleEdit(level)}
                  >
                    Modifier
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDelete(level.id)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GasLevels;