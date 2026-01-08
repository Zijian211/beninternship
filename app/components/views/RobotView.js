"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Battery, BatteryCharging, Bot, Plane } from "lucide-react";

export default function RobotView({ data, initialFilter }) {
  // --- STATE ---
  const [activeZoneId, setActiveZoneId] = useState("ALL");

  // --- SAFE DATA HANDLING (Fixes TypeError) ---
  const safeData = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  // --- 1. LISTEN FOR NAVIGATION (Foreign Key Jump) ---
  useEffect(() => {
    // --- listen for 'zone' because page.js passes the ID in the 'zone' field ---
    if (initialFilter?.zone && initialFilter.zone !== activeZoneId) {
      setActiveZoneId(initialFilter.zone);
    }
    // --- eslint-disable-next-line react-hooks/exhaustive-deps ---
  }, [initialFilter]);

  // --- 2. DEFINE ZONES ---
  const zones = [
    { id: "ALL", label: "All Zones" },
    { id: "Z-01", label: "North-West (Z-01)" },
    { id: "Z-02", label: "North-East (Z-02)" },
    { id: "Z-03", label: "South-West (Z-03)" },
    { id: "Z-04", label: "South-East (Z-04)" },
  ];

  // --- 3. FILTER LOGIC (Uses safeData) ---
  const filteredRobots = useMemo(() => {
    if (activeZoneId === "ALL") return safeData;
    // --- Strict match: robot.zoneId must equal the active filter ID ---
    return safeData.filter(robot => robot.zoneId === activeZoneId);
  }, [safeData, activeZoneId]);

  // --- Battery Color ---
  const getBatteryColor = (level) => {
    if (level > 60) return "bg-green-500";
    if (level > 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Autonomous Fleet</h3>
          <p className="text-sm text-slate-400">Cleaning Robots & Inspection Drones</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-blue-700">Fleet Online</span>
            </div>
        </div>
      </div>

      {/* Zone Filters */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => setActiveZoneId(zone.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
              activeZoneId === zone.id
                ? "bg-slate-800 text-white border-slate-800 shadow-md transform scale-105"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {zone.label}
          </button>
        ))}
      </div>

      {/* Robot List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* If filteredRobots is empty, this simply renders nothing or falls to empty state below */}
        {filteredRobots.length > 0 ? (
          filteredRobots.map((robot) => (
            <div key={robot.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
              {/* Status Stripe */}
              <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                robot.status === 'error' ? 'bg-red-500' : 
                robot.status === 'working' ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>

              <div className="pl-3">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${robot.type === 'drone' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                      {robot.type === 'drone' ? <Plane size={24} /> : <Bot size={24} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700">{robot.name}</h4>
                      <span className="text-xs font-mono text-slate-400">{robot.id}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                    robot.status === 'working' ? 'bg-green-50 border-green-200 text-green-700' :
                    robot.status === 'charging' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    robot.status === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                    'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>
                    {robot.status}
                  </span>
                </div>

                {/* Location Display */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded">
                    <span className="font-semibold">Location:</span>
                    <div className="text-right">
                      <span className="block font-mono text-slate-700 font-bold">{robot.location}</span>
                    </div>
                </div>

                {/* Battery */}
                <div className="mt-2">
                  <div className="flex justify-between items-end mb-1">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                      {robot.status === 'charging' ? <BatteryCharging size={14}/> : <Battery size={14}/>}
                      Battery
                    </div>
                    <span className="text-sm font-bold text-slate-800">{robot.battery}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${getBatteryColor(robot.battery)}`} style={{ width: `${robot.battery}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="col-span-full text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
             <Bot className="mx-auto text-slate-300 mb-2" size={48} />
             <p className="text-slate-500 text-sm">No robots found in Zone {activeZoneId}.</p>
          </div>
        )}
      </div>
    </div>
  );
}