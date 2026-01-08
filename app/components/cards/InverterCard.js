import React from "react";
import { Zap, Thermometer, Activity, AlertTriangle, Cpu, Fan } from "lucide-react";

export default function InverterCard({ data, onClick, onNavigate }) {
  // --- 1. THEME ENGINE ---
  const getTheme = (status) => {
    switch (status?.toLowerCase()) {
      case "normal":
        return { bg: "bg-emerald-50 hover:bg-emerald-100", border: "border-emerald-200", text: "text-emerald-700", icon: "text-emerald-600", bar: "bg-emerald-500" };
      case "warning":
        return { bg: "bg-amber-50 hover:bg-amber-100", border: "border-amber-200", text: "text-amber-700", icon: "text-amber-600", bar: "bg-amber-500" };
      case "fault":
        return { bg: "bg-red-50 hover:bg-red-100", border: "border-red-200", text: "text-red-700", icon: "text-red-600", bar: "bg-red-500" };
      case "offline":
        return { bg: "bg-slate-50 hover:bg-slate-100", border: "border-slate-200", text: "text-slate-500", icon: "text-slate-400", bar: "bg-slate-300" };
      default:
        return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: "text-blue-600", bar: "bg-blue-500" };
    }
  };

  const theme = getTheme(data.status);
  
  // --- 2. PHYSICS CHECK (STRICT FIX) ---
  const currentTemp = data.temp ?? 0;
  const currentEff = (data.efficiency !== null && data.efficiency !== undefined) ? data.efficiency : 0;
  
  const isOverheated = currentTemp > 45; // --- Zone 3 (Fan/Vibration) ---
  const isLowEff = currentEff < 90; // --- Zone 2 (Dust) ---

  return (
    <div 
        onClick={onClick}
        className={`relative border rounded-xl p-4 shadow-sm transition-all duration-300 cursor-pointer group ${theme.bg} ${theme.border} hover:shadow-md hover:-translate-y-1`}
    >
      {/* --- HEADER: ID & LOCATION --- */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
             <div className={`p-1.5 rounded-md bg-white border ${theme.border}`}>
                <Cpu size={14} className={theme.icon} />
             </div>
             <span className="font-bold text-slate-700">{data.id}</span>
          </div>
          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 pl-0.5">
             {data.zoneName}
          </span>
        </div>
        
        {/* Status Badge */}
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-white ${theme.text} ${theme.border} ${data.status === 'Fault' ? 'animate-pulse' : ''}`}>
          {data.status}
        </span>
      </div>

      {/* --- CORE METRIC: POWER OUTPUT --- */}
      <div className="mb-4 bg-white/60 p-2 rounded-lg border border-slate-100/50">
        <div className="flex justify-between items-end">
             <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mb-0.5">Real-time Output</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-800">{data.currentPower || 0}</span>
                    <span className="text-xs font-bold text-slate-400">kW</span>
                </div>
             </div>
             <Zap size={24} className={`${theme.icon} opacity-20`} />
        </div>
      </div>

      {/* --- DIAGNOSTICS GRID --- */}
      <div className="grid grid-cols-2 gap-2">
        
        {/* 1. EFFICIENCY (Click -> Jumps to Environmental/DC Sensors) */}
        <div 
            className={`bg-white p-2 rounded border border-slate-100 transition-colors ${isLowEff ? 'hover:bg-amber-100 cursor-alias' : ''}`}
            onClick={(e) => {
                // --- Only navigate if efficiency is low, otherwise let it propagate ---
                if (onNavigate && isLowEff) {
                    e.stopPropagation();
                    onNavigate('sensors', { level: 'Inverter/AC' }); // Jump to Sensor Tab
                }
            }}
            title={isLowEff ? "Click to view Sensor Diagnostics" : "Normal Efficiency"}
        >
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Activity size={10} /> Eff.
                </span>
                <span className={`text-xs font-bold ${isLowEff ? 'text-amber-600' : 'text-slate-700'}`}>
                    {currentEff}%
                </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                    style={{ width: `${currentEff}%` }} 
                    className={`h-full rounded-full transition-all duration-1000 ${isLowEff ? 'bg-amber-400' : theme.bar}`} 
                />
            </div>
        </div>

        {/* 2. TEMPERATURE (Click -> Jumps to Inverter/AC Sensors) */}
        <div 
            className={`p-2 rounded border transition-colors ${isOverheated ? 'bg-red-50 border-red-100 hover:bg-red-100 cursor-alias' : 'bg-white border-slate-100'}`}
            onClick={(e) => {
                if (onNavigate && isOverheated) {
                    e.stopPropagation();
                    onNavigate('sensors', { level: 'Inverter/AC' });
                }
            }}
            title={isOverheated ? "Click to view Vibration/Fan Sensors" : "Normal Temp"}
        >
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Thermometer size={10} /> Temp
                </span>
                {isOverheated && <AlertTriangle size={10} className="text-red-500 animate-bounce" />}
            </div>
            <div className="flex items-center gap-1">
                <span className={`text-xs font-bold ${isOverheated ? 'text-red-600' : 'text-slate-700'}`}>
                    {currentTemp}°C
                </span>
                <Fan size={10} className={`${isOverheated ? 'text-red-400 animate-spin' : 'text-slate-300'}`} />
            </div>
        </div>
      </div>
    </div>
  );
}