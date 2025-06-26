import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { getGasLevels } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Chart = () => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    fetchGasLevels();
  }, []);

  const fetchGasLevels = async () => {
    try {
      const data = await getGasLevels();
      const labels = data.map((level) => new Date(level.timestamp).toLocaleTimeString());
      const values = data.map((level) => level.value);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Niveaux de Gaz',
            data: values,
            fill: false,
            borderColor: 'rgb(59, 130, 246)',
            tension: 0.1,
          },
        ],
      });
    } catch (err) {
      console.error('Erreur lors du chargement du graphique:', err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Graphique des Niveaux de Gaz</h2>
      <Line data={chartData} />
    </div>
  );
};

export default Chart;