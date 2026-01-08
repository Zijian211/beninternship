"use client";
import React, { useState, useRef, useEffect } from "react";
import { Zap, AlertTriangle, CheckCircle, XCircle, Grid3x3, ArrowRight, Layers } from "lucide-react";

export default function FieldMap({ data, onNavigate }) {
  // --- State for the Popover Menu ---
  const [selectedZone, setSelectedZone] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef(null);

  // --- Close menu on outside click ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mapRef.current && !mapRef.current.contains(event.target)) {
        setSelectedZone(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Extract Zones Array reliably ---
  const zones = Array.isArray(data) ? data : (data?.zones || []);

  // --- If no data at all, return null ---
  if (!data && zones.length === 0) return null;

  // --- Status Colors & Icons ---
  const getStatusConfig = (status) => {
    switch (status) {
      case "normal": return { color: "bg-green-500", glow: "shadow-green-500/50", icon: CheckCircle };
      case "warning": return { color: "bg-orange-500", glow: "shadow-orange-500/50", icon: AlertTriangle };
      case "fault": return { color: "bg-red-600", glow: "shadow-red-600/50", icon: XCircle }; 
      case "offline": return { color: "bg-gray-500", glow: "shadow-gray-500/50", icon: Zap };
      default: return { color: "bg-blue-500", glow: "shadow-blue-500/50", icon: Zap };
    }
  };

  // --- Handle Zone Click ---
  const handleZoneClick = (event, zone) => {
    event.stopPropagation();
    
    // --- Get click coordinates relative to the map container ---
    if (mapRef.current) {
        const mapRect = mapRef.current.getBoundingClientRect();
        setMenuPosition({
        x: event.clientX - mapRect.left,
        y: event.clientY - mapRect.top
        });
        setSelectedZone(zone);
    }
  };

  // --- Handle Navigation from Menu ---
  const handleMenuNavigate = (targetTab) => {
    if (onNavigate && selectedZone) {
      onNavigate(targetTab, { zone: selectedZone.name });
      setSelectedZone(null); // --- Close menu after navigating ---
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Station Spatial View</h3>
          <p className="text-sm text-slate-400">Real-time Zone Topology & Navigation</p>
          <p className="text-xs text-slate-400 mt-1">-- Click a Zone to Navigate Inverter or Module --</p>
        </div>
        {/* Legend */}
        <div className="flex gap-4 text-xs font-medium">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Normal</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Warning</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600"></span> Fault</div>
        </div>
      </div>

      {/* The Map Container */}
      <div 
        ref={mapRef}
        className="flex-1 bg-slate-900 rounded-xl relative overflow-hidden border border-slate-300 shadow-inner group cursor-crosshair"
      >
        
        {/* Decorative Grid Background (Simulates GIS Map) */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>
        
        {/* Render Zones as 'Pins' */}
        {zones.map((zone) => {
          if (!zone) return null; // --- Safety check for empty items ---

          const config = getStatusConfig(zone.status);
          const Icon = config.icon;
          
          return (
            <div 
              key={zone.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group/pin"
              style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
            >
              
              {/* Pulsing Effect (Animation) */}
              <div className={`absolute -inset-4 rounded-full opacity-20 animate-ping ${config.color}`}></div>
              
              {/* The Pin Icon - CLICKABLE */}
              <div 
                onClick={(e) => handleZoneClick(e, zone)}
                className={`relative w-12 h-12 rounded-full border-4 border-slate-800 flex items-center justify-center text-white shadow-xl transition-transform hover:scale-110 cursor-pointer z-10 ${config.color} ${config.glow}`}
              >
                <Icon size={20} />
              </div>

              {/* Hover Tooltip (Data Card) - Hides when menu is open */}
              {!selectedZone && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-60 bg-white/95 backdrop-blur rounded-lg p-4 shadow-xl opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none z-20 border border-slate-200">
                  
                  {/* Tooltip Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{zone.id}</div>
                      <div className="font-bold text-slate-800 text-sm">{zone.name}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase text-white ${config.color}`}>
                      {zone.status}
                    </span>
                  </div>
                  
                  {/* Tooltip Metrics */}
                  <div className="space-y-3 text-xs">
                    
                    {/* Power Bar */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-500">Power Output</span>
                        <span className="font-mono font-bold text-slate-700">{zone.power} / {zone.capacity} kW</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${config.color}`} 
                          style={{ width: `${(zone.power / zone.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Module Count */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Grid3x3 size={14} className="text-blue-500" />
                        <span>Modules Monitored:</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {zone.moduleCount}
                      </span>
                    </div>

                  </div>
                </div>
              )}
              {/* End Tooltip */}

            </div>
          );
        })}

        {/* --- THE LOGIC SELECT BOX (POPOVER MENU) --- */}
        {selectedZone && (
          <div 
            className="absolute z-30 bg-white rounded-lg shadow-xl border border-slate-200 p-2 w-48 animate-in fade-in zoom-in duration-200"
            style={{ 
              left: menuPosition.x + 20,
              top: menuPosition.y - 50
            }}
          >
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">
              Navigate to {selectedZone.id}:
            </div>
            <div className="flex flex-col gap-1">
              {/* Inverter Button */}
              <button 
                onClick={() => handleMenuNavigate('inverter')}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors text-left"
              >
                <span className="flex items-center gap-2"><Zap size={16} /> Inverters</span>
                <ArrowRight size={14} className="text-slate-400" />
              </button>
              {/* Module Button */}
              <button 
                onClick={() => handleMenuNavigate('module')}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors text-left"
              >
                <span className="flex items-center gap-2"><Layers size={16} /> Modules</span>
                <ArrowRight size={14} className="text-slate-400" />
              </button>
            </div>
          </div>
        )}
        {/* --- End Popover Menu --- */}

      </div>
    </div>
  );
}