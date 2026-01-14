import React from "react";

export default function CameraGridView({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Site Video Surveillance</h3>
          <p className="text-sm text-slate-400">Real-time IP camera feeds</p>
        </div>
        <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
          LIVE MONITORING
        </div>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((cam) => (
          <div key={cam.id} className="bg-black rounded-xl overflow-hidden shadow-lg relative group border border-slate-200">
            
            {/* Camera Header Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-linear-to-b from-black/70 to-transparent flex justify-between items-start z-10">
              <div>
                 <div className="text-white font-bold text-sm tracking-wide">{cam.name}</div>
                 <div className="text-xs text-gray-300 font-mono">{cam.id}</div>
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                cam.status === 'online' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {cam.status}
              </div>
            </div>

            {/* The "Video Feed" */}
            <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
              {cam.status === 'online' ? (
                <>
                  <video 
                    src={cam.url} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                  
                  {/* Blinking REC dot */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-mono text-white">REC</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <span className="text-4xl mb-2">🚫</span>
                  <span className="text-xs uppercase tracking-widest">Signal Lost</span>
                </div>
              )}
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}