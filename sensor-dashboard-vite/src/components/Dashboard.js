import React from 'react';
import GasLevels from './GasLevels';
import RfidLogs from './RfidLogs';
import IntrusionLogs from './IntrusionLogs';
import Chart from './Chart';

const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Dashboard IoT</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <Chart />
        </div>
        <GasLevels />
        <RfidLogs />
        <IntrusionLogs />
      </div>
    </div>
  );
};

export default Dashboard;