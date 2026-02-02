import React, { useState } from "react";
import { 
  Video, Camera, 
  LayoutDashboard, Map, Zap, Grid3x3, Wind, Bot, Server, 
  ClipboardCheck, BarChart3, Stethoscope, TrendingUp, 
  ChevronDown, ChevronRight 
} from "lucide-react";

// --- Define the MENU STRUCTURE ---
const MENU_STRUCTURE = [
  {
    id: "cctv_parent",
    label: "实时监测",
    subLabel: "REAL-TIME MONITORING",
    icon: Video,
    type: "parent",
    children: [
      // --- INTERNAL MODULES (Blue) ---
      { id: "station", label: "电站层", sub: "STATION LAYER", icon: LayoutDashboard },
      { id: "field", label: "场区层", sub: "FIELD VIEW", icon: Map },
      { id: "inverter", label: "逆变器层", sub: "INVERTER", icon: Zap },
      { id: "module", label: "组串/组件层", sub: "STRING/MODULE MATRIX", icon: Grid3x3 },
      // --- EXTERNAL MODULES (Green) ---
      { id: "sensors", label: "传感器", sub: "SENSORS", icon: Wind },
      { id: "robots", label: "机器人", sub: "ROBOTS", icon: Bot },
      { id: "edge", label: "边缘计算点", sub: "EDGE NODES", icon: Server },
      { id: "camera", label: "摄像头", sub: "CAMERA", icon: Camera },
    ]
  },
  {
    id: "diagnosis",
    label: "智能诊断",
    subLabel: "AI DIAGNOSIS",
    icon: ClipboardCheck,
    type: "link"
  },
  {
    id: "analysis",
    label: "统计分析",
    subLabel: "STATISTICS",
    icon: BarChart3,
    type: "link"
  },
  {
    id: "health",
    label: "健康管理",
    subLabel: "HEALTH MGMT",
    icon: Stethoscope,
    type: "link"
  },
  {
    id: "report",
    label: "报表生成",
    subLabel: "REPORTS",
    icon: TrendingUp,
    type: "link"
  }
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isCctvOpen, setIsCctvOpen] = useState(true);

  return (
    <div className="flex flex-col w-full px-2">
      {MENU_STRUCTURE.map((item) => {
        // --- Check if this item OR any of its children are currently active ---
        const isActiveParent = 
          activeTab === item.id || 
          (item.children && item.children.some(child => child.id === activeTab));

        return (
          <div key={item.id} className="mb-2">
            
            {/* PARENT ITEM / SINGLE LINK */}
            <button
              onClick={() => {
                if (item.type === 'parent') setIsCctvOpen(!isCctvOpen);
                else setActiveTab(item.id);
              }}
              // --- Use the variable 'isActiveParent' here instead of the simple check ---
              className={`btn-main ${isActiveParent ? 'btn-main-active' : ''}`}
            >
              <div className="flex items-center">
                <div className={`p-1.5 rounded-lg mr-3 ${isActiveParent ? 'bg-white/20' : 'bg-slate-200'}`}>
                  <item.icon size={20} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm leading-none mb-0.5">{item.label}</span>
                  <span className="text-[10px] font-normal opacity-70 tracking-widest uppercase">{item.subLabel}</span>
                </div>
              </div>
              {item.type === 'parent' && (
                <div className="text-slate-400">
                  {isCctvOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              )}
            </button>

          {/* SUB-MENU ITEMS */}
          {item.type === 'parent' && isCctvOpen && (
            <div className="flex flex-col gap-1 mt-1 animate-in slide-in-from-top-2 duration-200">
              {item.children.map((sub) => {
                
                // --- LOGIC TO DISTINGUISH INTERNAL VS EXTERNAL ---
                const isExternal = ['sensors', 'robots', 'edge', 'camera'].includes(sub.id);
                const isActive = activeTab === sub.id;

                // --- Build class string: Base + Theme (Blue vs Green) ---
                let btnClass = "btn-sub-base ";
                
                if (isExternal) {
                  // --- Green Theme for External Modules ---
                  btnClass += isActive ? "btn-sub-green-active" : "btn-sub-green";
                } else {
                  // --- Blue Theme for Internal Modules ---
                  btnClass += isActive ? "btn-sub-blue-active" : "btn-sub-blue";
                }

                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveTab(sub.id)}
                    className={btnClass}
                  >
                    <sub.icon size={16} className="mr-3" />
                    <div className="flex flex-col items-start">
                      <span className="leading-none">{sub.label}</span>
                      <span className="text-[9px] uppercase opacity-70 tracking-wider mt-0.5">{sub.sub}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}

// --- Export a helper to find the current item details for the Header ---
export const getItemDetails = (id) => {
  for (const item of MENU_STRUCTURE) {
    if (item.id === id) return { cn: item.label, en: item.subLabel, icon: item.icon };
    if (item.children) {
      const child = item.children.find(c => c.id === id);
      if (child) return { cn: child.label, en: child.sub, icon: child.icon };
    }
  }
  return { cn: "Dashboard", en: "OVERVIEW", icon: LayoutDashboard };
};