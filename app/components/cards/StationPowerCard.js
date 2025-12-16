import React from "react";

export default function StationPowerCard({ data }) {
  // Safety check: if data (kpi) is missing, don't render anything
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Real-Time Power */}
      <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
        <div className="text-sm text-blue-600 font-bold uppercase mb-1">
          Real-Time Power
        </div>
        <div className="text-3xl font-black text-blue-900">
          {data.power.value}{" "}
          <span className="text-lg font-medium">{data.power.unit}</span>
        </div>
      </div>

      {/* Daily Yield */}
      <div className="p-6 bg-green-50 border border-green-100 rounded-xl shadow-sm">
        <div className="text-sm text-green-600 font-bold uppercase mb-1">
          Daily Yield
        </div>
        <div className="text-3xl font-black text-green-900">
          {data.dailyEnergy.value}{" "}
          <span className="text-lg font-medium">{data.dailyEnergy.unit}</span>
        </div>
      </div>

      {/* Safe Operation */}
      <div className="p-6 bg-purple-50 border border-purple-100 rounded-xl shadow-sm">
        <div className="text-sm text-purple-600 font-bold uppercase mb-1">
          Safe Operation
        </div>
        <div className="text-3xl font-black text-purple-900">
          {data.safetyDays} <span className="text-lg font-medium">Days</span>
        </div>
      </div>

      {/* Condition / Weather */}
      <div className="p-6 bg-orange-50 border border-orange-100 rounded-xl shadow-sm">
        <div className="text-sm text-orange-600 font-bold uppercase mb-1">
          Condition
        </div>
        <div className="text-3xl font-black text-orange-900">
          {data.weather.temp}°C{" "}
          <span className="text-lg font-medium">{data.weather.condition}</span>
        </div>
      </div>
    </div>
  );
}