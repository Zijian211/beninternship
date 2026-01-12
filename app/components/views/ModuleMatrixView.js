"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Layers, Zap } from "lucide-react";

export default function ModuleMatrixView({ data, initialFilter, onNavigate }) {
  const safeData = Array.isArray(data) ? data : [];
  
  const [selectedZone, setSelectedZone] = useState("ALL");
  const [selectedInverter, setSelectedInverter] = useState("ALL");

  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.zone) setSelectedZone(initialFilter.zone);
      if (initialFilter.inverter) setSelectedInverter(initialFilter.inverter);
    }
  }, [initialFilter]);

  const zones = useMemo(() => {
    if (safeData.length === 0) return ["ALL"];
    const allZones = safeData.map(d => d.zoneName || d.zoneId).filter(Boolean);
    return ["ALL", ...new Set(allZones)];
  }, [safeData]);

  const inverters = useMemo(() => {
    let filtered = safeData;
    if (selectedZone !== "ALL") filtered = safeData.filter(d => d.zoneName === selectedZone);
    const allInverters = filtered.map(d => d.inverterId).filter(Boolean);
    return ["ALL", ...new Set(allInverters)];
  }, [safeData, selectedZone]);

  const filteredStrings = safeData.filter(d => {
    if (selectedZone !== "ALL" && d.zoneName !== selectedZone) return false;
    if (selectedInverter !== "ALL" && d.inverterId !== selectedInverter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Filters Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Layers size={20} className="text-blue-600"/> PV String Matrix
          </h3>
          <p className="text-xs text-slate-400">Detailed String Monitoring</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-400">Zone:</span>
            <select 
              className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer"
              value={selectedZone}
              onChange={(e) => { setSelectedZone(e.target.value); setSelectedInverter("ALL"); }}
            >
              {zones.map(z => <option key={z} value={z}>{z === "ALL" ? "All Zones" : z}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-400">Inverter:</span>
            <select 
              className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer"
              value={selectedInverter}
              onChange={(e) => setSelectedInverter(e.target.value)}
            >
              {inverters.map(inv => <option key={inv} value={inv}>{inv === "ALL" ? "All" : inv}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredStrings.length > 0 ? (
          filteredStrings.map((string) => {
            // --- Only target 'fault' for the Arc Sensor jump ---
            const isFault = string.status === 'fault';
            
            return (
              <div key={string.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                
                {/* Header with Jump Logic */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    {string.id}
                    {/* Icon appears for both warning and fault to indicate issue, but only fault is actionable */}
                    {string.status !== 'normal' && <Zap size={12} className={isFault ? "text-red-500 fill-current" : "text-yellow-500"} />}
                  </span>
                  
                  <button
                    onClick={() => {
                        // --- JUMP TO SENSOR VIEW ONLY IF FAULT (Arc Sensor) ---
                        if (onNavigate && isFault) {
                            onNavigate('sensors', { level: 'String/DC' });
                        }
                    }}
                    disabled={!isFault}
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded transition-all ${
                        string.status === 'normal' 
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : string.status === 'warning'
                            ? 'bg-yellow-100 text-yellow-700 cursor-default'
                            // --- Fault remains interactive (Arc Sensor Link) ---
                            : 'bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer animate-pulse'
                    }`}
                    title={isFault ? "Click to view the Fault on Sensors' Diagnostics" : ""}
                  >
                    {string.status} {isFault && "→"}
                  </button>
                </div>

                {/* Panels Matrix */}
                <div className="flex flex-wrap gap-1">
                   {string.panels?.map((panel, idx) => {
                      let colorClass = "bg-green-500"; 
                      if (panel.status === 'warning') colorClass = "bg-yellow-400";
                      if (panel.status === 'fault') colorClass = "bg-red-500 animate-pulse";
                      
                      return (
                        <div 
                          key={idx} 
                          className={`h-6 w-4 rounded-sm ${colorClass} hover:opacity-80 cursor-pointer relative group transition-transform hover:scale-110`}
                          title={`ID: ${panel.panelId} \nStatus: ${panel.issue || 'Normal'} \nV: ${panel.v}V | I: ${panel.c}A`}
                        />
                      );
                   })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-10 text-center text-slate-400 col-span-full">No strings found.</div>
        )}
      </div>
    </div>
  );
}