"use client";
import React, { useState, useRef, useEffect } from "react";
import { Zap, AlertTriangle, CheckCircle, XCircle, Grid3x3, ArrowRight, Layers, Bot } from "lucide-react";

export default function FieldMap({ data, onNavigate }) {
  // --- STATE MANAGEMENT ---
  const [selectedZone, setSelectedZone] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef(null);

  // --- EFFECT: CLICK OUTSIDE LISTENER ---
  // --- Closes the popover menu if the user clicks anywhere outside the map container ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mapRef.current && !mapRef.current.contains(event.target)) {
        setSelectedZone(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- DATA VALIDATION (Safe Data Pattern) ---
  const zones = Array.isArray(data) ? data : (data?.zones || []);
  if (!data && zones.length === 0) return null;

  // --- VISUAL CONFIGURATION ---
  // --- Maps status strings (normal, warning, etc.) to specific Tailwind colors, glow effects, and Icons ---
  const getStatusConfig = (status) => {
    switch (status) {
      case "normal": return { color: "bg-green-500", glow: "shadow-green-500/50", icon: CheckCircle };
      case "warning": return { color: "bg-orange-500", glow: "shadow-orange-500/50", icon: AlertTriangle };
      case "fault": return { color: "bg-red-600", glow: "shadow-red-600/50", icon: XCircle }; 
      case "offline": return { color: "bg-gray-500", glow: "shadow-gray-500/50", icon: Zap };
      default: return { color: "bg-blue-500", glow: "shadow-blue-500/50", icon: Zap };
    }
  };

  // --- ZONE CLICK (Open Popover) ---
  const handleZoneClick = (event, zone) => {
    // --- Stop propagation so the 'click outside' listener doesn't immediately close the menu ---
    event.stopPropagation();
    
    if (mapRef.current) {
        // --- Calculate click position relative to the map container (not the viewport) ---
        const mapRect = mapRef.current.getBoundingClientRect();
        setMenuPosition({
        x: event.clientX - mapRect.left,
        y: event.clientY - mapRect.top
        });
        setSelectedZone(zone);
    }
  };

  // --- STANDARD NAVIGATION ---
  // --- Used for Inverter/Module tabs which rely on the human-readable 'zone name' filter ---
  const handleMenuNavigate = (targetTab) => {
    if (onNavigate && selectedZone) {
      onNavigate(targetTab, { zone: selectedZone.name });
      setSelectedZone(null);
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- HEADER & LEGEND SECTION --- */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Station Spatial View</h3>
          <p className="text-sm text-slate-400">Real-time Zone Topology & Navigation</p>
          <p className="text-xs text-slate-400 mt-1">-- Click a Zone to Navigate Inverter, String/Module, or Robots --</p>
        </div>
        {/* Status Legend */}
        <div className="flex gap-4 text-xs font-medium">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Normal</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Warning</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600"></span> Fault</div>
        </div>
      </div>

      {/* --- MAP CONTAINER --- */}
      <div ref={mapRef} className="flex-1 bg-slate-900 rounded-xl relative overflow-hidden border border-slate-300 shadow-inner group cursor-crosshair">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        {/* --- RENDER ZONES (PINS) --- */}
        {zones.map((zone) => {
          if (!zone) return null;
          const config = getStatusConfig(zone.status);
          const Icon = config.icon;
          
          return (
            <div key={zone.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 group/pin" style={{ left: `${zone.x}%`, top: `${zone.y}%` }}>
              
              {/* Animated Pulse Ring */}
              <div className={`absolute -inset-4 rounded-full opacity-20 animate-ping ${config.color}`}></div>
              
              {/* Interactive Pin Button */}
              <div onClick={(e) => handleZoneClick(e, zone)} className={`relative w-12 h-12 rounded-full border-4 border-slate-800 flex items-center justify-center text-white shadow-xl transition-transform hover:scale-110 cursor-pointer z-10 ${config.color} ${config.glow}`}>
                <Icon size={20} />
              </div>

              {/* --- HOVER TOOLTIP (Only shows when no menu is selected) --- */}
              {!selectedZone && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-60 bg-white/95 backdrop-blur rounded-lg p-4 shadow-xl opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none z-20 border border-slate-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{zone.id}</div>
                      <div className="font-bold text-slate-800 text-sm">{zone.name}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase text-white ${config.color}`}>{zone.status}</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-500">Power Output</span>
                        <span className="font-mono font-bold text-slate-700">{zone.power} / {zone.capacity} kW</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${config.color}`} style={{ width: `${(zone.power / zone.capacity) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Grid3x3 size={14} className="text-blue-500" />
                        <span>Modules Monitored:</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{zone.moduleCount}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* --- POPOVER MENU (Appears on Click) --- */}
        {selectedZone && (
          <div className="absolute z-30 bg-white rounded-lg shadow-xl border border-slate-200 p-2 w-48 animate-in fade-in zoom-in duration-200" style={{ left: menuPosition.x + 20, top: menuPosition.y - 50 }}>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Navigate to {selectedZone.id}:</div>
            <div className="flex flex-col gap-1">
              
              {/* Inverter Button: Standard Navigation (Name-based) */}
              <button onClick={() => handleMenuNavigate('inverter')} className="flex items-center justify-between w-full px-3 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors text-left">
                <span className="flex items-center gap-2"><Zap size={16} /> Inverters</span>
                <ArrowRight size={14} className="text-slate-400" />
              </button>
              
              {/* Module Button: Standard Navigation (Name-based) */}
              <button onClick={() => handleMenuNavigate('module')} className="flex items-center justify-between w-full px-3 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors text-left">
                <span className="flex items-center gap-2"><Layers size={16} /> Strings/Modules</span>
                <ArrowRight size={14} className="text-slate-400" />
              </button>

              {/* Robot Button: CUSTOM ID LOGIC */}
              {/* Directly passes zone ID (e.g. "Z-01") into the 'zone' key so page.js accepts it */}
              <button onClick={() => {
                if (onNavigate && selectedZone) {
                  // --- Pass ID "Z-01" into the 'zone' context property ---
                  onNavigate('robots', { zone: selectedZone.id });
                  setSelectedZone(null);
                }
                }
              }
    className="flex items-center justify-between w-full px-3 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors text-left"
  >
    <span className="flex items-center gap-2"><Bot size={16} /> Robots</span>
    <ArrowRight size={14} className="text-slate-400" />
  </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}