import React from "react";
import { ExternalLink, Grid3X3 } from "lucide-react";

export default function StationMap({ data, onNavigate }) {
  if (!data || !data.zones) return null;

  return (
    <div className="h-full w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col animate-in fade-in zoom-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
           <Grid3X3 size={18} className="text-slate-400" />
           Station Topology (Click a Zone or Panel to jump to Module View)
        </h3>
        
        {/* Legend */}
        <div className="flex gap-3 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Normal</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-400 rounded-full"></span> Warning</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Fault</div>
        </div>
      </div>

      {/* The Zones Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 gap-6 content-start pr-2 custom-scrollbar">
        {data.zones.map((zone) => (
          <div key={zone.id} className="relative bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors group/zone">
            
            {/* --- CLICKABLE ZONE HEADER (UPDATED) --- */}
            {/* Drills to MODULE View for the whole Zone */}
            <button 
                onClick={() => onNavigate && onNavigate('module', { zone: zone.name })}
                className="absolute -top-2.5 left-3 px-2 py-0.5 bg-white text-[10px] font-bold text-slate-500 rounded-md shadow-sm border border-slate-200 hover:text-blue-600 hover:border-blue-400 hover:shadow-md transition-all flex items-center gap-1 z-10"
            >
              {zone.id} • {zone.name} <ExternalLink size={10} />
            </button>
            
            {/* The Matrix Visualization */}
            <div className="flex flex-col gap-0.5 mt-2">
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
                    
                    // --- Tooltip Logic ---
                    const tooltipText = cell.status === 'normal' 
                        ? `${cell.panelId} (String ${cell.stringId}) are ${cell.status}`
                        : `⚠️ ${cell.issue || cell.status} detected at ${cell.panelId}, String ${cell.stringId}`;

                    return (
                      <div 
                        key={`${rIndex}-${cIndex}`} 
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[1px] transition-all cursor-pointer hover:scale-150 hover:shadow-lg hover:z-50 ${colorClass}`} 
                        // --- CLICKABLE DOT (Drills to Specific Module) ---
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onNavigate) {
                                // --- Jump to Module Tab, Filter by this specific Inverter ---
                                onNavigate('module', { zone: cell.zoneName, inverter: cell.inverterId });
                            }
                        }}
                        title={tooltipText}
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