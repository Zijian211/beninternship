import React from "react";
import { ExternalLink } from "lucide-react";

export default function StationMap({ data, onNavigate }) {
  if (!data || !data.zones) return null;

  return (
    <div className="h-full w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-700">Station Topology</h3>
        
        {/* Legend */}
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-sm"></span> Normal</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-400 rounded-sm"></span> Low Eff</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-sm"></span> Fault</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 bg-white border border-slate-300 rounded-sm"></span> No PV Modules</div>
        </div>
      </div>

      {/* The 4 Zones Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 gap-6 content-start pr-2 custom-scrollbar">
        {data.zones.map((zone) => (
          <div key={zone.id} className="relative bg-slate-50 p-3 rounded-lg border border-slate-100 group/zone">
            
            {/* CLICKABLE ZONE HEADER (Drills to Inverter View or Field View) */}
            <button 
                onClick={() => onNavigate && onNavigate('inverter', { zone: zone.name })}
                className="absolute top-2 left-2 px-2 py-0.5 bg-white/80 backdrop-blur text-[10px] font-bold text-slate-500 rounded shadow-sm border border-slate-200 hover:text-blue-600 hover:border-blue-300 transition-colors flex items-center gap-1 z-10"
            >
              {zone.id} -- {zone.name} <ExternalLink size={10} />
            </button>
            
            {/* The Matrix Visualization */}
            <div className="flex flex-col gap-0.5 mt-6">
              {zone.matrix.map((row, rIndex) => (
                <div key={rIndex} className="flex justify-center gap-0.5">
                  {row.map((cell, cIndex) => {
                    // --- Logic for Voids ---
                    if (!cell) {
                        return <div key={`${rIndex}-${cIndex}`} className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-0 pointer-events-none" />;
                    }

                    // --- Determine Color ---
                    let colorClass = "bg-green-500 hover:bg-green-400";
                    if (cell.status === 'warning') colorClass = "bg-yellow-400 hover:bg-yellow-300";
                    if (cell.status === 'fault') colorClass = "bg-red-500 hover:bg-red-400 animate-pulse";
                    
                    return (
                      <div 
                        key={`${rIndex}-${cIndex}`} 
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[1px] transition-all cursor-pointer hover:scale-150 hover:shadow-lg hover:z-50 ${colorClass}`} 
                        // CLICKABLE DOT (Drills to Module Matrix)
                        onClick={(e) => {
                            e.stopPropagation(); // Don't trigger zone click
                            if (onNavigate) {
                                // Jump to Module Tab, Filter by this specific Inverter
                                onNavigate('module', { zone: cell.zoneName, inverter: cell.inverterId });
                            }
                        }}
                        title={`${cell.stringId} | ${cell.panelId} (Click to View Matrix)`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}