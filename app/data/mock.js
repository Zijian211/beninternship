// 1. --- CONFIGURATION & GEOGRAPHY ---
const ZONES = {
  Z01: { id: "Z-01", name: "North-West Field", capacity: 500, rows: 12, cols: 24, invCount: 2 }, 
  Z02: { id: "Z-02", name: "North-East Field", capacity: 500, rows: 12, cols: 24, invCount: 2 },
  Z03: { id: "Z-03", name: "South-West Field",  capacity: 300, rows: 10, cols: 20, invCount: 3 },
  Z04: { id: "Z-04", name: "South-East Field",   capacity: 200, rows: 8,  cols: 18, invCount: 2 }
};


// --- 2. THE SINGLE SOURCE OF TRUTH (SCENARIOS) ---
const SENSOR_SCENARIOS = {
  // --- ZONE 1: NORMAL ---
  // --- mostly perfect, slightly randomized below ---

  // --- ZONE 2: ENVIRONMENTAL WARNING (Dust) ---
  "Z-02": { status: "warning", issue: "Environmental" },
  "ENV-02-DUST": { value: 450, status: "warning", type: "dust" },
  "SEC-02-WATER": { value: 1, status: "warning", type: "water" },

  // --- ZONE 3: INVERTER WARNING (Vibration) ---
  "INV-03-01": { vibration: 0.18, acoustic: 85, fanSpeed: 400, status: "warning" },

  // --- ZONE 4: SAFETY FAULT (Arc/Fire) ---
  "STR-04-05": { arcFault: "DETECTED", voltage: 0, status: "fault" },
  "SEC-04-FIRE": { value: 1, status: "critical", type: "fire" }
};


// --- 3. PHYSICS ENGINE ---
const calculatePowerOutput = (capacityKw, irradiance, temp, efficiencyLoss = 0) => {
  const sunFactor = irradiance / 1000; 
  const heatLoss = temp > 25 ? (temp - 25) * 0.004 : 0; 
  const systemEff = 0.96 - efficiencyLoss; 
  let output = capacityKw * sunFactor * (1 - heatLoss) * systemEff;
  return Math.max(0, parseFloat(output.toFixed(1)));
};


// --- 4. FIELD CONDITIONS ---
const CONDITIONS = [
  { zone: ZONES.Z01, irradiance: 950, temp: 32, wind: 5.5, effLoss: 0.0 }, 
  { zone: ZONES.Z02, irradiance: 800, temp: 34, wind: 4.2, effLoss: 0.15 }, 
  { zone: ZONES.Z03, irradiance: 940, temp: 38, wind: 4.0, effLoss: 0.05 }, 
  { zone: ZONES.Z04, irradiance: 920, temp: 29, wind: 4.5, effLoss: 0.0 }, 
];


// --- 5. DATA GENERATION (Detailed Module Physics) ---
const generateZoneData = (zoneConfig, temp) => {
  const { rows, cols, id, invCount, name } = zoneConfig;
  const matrix = [];
  const flatModules = []; 
  let moduleCounter = 0;
  const panelsPerString = 20;

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      // --- Cut corners & Central Road ---
      const isCornerCut = (r < 2 && c < 3) || (r > rows - 3 && c > cols - 4);
      const isCentralRoad = (c === Math.floor(cols / 2)); 
      
      if (isCornerCut || isCentralRoad) {
        row.push(null); 
      } else {
        moduleCounter++;
        
        // --- ID Generation ---
        const currentStringNum = Math.ceil(moduleCounter / panelsPerString);
        const panelNumInString = ((moduleCounter - 1) % panelsPerString) + 1;
        const invIndex = (currentStringNum - 1) % invCount;
        
        const assignedInvId = `INV-${id.split('-')[1]}-0${invIndex + 1}`;
        const stringId = `STR-${id.split('-')[1]}-${currentStringNum.toString().padStart(2, '0')}`;
        const panelId = `P-${panelNumInString.toString().padStart(2, '0')}`;
        const uniqueKey = `${stringId}-${panelId}`;

        // --- INTELLIGENT STATUS LOGIC ---
        let status = "normal";
        let voltage = (32 + Math.random()).toFixed(1);
        let current = 9.1;
        let issueType = null;

        // --- 1. CRITICAL FAULTS (From Scenarios) ---
        if (SENSOR_SCENARIOS[stringId]?.arcFault === "DETECTED") {
            status = "fault"; // --- RED: Arc Fault ---
            voltage = 0;
            current = 0;
            issueType = "Arc Fault";
        }
        
        // --- 2. RANDOM REALISTIC ISSUES (The "Yellow" & "Red" variance you asked for) ---
        else {
            const rand = Math.random();
            
            // --- Zone 1: Mostly perfect, rare random outlier ---
            if (id === "Z-01" && rand > 0.995) {
                status = "warning"; // --- Rare Shading ---
                issueType = "Partial Shading";
            }

            // --- Zone 2 (Dusty): Random "Uneven Soiling" (Yellow) ---
            if (id === "Z-02" && rand > 0.92) {
                status = "warning";
                current = (current * 0.7).toFixed(1);
                issueType = "Uneven Soiling";
            }

            // --- Zone 3 (Vibration): Aging / PID Issues (Yellow) ---
            if (id === "Z-03" && rand > 0.96) {
                status = "warning";
                voltage = (voltage * 0.9).toFixed(1);
                issueType = "PID Warning";
            }

            // --- Zone 4 (Faulty Zone): Nearby Hotspots (Yellow) near the fault ---
            if (id === "Z-04" && status !== "fault" && rand > 0.90) {
                status = "warning";
                issueType = "IR Hotspot"; // --- Thermal camera detected this ---
            }
        }

        const cellData = {
          type: "module",
          status: status,
          issue: issueType, // --- Added specific issue text for Tooltips ---
          stringId: stringId,
          panelId: panelId,
          inverterId: assignedInvId, 
          zoneName: name,            
          key: uniqueKey,
          v: voltage, 
          c: current
        };

        row.push(cellData);
        flatModules.push(cellData);
      }
    }
    matrix.push(row);
  }
  return { matrix, flatModules, moduleCount: moduleCounter };
};

// --- Process Zones ---
const PROCESSED_ZONES = CONDITIONS.map(c => {
  const data = generateZoneData(c.zone, c.temp);
  return { ...c, ...data };
});


// --- 6. COMPONENT EXPORTS ---

// --- INVERTERS (Fixed Logic) ---
export const MOCK_INVERTERS = PROCESSED_ZONES.flatMap(z => {
  const count = z.zone.invCount;
  const zonePower = calculatePowerOutput(z.zone.capacity, z.irradiance, z.temp, z.effLoss);

  return Array(count).fill(null).map((_, i) => {
    const invIdSimple = `INV-${z.zone.id.split('-')[1]}-0${i+1}`;
    const scenarioData = SENSOR_SCENARIOS[invIdSimple];

    let efficiency = 98.2 - (z.effLoss * 100); 
    if (scenarioData) {
        // --- If high vibration, drop efficiency significantly (e.g., -10 instead of -3) ---
        if (scenarioData.vibration > 0.1) efficiency -= 10.0; 
        
        // --- If status is forced to Warning, ensure efficiency is logically low ---
        if (scenarioData.status === 'warning' && efficiency > 89) {
            efficiency = 88.5; //
        }
        
        // --- If status is Fault, kill the efficiency ---
        if (scenarioData.status === 'fault') {
            efficiency = 0;
        }
    }

    let status = "Normal";
    if (efficiency < 90) status = "Warning";
    // --- Override status if scenario explicitly dictates ---
    if (scenarioData?.status) status = String(scenarioData.status).charAt(0).toUpperCase() + String(scenarioData.status).slice(1);

    return {
      id: invIdSimple, 
      zoneId: z.zone.id,
      zoneName: z.zone.name,
      capacity: parseFloat((z.zone.capacity / count).toFixed(0)),
      currentPower: status === "Fault" ? 0 : (zonePower / count).toFixed(1),
      efficiency: parseFloat(efficiency.toFixed(1)), 
      temp: parseFloat((z.temp + 5).toFixed(1)),
      status: status
    };
  });
});
// --- SENSORS (Unchanged Logic) ---
export const MOCK_ALL_SENSORS = [
  { id: "ENV-01-RAD", level: "Environmental", name: "Radiometer (Z1)", type: "irradiance", value: 950, unit: "W/m²", status: "normal" },
  { id: "ENV-01-WIND", level: "Environmental", name: "Wind Speed (Z1)", type: "wind", value: 5.5, unit: "m/s", status: "normal" },
  { id: "ENV-02-DUST", level: "Environmental", name: "Dust Sensor (Z2)", type: "dust", value: 450, unit: "µg/m³", status: "warning" },
  { id: "SEC-02-WATER", level: "Security", name: "Water Accumulation (Z2)", type: "water", value: 1, unit: "Binary", status: "warning" },
  { id: "ENV-02-AZIMUTH", level: "Environmental", name: "Solar Azimuth", type: "azimuth", value: 182, unit: "deg", status: "normal" },
  { id: "INV-02-VIB", level: "Inverter/AC", name: "Strain/Vibration (Inv-02)", type: "vibration", value: 0.18, unit: "g", status: "warning" },
  { id: "INV-02-ACO", level: "Inverter/AC", name: "Acoustic Sensor (Inv-02)", type: "sound", value: 85, unit: "dB", status: "warning" },
  { id: "INV-03-FAN", level: "Inverter/AC", name: "Fan Speed (Inv-03)", type: "fan", value: 400, unit: "RPM", status: "warning" },
  { id: "INV-03-HARM", level: "Inverter/AC", name: "Harmonic Analysis (Inv-03)", type: "wave", value: 4.2, unit: "%", status: "normal" },
  { id: "STR-04-ARC", level: "String/DC", name: "Fault Arc Sensor (Str-04)", type: "arc", value: "DETECTED", unit: "State", status: "fault" },
  { id: "SEC-04-FIRE", level: "Security", name: "Smoke/Flame Sensor", type: "fire", value: 1, unit: "Binary", status: "fault" },
  { id: "SEC-04-TILT", level: "Security", name: "Tilt Sensing (Rack)", type: "tilt", value: 0.5, unit: "deg", status: "normal" },
  { id: "MOD-04-IR", level: "Module", name: "IR Thermal Imaging", type: "thermal", value: 65, unit: "°C", status: "warning" },
];

// --- FIELD MAP (Aggregates Module Faults Now) ---
export const MOCK_FIELD = PROCESSED_ZONES.map(z => {
  const zoneInverters = MOCK_INVERTERS.filter(inv => inv.zoneId === z.zone.id);
  const zoneModules = z.flatModules;

  // --- 1. Count Faults ---
  const criticalFaults = zoneModules.filter(m => m.status === 'fault').length;
  const warningFaults = zoneModules.filter(m => m.status === 'warning').length;
  const hasInverterFault = zoneInverters.some(inv => inv.status === 'Fault');
  const hasInverterWarning = zoneInverters.some(inv => inv.status === 'Warning');
  const isZone2Dusty = z.zone.id === 'Z-02'; 

  // --- 2. Determine Zone Status ---
  let status = "normal"; 

  // --- If >5% of modules have warnings, or inverter warning, or dust -> Warning ---
  if (hasInverterWarning || isZone2Dusty || warningFaults > 5) status = "warning";
  
  // --- If ANY critical module fault (Arc) or Inverter Fault -> Fault (Red) ---
  if (criticalFaults > 0 || hasInverterFault) status = "fault"; 

  return {
    id: z.zone.id,
    name: z.zone.name,
    power: calculatePowerOutput(z.zone.capacity, z.irradiance, z.temp, z.effLoss),
    capacity: z.zone.capacity,
    moduleCount: z.moduleCount,
    status: status,
    x: z.zone.id === 'Z-01' ? 20 : z.zone.id === 'Z-02' ? 70 : z.zone.id === 'Z-03' ? 30 : 65,
    y: z.zone.id === 'Z-01' ? 30 : z.zone.id === 'Z-02' ? 25 : z.zone.id === 'Z-03' ? 70 : 65,
  };
});

// --- MODULES (Flat List) ---
export const MOCK_MODULES = PROCESSED_ZONES.flatMap(z => {
  const stringsMap = {};
  z.flatModules.forEach(m => {
    // --- Group into strings logic ---
    if (!stringsMap[m.stringId]) {
      stringsMap[m.stringId] = {
        id: m.stringId, inverterId: m.inverterId,
        zoneId: z.zone.id, zoneName: z.zone.name,
        status: "normal", panels: []
      };
    }
    stringsMap[m.stringId].panels.push(m);
  });
  
  return Object.values(stringsMap).map(str => {
    const hasFault = str.panels.some(p => p.status === 'fault');
    const hasWarning = str.panels.some(p => p.status === 'warning');
    
    if (hasFault) str.status = "fault";
    else if (hasWarning) str.status = "warning";
    else str.status = "normal";
    
    return str;
  });
});

// --- STATION MAP (Matrix View) ---
export const MOCK_STATION_MAP = {
  zones: PROCESSED_ZONES.map(z => ({
    id: z.zone.id, 
    name: z.zone.name,
    matrix: z.matrix
  }))
};

export const MOCK_STATION_STATUS = {
  power: { value: 450.5, unit: "kW", trend: "up" },
  dailyEnergy: { value: 1250, unit: "kWh" },
  co2: { value: 850, unit: "kg" },
  safetyDays: 124, 
  weather: { temp: 33, condition: "Sunny" }
};

export const MOCK_ANALYSIS_DATA = [
  { time: '06:00', power: 0 }, { time: '08:00', power: 120 }, { time: '10:00', power: 450 },
  { time: '12:00', power: 980 }, { time: '14:00', power: 850 }, { time: '16:00', power: 340 },
  { time: '18:00', power: 50 }, { time: '20:00', power: 0 },
];

export const MOCK_CAMERAS = [
  { id: "CAM-01", name: "Main Gate", status: "online", url: "/api/placeholder/400/300" },
  { id: "CAM-02", name: "Inverter Room A", status: "online", url: "/api/placeholder/400/300" },
  { id: "CAM-03", name: "PV Field North", status: "online", url: "/api/placeholder/400/300" },
  { id: "CAM-04", name: "Substation", status: "offline", url: "" }, 
];

export const MOCK_ROBOTS = [
  { id: "R-01", name: "Cleaner Alpha", type: "cleaning", battery: 85, status: "working", location: "Zone A" },
  { id: "R-02", name: "Cleaner Beta", type: "cleaning", battery: 12, status: "charging", location: "Docking Stn" },
  { id: "R-03", name: "Cleaner Gamma", type: "cleaning", battery: 45, status: "idle", location: "Zone B" },
  { id: "D-01", name: "Inspector X", type: "drone", battery: 92, status: "working", location: "Zone C (Air)" },
  { id: "R-04", name: "Cleaner Delta", type: "cleaning", battery: 0, status: "error", location: "Zone D" },
];

export const MOCK_EDGE_NODES = [
  { id: "EDGE-01", name: "Gateway North", ip: "192.168.1.101", status: "online", cpu: 45, ram: 60, temp: 42, latency: "12ms" },
  { id: "EDGE-02", name: "Gateway South", ip: "192.168.1.102", status: "online", cpu: 78, ram: 85, temp: 55, latency: "15ms" },
  { id: "EDGE-03", name: "Substation Controller", ip: "192.168.1.200", status: "offline", cpu: 0, ram: 0, temp: 0, latency: "-" },
  { id: "EDGE-04", name: "Met Mast Logger", ip: "192.168.1.50", status: "online", cpu: 12, ram: 30, temp: 38, latency: "45ms" },
];