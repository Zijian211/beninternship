import React from "react";

export default function StationPowerCard({ data }) {
  // --- Safety check ---
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      
      {/* Real-Time Power */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="text-xs text-blue-500 font-bold uppercase mb-1 tracking-wider">
          Real-Time Power
        </div>
        <div className="text-2xl font-black text-blue-900 flex items-baseline gap-1">
          {data.power.value}
          <span className="text-sm font-bold text-blue-700">{data.power.unit}</span>
        </div>
      </div>

      {/* Daily Yield */}
      <div className="p-4 bg-green-50 border border-green-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="text-xs text-green-600 font-bold uppercase mb-1 tracking-wider">
          Daily Yield
        </div>
        <div className="text-2xl font-black text-green-900 flex items-baseline gap-1">
          {data.dailyEnergy.value}
          <span className="text-sm font-bold text-green-700">{data.dailyEnergy.unit}</span>
        </div>
      </div>

      {/* Safe Operation */}
      <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="text-xs text-purple-600 font-bold uppercase mb-1 tracking-wider">
          Safe Operation
        </div>
        <div className="text-2xl font-black text-purple-900 flex items-baseline gap-1">
          {data.safetyDays}
          <span className="text-sm font-bold text-purple-700">Days</span>
        </div>
      </div>

      {/* Condition / Weather */}
      <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="text-xs text-orange-600 font-bold uppercase mb-1 tracking-wider">
          Condition
        </div>
        <div className="text-2xl font-black text-orange-900 flex items-baseline gap-1">
          {data.weather.temp}°C
          <span className="text-sm font-bold text-orange-700 ml-1">{data.weather.condition}</span>
        </div>
      </div>

    </div>
  );
}