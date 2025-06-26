import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getGasLevels = async () => {
  try {
    const response = await api.get('/gas_levels');
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des niveaux de gaz:', error);
    throw error;
  }
};

export const getRfidLogs = async () => {
  try {
    const response = await api.get('/rfid_logs');
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des logs RFID:', error);
    throw error;
  }
};

export const getIntrusionLogs = async () => {
  try {
    const response = await api.get('/intrusion_logs');
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des logs d\'intrusion:', error);
    throw error;
  }
};

export const createGasLevel = async (data) => {
  try {
    const response = await api.post('/gas_levels', data);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la création du niveau de gaz:', error);
    throw error;
  }
};

export const updateGasLevel = async (id, data) => {
  try {
    const response = await api.put(`/gas_levels/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du niveau de gaz:', error);
    throw error;
  }
};

export const deleteGasLevel = async (id) => {
  try {
    await api.delete(`/gas_levels/${id}`);
  } catch (error) {
    console.error('Erreur lors de la suppression du niveau de gaz:', error);
    throw error;
  }
};