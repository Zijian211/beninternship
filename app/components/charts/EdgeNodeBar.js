import React from "react";
import { Server, Cpu, HardDrive, Network, Wifi } from "lucide-react";

export default function EdgeNodeBar({ data }) {
  if (!data) return null;

  // --- Progress Bar Color ---
  const getUsageColor = (value) => {
    if (value > 80) return "bg-red-500";
    if (value > 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Edge Computing Nodes</h3>
          <p className="text-sm text-slate-400">Local Data Aggregation Gateways</p>
        </div>
      </div>

      {/* Server Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((node) => (
          <div key={node.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
            
            {/* Connection Status Light (Top Right) */}
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <span className={`text-xs font-bold uppercase ${node.status === 'online' ? 'text-green-600' : 'text-red-500'}`}>
                {node.status}
              </span>
              <span className={`w-3 h-3 rounded-full ${node.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            </div>

            {/* Header: Icon & Name */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-lg ${node.status === 'online' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                <Server size={28} />
              </div>
              <div>
                <h4 className="font-bold text-slate-700">{node.name}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                  <Network size={12} />
                  {node.ip}
                </div>
              </div>
            </div>

            {/* Metrics Section */}
            {node.status === 'online' ? (
              <div className="space-y-4">
                
                {/* CPU Usage */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span className="flex items-center gap-1"><Cpu size={14} /> CPU Load</span>
                    <span>{node.cpu}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${getUsageColor(node.cpu)}`} style={{ width: `${node.cpu}%` }}></div>
                  </div>
                </div>

                {/* RAM Usage */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span className="flex items-center gap-1"><HardDrive size={14} /> Memory</span>
                    <span>{node.ram}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${getUsageColor(node.ram)}`} style={{ width: `${node.ram}%` }}></div>
                  </div>
                </div>

                {/* Footer Stats (Temp & Latency) */}
                <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-50">
                   <div className="text-xs text-slate-500">
                     Temp: <span className="font-bold text-slate-700">{node.temp}°C</span>
                   </div>
                   <div className="flex items-center gap-1 text-xs text-slate-500">
                     <Wifi size={14} />
                     Latency: <span className="font-bold text-slate-700">{node.latency}</span>
                   </div>
                </div>

              </div>
            ) : (
              // --- Offline State Display ---
              <div className="h-32 flex flex-col items-center justify-center text-gray-300 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <span className="text-sm font-medium">Connection Lost</span>
                <span className="text-xs">Check physical connection</span>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}