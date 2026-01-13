"use client";
import React, { useState, useMemo } from "react";
import InverterCard from "../cards/InverterCard";
import { Search, Filter } from "lucide-react";

export default function InverterView({ data, initialFilter, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    // --- SAFETY CHECK ---
    // --- Ensure 'data' is actually an Array ---
    let safeList = [];
    if (Array.isArray(data)) {
        safeList = data;
    } else if (data && Array.isArray(data.data)) {
        safeList = data.data; // --- Handle cases where API wraps result in { data: [...] } ---
    } else if (data && Array.isArray(data.inverters)) {
        safeList = data.inverters; // --- Handle cases where API wraps result in { inverters: [...] } ---
    } else {
        return []; // Fallback to empty to prevent crash
    }

    let filtered = safeList;

    // --- 1. Filter by Initial Context (from Map click) ---
    // --- Safe check to ensure zoneName exists before comparing ---
    if (initialFilter?.zone !== "ALL") {
      filtered = filtered.filter(item => item.zoneName === initialFilter.zone);
    }

    // --- 2. Filter by Status Dropdown ---
    if (filterStatus !== "ALL") {
      filtered = filtered.filter(item => item.status?.toLowerCase() === filterStatus.toLowerCase());
    }

    // --- 3. Filter by Search (ID) ---
    if (searchTerm) {
      filtered = filtered.filter(item => item.id?.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return filtered;
  }, [data, initialFilter, filterStatus, searchTerm]);

  return (
    <div className="h-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- CONTROLS HEADER --- */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-700">Inverter Fleet</h3>
            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-full">
                {filteredData.length} Units
            </span>
        </div>
        
        <div className="flex gap-2">
            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search ID..." 
                    className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {/* Filter */}
            <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                    className="pl-9 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="ALL">All Status</option>
                    <option value="normal">Normal</option>
                    <option value="warning">Warning</option>
                    <option value="fault">Fault</option>
                </select>
            </div>
        </div>
      </div>

      {/* --- GRID VIEW --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
            {filteredData.map((inverter) => (
                <InverterCard 
                    key={inverter.id} 
                    data={inverter}
                    onNavigate={onNavigate}
                    onClick={() => onNavigate('module', { zone: inverter.zoneName, inverter: inverter.id })}
                />
            ))}
            
            {filteredData.length === 0 && (
                <div className="col-span-full h-64 flex items-center justify-center text-slate-400 italic">
                    No inverters found matching your criteria.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}