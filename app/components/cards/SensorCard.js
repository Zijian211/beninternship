"use client";
import React, { useState, useMemo, useEffect } from "react";
import { 
  Sun, Thermometer, Wind, Droplets, CloudFog, 
  Activity, Zap, Ruler, ShieldAlert, Flame, Waves, 
  Ear, Eye, Layers, Wifi, AlertTriangle, CheckCircle2, Fan
} from "lucide-react";

export default function SensorCard({ data, initialFilter }) {
  const [activeLevel, setActiveLevel] = useState("ALL");

  // --- LISTEN FOR NAVIGATION CONTEXT ---
  useEffect(() => {
    if (initialFilter?.level && initialFilter.level !== activeLevel) {
      setActiveLevel(initialFilter.level);
    }
    // --- eslint-disable-next-line react-hooks/exhaustive-deps ---
  }, [initialFilter?.level]);

  // --- ICON MAPPING ---
  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'irradiance': return <Sun size={18} />;
      case 'temp': return <Thermometer size={18} />;
      case 'wind': return <Wind size={18} />;
      case 'humidity': return <Droplets size={18} />;
      case 'pressure': return <CloudFog size={18} />;
      case 'vibration': return <Activity size={18} />;
      case 'current': return <Zap size={18} />;
      case 'voltage': return <Zap size={18} />;
      case 'displacement': return <Ruler size={18} />;
      case 'arc': return <ShieldAlert size={18} />;
      case 'smoke': return <Flame size={18} />;
      case 'water': return <Waves size={18} />;
      case 'noise': return <Ear size={18} />;
      case 'surveillance': return <Eye size={18} />;
      case 'fan': return <Fan size={18} />;
      default: return <Activity size={18} />;
    }
  };

  const levels = ["ALL", "Environmental", "Module", "String/DC", "Inverter/AC", "Security"];

  const processData = useMemo(() => {
    // --- Strict check to ensure data is an Array before proceeding ---
    if (!Array.isArray(data)) return [];

    let filtered = activeLevel === "ALL" ? data : data.filter(item => item.level === activeLevel);
    
    // --- Sort: Fault > Critical > Warning > Normal ---
    return [...filtered].sort((a, b) => {
        const score = { fault: 3, critical: 3, warning: 2, normal: 1 };
        return (score[b.status?.toLowerCase()] || 0) - (score[a.status?.toLowerCase()] || 0);
    });
  }, [data, activeLevel]);

  // --- Safe check for initial render if data is missing ---
  if (!data) return null;

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        
       {/* --- HEADER --- */}
       <div className="bg-slate-900 text-white p-5 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wifi size={100} />
          </div>
          <div className="relative z-10 flex justify-between items-start">
              <div>
                  <h2 className="text-lg font-bold">Multi-Source Fusion</h2>
                  <p className="text-xs text-slate-400 font-medium">Real-time Sensor Data Stream</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 px-2 py-1 rounded text-xs font-mono">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
              </div>
          </div>
       </div>

       {/* --- TABS --- */}
       <div className="flex overflow-x-auto p-2 gap-1 border-b border-slate-100 bg-slate-50/50 scrollbar-hide shrink-0">
        {levels.map(lvl => (
          <button
            key={lvl}
            onClick={() => setActiveLevel(lvl)}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-md whitespace-nowrap transition-all ${
              activeLevel === lvl 
              ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200" 
              : "text-slate-500 hover:bg-slate-200/50"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

       {/* --- DATA LIST --- */}
       <div className="flex-1 overflow-y-auto p-3 bg-slate-50/30 custom-scrollbar">
          <div className="flex flex-col gap-2">
            {processData.map((sensor) => {
               const currentStatus = sensor.status?.toLowerCase() || 'normal';

               // --- Determine Status Styles ---
               let statusStyles = "bg-white border-slate-200";
               let iconColor = "text-slate-400";
               let valueColor = "text-slate-800";
               
               if(currentStatus === 'warning') {
                   statusStyles = "bg-amber-50 border-amber-200";
                   iconColor = "text-amber-600";
                   valueColor = "text-amber-700";
               } else if(currentStatus === 'fault' || currentStatus === 'critical') {
                   statusStyles = "bg-red-50 border-red-200";
                   iconColor = "text-red-600";
                   valueColor = "text-red-700";
               }

               return (
                <div key={sensor.id} className={`p-3 border rounded-xl flex items-center justify-between transition-all hover:shadow-sm ${statusStyles}`}>
                  
                  {/* Left: Icon & Name */}
                  <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white border ${currentStatus === 'normal' ? 'border-slate-100' : 'border-transparent bg-opacity-60'} ${iconColor}`}>
                         {getIcon(sensor.type)}
                      </div>
                      <div>
                         <h4 className="text-sm font-bold text-slate-700">{sensor.name}</h4>
                         <div className="flex items-center gap-1.5">
                             <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 rounded">{sensor.id}</span>
                             <span className="text-[10px] text-slate-400 capitalize">{sensor.location || "General"}</span>
                         </div>
                      </div>
                  </div>

                  {/* Right: Value & Status */}
                  <div className="text-right">
                      <div className={`text-lg font-black ${valueColor} flex items-center justify-end gap-1`}>
                          {sensor.value}
                          <span className="text-xs font-bold opacity-60">{sensor.unit}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1">
                          {currentStatus === 'normal' 
                            ? <CheckCircle2 size={10} className="text-emerald-500" /> 
                            : <AlertTriangle size={10} className={currentStatus === 'fault' ? "text-red-500 animate-pulse" : "text-amber-500"} />
                          }
                          <span className={`text-[10px] font-bold uppercase ${currentStatus === 'normal' ? 'text-emerald-600' : valueColor}`}>
                              {sensor.status}
                          </span>
                      </div>
                  </div>

                </div>
               );
            })}
            
            {processData.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs">
                    No sensors found for this category.
                </div>
            )}
          </div>
       </div>
    </div>
  );
}