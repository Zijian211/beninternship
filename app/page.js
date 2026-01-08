"use client";
import React, { useState, useEffect } from "react";
import Sidebar, { getItemDetails } from "./components/menu/Sidebar"; 
import GitHubLink from "./components/menu/GitHubLink";
import StationPowerChart from "./components/charts/StationPowerChart";
import StationPowerCard from "./components/cards/StationPowerCard";
import StationMap from "./components/charts/StationMap";
import InverterView from "./components/views/InverterView";
import ModuleMatrixView from "./components/views/ModuleMatrixView";
import CameraGridView from "./components/views/CameraGridView";
import SensorCard from "./components/cards/SensorCard";
import FieldMap from "./components/charts/FieldMap"; 
import RobotView from "./components/views/RobotView";
import EdgeNodeBar from "./components/charts/EdgeNodeBar";

export default function Dashboard() {
  // --- 1. STATE MANAGEMENT ---
  // --- Controls which view is currently visible (station, inverter, sensors, etc.) ---
  const [activeTab, setActiveTab] = useState("station");
  
  // --- Stores the raw data fetched from the API for the current view ---
  const [stationData, setStationData] = useState(null);
  
  // --- Loading state to show spinners/placeholders during data fetch ---
  const [loading, setLoading] = useState(false);
  
  // --- NAVIGATION CONTEXT ---
  const [navContext, setNavContext] = useState({ zone: "ALL", inverter: "ALL", level: "ALL" });

  // --- Get display details (Icon, English Name, Chinese Name) for the header ---
  const currentItem = getItemDetails(activeTab); 

  // --- 2. DATA FETCHING EFFECT ---
  // --- Triggered whenever 'activeTab' changes, fetches relevant data from the API ---
  useEffect(() => {
    setStationData(null); 
    setLoading(true);

    // --- Map tabs to their specific API endpoints ---
    const apiMap = {
      station: '/api/monitoring/station',
      inverter: '/api/monitoring/inverter',
      module: '/api/monitoring/module',
      camera: '/api/monitoring/camera',
      sensors: '/api/monitoring/sensor',
      field: '/api/monitoring/field',
      robots: '/api/monitoring/robot',
      edge: '/api/monitoring/edge',
    };
    const url = apiMap[activeTab];

    if (url) {
      fetch(url)
        .then((res) => res.json())
        .then((json) => { if (json.data) setStationData(json.data); })
        .catch((err) => console.error(`${activeTab} API Error:`, err))
        .finally(() => setLoading(false));
    } else { 
        setLoading(false); 
    }
  }, [activeTab]);

  // --- 3. DRILL DOWN HANDLER ---
  // --- This function is passed down to child components (Maps, Cards), allowing a child to change the Main Dashboard Tab and set filters ---

  const handleDrillDown = (targetTab, context = {}) => {
    setNavContext({
      zone: context.zone || "ALL",
      inverter: context.inverter || "ALL",
      level: context.level || "ALL"
    });
    setActiveTab(targetTab);
  };

  // --- 4. VIEW RENDERER ---
  // --- Decides which component to render in the main content area ---
  const renderContent = () => {
    if (loading) return <div className="flex items-center justify-center h-full text-gray-400 animate-pulse">Loading...</div>;

    // --- A. Station Overview (KPI Cards + Trend Chart + Interactive Map) ---
    if (activeTab === 'station' && stationData) {
      return (
        <div className="flex flex-col lg:flex-row h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-full lg:w-5/12 flex flex-col gap-6 h-full overflow-y-auto pr-2">
            <StationPowerCard data={stationData.kpi} />
            <div className="flex-1 min-h-75"><StationPowerChart data={stationData.trend} /></div>
          </div>
          <div className="w-full lg:w-7/12 h-full min-h-125">
            <StationMap data={stationData.map} onNavigate={handleDrillDown} />
          </div>
        </div>
      );
    }

    // --- B. Field Map (Satellite/GIS view) ---
    if (activeTab === 'field' && stationData) return <FieldMap data={stationData} onNavigate={handleDrillDown} />;

    // --- C. Inverter Fleet View ---
    if (activeTab === 'inverter' && stationData) {
      return <InverterView data={stationData} initialFilter={navContext} onNavigate={handleDrillDown} />;
    }

    // --- D. Module Matrix (String level analysis) ---
    if (activeTab === 'module' && stationData) {
      return <ModuleMatrixView data={stationData} initialFilter={navContext} onNavigate={handleDrillDown} />;
    }

    // --- E. Sensor Diagnostics ---
    if (activeTab === 'sensors' && stationData) {
      return <SensorCard data={stationData} initialFilter={navContext} />;
    }

    // --- F. Robots View ---
    if (activeTab === 'robots' && stationData) 
      return <RobotView data={stationData} initialFilter={navContext}/>;
    
    // --- G. Other Subsystems (Robots, Edge Computing, CCTV) ---
    if (activeTab === 'edge' && stationData) return <EdgeNodeBar data={stationData} />;
    if (activeTab === 'camera' && stationData) return <CameraGridView data={stationData} />;

    return <div className="flex items-center justify-center h-full text-gray-300">Select a module</div>;
  };

  // --- 5. MAIN LAYOUT ---
  return (
    <div className="flex h-screen w-full bg-white text-slate-800 overflow-hidden relative">
      <GitHubLink /> 
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white flex flex-col border-r border-gray-200 shadow-xl shrink-0 z-20">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 shrink-0 bg-slate-50">
          <h1 className="font-bold text-xl text-blue-900 tracking-wider">EMS SYSTEM</h1>
        </div>
        <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-200">
          {/* Clicking sidebar items resets context to "ALL" to clear filters */}
          <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setNavContext({ zone: "ALL", inverter: "ALL" }); setActiveTab(tab); }} />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-8 shrink-0 shadow-sm z-10">
          <div className={`p-2 rounded-lg mr-4 bg-gray-100 text-gray-600`}><currentItem.icon size={24} /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-none">{currentItem.cn}</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{currentItem.en}</span>
          </div>
        </header>

        {/* Dynamic View Container */}
        <div className="flex-1 p-8 overflow-auto bg-slate-50/50">{renderContent()}</div>
      </main>
    </div>
  );
}