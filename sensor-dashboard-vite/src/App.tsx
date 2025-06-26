import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { io } from 'socket.io-client';

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [data, setData] = useState({ 
    gas: 0, 
    pir: 0, 
    rfid: '', 
    time: 'En attente...'
  });

  // useEffect pour la connexion Socket.IO - Parenthèses correctement fermées
  useEffect(() => {
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      console.log('Connecté');
      setData(prev => ({ ...prev, time: new Date().toLocaleTimeString() }));
    }); // Fermeture correcte de la callback connect

    socket.on('update', (newData) => {
      setData({
        gas: Number(newData.gas),
        pir: Number(newData.pir),
        rfid: newData.rfid || '',
        time: new Date().toLocaleTimeString()
      });
    }); // Fermeture correcte de la callback update

    return () => {
      socket.disconnect();
    }; // Fermeture correcte de la fonction de cleanup
  }, []); // Fermeture correcte du useEffect

  // Configuration du graphique - Parenthèses correctes
  const chartData = {
    labels: ['Dernière mesure'],
    datasets: [{
      label: 'Niveau de gaz',
      data: [data.gas],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      fill: true
    }] // Fermeture correcte du tableau datasets
  }; // Fermeture correcte de chartData

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard IoT</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Gaz</h2>
          <p className="text-2xl">{data.gas.toFixed(2)}</p>
        </div> {/* Fermeture correcte de la div Gaz */}
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Détection</h2>
          <p className="text-2xl">{data.pir ? 'OUI' : 'NON'}</p>
        </div> {/* Fermeture correcte de la div Détection */}
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">RFID</h2>
          <p className="text-2xl">{data.rfid || 'Aucun'}</p>
        </div> {/* Fermeture correcte de la div RFID */}
      </div> {/* Fermeture correcte de la grid */}

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Historique</h2>
        <Line data={chartData} options={{ responsive: true }} />
      </div> {/* Fermeture correcte de la div du graphique */}

      <div className="mt-4 text-gray-500">
        Dernière mise à jour: {data.time}
      </div> {/* Fermeture correcte de la div de statut */}
    </div> // Fermeture correcte de la div principale
  );
}

export default Dashboard;