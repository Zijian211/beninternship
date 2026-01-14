// 1. --- CONFIGURATION & GEOGRAPHY ---
const ZONES = {
  Z01: { id: "Z-01", name: "North-West Field", capacity: 500, rows: 12, cols: 24, invCount: 2 }, 
  Z02: { id: "Z-02", name: "North-East Field", capacity: 500, rows: 12, cols: 24, invCount: 2 },
  Z03: { id: "Z-03", name: "South-West Field",  capacity: 300, rows: 10, cols: 20, invCount: 3 },
  Z04: { id: "Z-04", name: "South-East Field",   capacity: 200, rows: 8,  cols: 18, invCount: 2 }
};

// --- 2. THE SINGLE SOURCE OF TRUTH (SCENARIOS) ---
const SENSOR_SCENARIOS = {
  // --- Hardcoded Environmental Sensors (Base) ---
  "ENV-02-DUST": { value: 450, status: "warning", type: "dust" },
  "SEC-02-WATER": { value: 1, status: "warning", type: "water" },
  
  // --- FORCED FAULT: We explicitly force String 05 in Zone 4 to have an Arc Fault ---
  "STR-04-05": { arcFault: "DETECTED", voltage: 0, status: "fault" }, 
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

// --- 5. DATA GENERATION (The Master Generator) ---
const generateZoneData = (zoneConfig, temp) => {
  const { rows, cols, id, invCount, name } = zoneConfig;
  const matrix = [];      // For Visual Map (Grid)
  const flatModules = []; // For Calculations (List)
  let moduleCounter = 0;
  const panelsPerString = 20;

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      // --- Logic to cut corners and make central roads ---
      const isCornerCut = (r < 2 && c < 3) || (r > rows - 3 && c > cols - 4);
      const isCentralRoad = (c === Math.floor(cols / 2)); 
      
      if (isCornerCut || isCentralRoad) {
        row.push(null); 
      } else {
        moduleCounter++;
        
        // --- Identity Assignment ---
        const currentStringNum = Math.ceil(moduleCounter / panelsPerString);
        const panelNumInString = ((moduleCounter - 1) % panelsPerString) + 1;
        const invIndex = (currentStringNum - 1) % invCount;
        
        const assignedInvId = `INV-${id.split('-')[1]}-0${invIndex + 1}`;
        const stringId = `STR-${id.split('-')[1]}-${currentStringNum.toString().padStart(2, '0')}`;
        const panelId = `P-${panelNumInString.toString().padStart(2, '0')}`;
        const uniqueKey = `${stringId}-${panelId}`;

        // --- Status Logic ---
        let status = "normal";
        let voltage = (32 + Math.random()).toFixed(1);
        let current = (9.0 + (Math.random() * 0.2)).toFixed(1); 
        let issueType = null;

        // --- A. CHECK SCENARIOS (Priority 1) ---
        if (SENSOR_SCENARIOS[stringId]?.arcFault === "DETECTED") {
            status = "fault"; 
            issueType = "Arc Fault"; 
            voltage = 0; current = 0;
        }

        // --- B. RANDOM FAILURES (Priority 2) ---
        if (status === "normal") {
            const rand = Math.random();
            
            // --- Critical Faults (0.2% chance per panel) ---
            if (rand > 0.998) {
                status = "fault";
                const faults = ["Arc Fault", "Ground Fault", "Diode Failure"];
                issueType = faults[Math.floor(Math.random() * faults.length)];
                voltage = 0; current = 0;
            }
            // --- Warnings (3% chance per panel) ---
            else if (rand > 0.97) {
                status = "warning";
                const issues = ["Partial Shading", "Uneven Soiling", "PID Warning", "IR Hotspot"];
                issueType = issues[Math.floor(Math.random() * issues.length)];
                
                // --- Physics impact ---
                if (issueType.includes("Shading") || issueType.includes("Soiling")) current = (current * 0.6).toFixed(1);
                if (issueType.includes("PID")) voltage = (voltage * 0.85).toFixed(1);
            }
            
            // --- Bias: Zone 2 is dusty ---
            if (id === "Z-02" && status === "normal" && rand > 0.94) {
                status = "warning";
                issueType = "Uneven Soiling";
                current = (current * 0.75).toFixed(1);
            }
        }

        const cellData = {
          type: "module",
          status: status,
          issue: issueType, 
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

// --- PROCESS ZONES ONCE (FROZEN STATE) ---
// --- This object now holds the absolute truth for the rest of the app lifetime ---
const PROCESSED_ZONES = CONDITIONS.map(c => {
  const data = generateZoneData(c.zone, c.temp);
  return { ...c, ...data };
});


// --- 6. COMPONENT EXPORTS (DERIVED DATA) ---

// --- 6a. MODULES (List View) ---
// --- Created this by grouping the ALREADY PROCESSED flatModules ---
const rawStringsMap = {};

PROCESSED_ZONES.forEach(z => {
  z.flatModules.forEach(m => {
    if (!rawStringsMap[m.stringId]) {
      rawStringsMap[m.stringId] = {
        id: m.stringId, 
        inverterId: m.inverterId,
        zoneId: z.zone.id, 
        zoneName: z.zone.name,
        panels: []
      };
    }
    rawStringsMap[m.stringId].panels.push(m);
  });
});

export const MOCK_MODULES = Object.values(rawStringsMap).map(str => {
    // --- If a panel is faulty, the string is faulty ---
    const hasFault = str.panels.some(p => p.status === 'fault');
    const hasWarning = str.panels.some(p => p.status === 'warning');
    
    let status = "normal";
    if (hasFault) status = "fault";
    else if (hasWarning) status = "warning";
    
    // --- Find the specific issue to display on the String Card ---
    const faultyPanel = str.panels.find(p => p.status === 'fault') || str.panels.find(p => p.status === 'warning');
    const mainIssue = faultyPanel ? faultyPanel.issue : null;

    return { ...str, status, issue: mainIssue };
});


// --- 6b. INVERTERS (Real-time Aggregation) ---
export const MOCK_INVERTERS = PROCESSED_ZONES.flatMap(z => {
  const count = z.zone.invCount;

  return Array(count).fill(null).map((_, i) => {
    const invIdSimple = `INV-${z.zone.id.split('-')[1]}-0${i+1}`;
    
    // --- Filter the MASTER list for this inverter's panels ---
    const myModules = z.flatModules.filter(m => m.inverterId === invIdSimple);
    
    // --- Real Physics: Sum of (V * I) of all panels ---
    const realPowerW = myModules.reduce((acc, m) => acc + (parseFloat(m.v) * parseFloat(m.c)), 0);
    const realPowerkW = (realPowerW / 1000).toFixed(1);
    
    // --- Status Logic ---
    const hasFault = myModules.some(m => m.status === 'fault');
    const hasWarning = myModules.some(m => m.status === 'warning');
    
    let status = "Normal";
    if (hasWarning) status = "Warning";
    if (hasFault) status = "Fault"; 

    // --- Efficiency impacts ---
    let efficiency = 98.5;
    if (status === "Warning") efficiency = 95.0;
    if (status === "Fault") efficiency = 0;

    return {
      id: invIdSimple, 
      zoneId: z.zone.id,
      zoneName: z.zone.name,
      capacity: parseFloat((z.zone.capacity / count).toFixed(0)),
      currentPower: realPowerkW,
      efficiency: efficiency,
      temp: parseFloat((z.temp + 5).toFixed(1)),
      status: status
    };
  });
});


// --- 6c. SENSORS (Reactive Generation) ---
// --- Connected the physical fault to the digital sensor readout ---
const BASE_SENSORS = [
  { id: "ENV-01-RAD", level: "Environmental", name: "Radiometer (Z1)", type: "irradiance", value: 950, unit: "W/m²", status: "normal" },
  { id: "ENV-01-WIND", level: "Environmental", name: "Wind Speed (Z1)", type: "wind", value: 5.5, unit: "m/s", status: "normal" },
  { id: "ENV-02-DUST", level: "Environmental", name: "Dust Sensor (Z2)", type: "dust", value: 450, unit: "µg/m³", status: "warning" },
  { id: "SEC-02-WATER", level: "Security", name: "Water Accumulation (Z2)", type: "water", value: 1, unit: "Binary", status: "warning" },
  { id: "ENV-02-AZIMUTH", level: "Environmental", name: "Solar Azimuth", type: "azimuth", value: 182, unit: "deg", status: "normal" },
  { id: "SEC-04-FIRE", level: "Security", name: "Smoke/Flame Sensor", type: "fire", value: 0, unit: "Binary", status: "normal" }, 
];

const generatedSensors = [];

// --- A. Inverter Sensors ---
MOCK_INVERTERS.forEach(inv => {
    if (inv.status !== "Normal") {
        if (inv.status === "Warning") {
            generatedSensors.push({
                id: `${inv.id}-VIB`, level: "Inverter/AC", name: `Vibration (${inv.id})`, 
                type: "vibration", value: 0.22, unit: "g", status: "warning"
            });
        }
        if (inv.status === "Fault") {
             generatedSensors.push({
                id: `${inv.id}-ACO`, level: "Inverter/AC", name: `Acoustic (${inv.id})`, 
                type: "sound", value: 95, unit: "dB", status: "fault"
            });
        }
    }
});

// --- B. String/Module Sensors ---
MOCK_MODULES.forEach(str => {
    if (str.status !== 'normal') {
        const issue = str.issue; 

        // --- Critical Faults ---
        if (issue === "Arc Fault") {
            generatedSensors.push({
                id: `${str.id}-ARC`, level: "String/DC", name: `Arc Sensor (${str.id})`, 
                type: "arc", value: "DETECTED", unit: "State", status: "fault"
            });
        }
        
        if (issue === "Ground Fault") {
            generatedSensors.push({
                id: `${str.id}-GND`, level: "String/DC", name: `Riso Sensor (${str.id})`, 
                type: "ohm", value: 0.01, unit: "MΩ", status: "fault"
            });
        }

        if (issue === "Diode Failure") {
            generatedSensors.push({
                id: `${str.id}-DIO`, level: "Module", name: `Diode Health (${str.id})`, 
                type: "voltage", value: 0, unit: "V", status: "fault"
            });
        }

        // --- Warnings ---
        if (issue === "PID Warning") {
            generatedSensors.push({
                id: `${str.id}-ISO`, level: "String/DC", name: `Insulation (${str.id})`, 
                type: "ohm", value: 0.2, unit: "MΩ", status: "warning"
            });
        }

        if (issue === "IR Hotspot") {
             generatedSensors.push({
                id: `${str.id}-IR`, level: "Module", name: `Thermal Cam (${str.id})`, 
                type: "thermal", value: 75, unit: "°C", status: "warning"
            });
        }
        
        // --- Catch-all for visual warnings (Soiling/Shading) ---
        if (str.status === "warning" && !["PID Warning", "IR Hotspot"].includes(issue)) {
             generatedSensors.push({
                id: `${str.id}-EFF`, level: "String/DC", name: `String Efficiency (${str.id})`, 
                type: "current", value: 3.5, unit: "A", status: "warning"
            });
        }
    }
});

export const MOCK_ALL_SENSORS = [...BASE_SENSORS, ...generatedSensors];


// --- 6d. STATION MAP (Visual Grid) ---
export const MOCK_STATION_MAP = {
  zones: PROCESSED_ZONES.map(z => ({
    id: z.zone.id, 
    name: z.zone.name,
    matrix: z.matrix 
  }))
};


// --- ROBOTS ---
export const MOCK_ROBOTS = [
  { id: "R-01", name: "Cleaner Alpha", type: "cleaning", battery: 85, status: "working", location: "North-West Field", zoneId: "Z-01" },
  { id: "R-02", name: "Cleaner Beta", type: "cleaning", battery: 12, status: "charging", location: "North-East Field", zoneId: "Z-02" },
  { id: "R-03", name: "Cleaner Gamma", type: "cleaning", battery: 45, status: "idle", location: "South-West Field", zoneId: "Z-03" },
  { id: "D-01", name: "Inspector X", type: "drone", battery: 92, status: "working", location: "North-East Field", zoneId: "Z-02" },
  { id: "R-04", name: "Cleaner Delta", type: "cleaning", battery: 0, status: "error", location: "South-East Field", zoneId: "Z-04" },
  { id: "R-05", name: "Cleaner Epsilon", type: "cleaning", battery: 78, status: "working", location: "North-West Field", zoneId: "Z-01" },
  { id: "R-06", name: "Cleaner Zeta", type: "cleaning", battery: 64, status: "working", location: "South-West Field", zoneId: "Z-03" },
  { id: "D-02", name: "Inspector Y", type: "drone", battery: 100, status: "idle", location: "South-East Field", zoneId: "Z-04" },
];


// --- FIELD OVERVIEW (High Level) ---
export const MOCK_FIELD = PROCESSED_ZONES.map(z => {
  const zoneModules = z.flatModules;

  // --- Real Power Sum ---
  const realZonePowerW = zoneModules.reduce((acc, m) => acc + (parseFloat(m.v) * parseFloat(m.c)), 0);
  const realZonePowerkW = (realZonePowerW / 1000).toFixed(1);

  // --- Status Counting ---
  const criticalFaults = zoneModules.filter(m => m.status === 'fault').length;
  const warningFaults = zoneModules.filter(m => m.status === 'warning').length;
  const isZone2Dusty = z.zone.id === 'Z-02'; 

  let status = "normal"; 
  if (isZone2Dusty || warningFaults > (z.moduleCount * 0.05)) status = "warning";
  if (criticalFaults > 0) status = "fault"; 

  return {
    id: z.zone.id,
    name: z.zone.name,
    power: realZonePowerkW,
    capacity: z.zone.capacity,
    moduleCount: z.moduleCount,
    status: status,
    x: z.zone.id === 'Z-01' ? 20 : z.zone.id === 'Z-02' ? 70 : z.zone.id === 'Z-03' ? 30 : 65,
    y: z.zone.id === 'Z-01' ? 30 : z.zone.id === 'Z-02' ? 25 : z.zone.id === 'Z-03' ? 70 : 65,
  };
});

// --- STATION STATUS (Dynamic Total) ---
const totalPower = MOCK_FIELD.reduce((acc, z) => acc + parseFloat(z.power), 0);

export const MOCK_STATION_STATUS = {
  power: { value: totalPower.toFixed(1), unit: "kW", trend: "up" },
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
  { id: "CAM-01", name: "PV Field North West -- Z-01", status: "online", url: "/videos/2887461-hd_1920_1080_25fps.mp4" },
  { id: "CAM-02", name: "PV Field North East -- Z-02", status: "online", url: "/videos/13492018_1920_1080_60fps.mp4" },
  { id: "CAM-03", name: "PV Field South West -- Z-03", status: "online", url: "/videos/2249554-uhd_3840_2160_24fps.mp4" },
  { id: "CAM-04", name: "PV Field South East -- Z-04", status: "offline", url: "" }, 
];

export const MOCK_EDGE_NODES = [
  { id: "EDGE-01", name: "Gateway North", ip: "192.168.1.101", status: "online", cpu: 45, ram: 60, temp: 42, latency: "12ms" },
  { id: "EDGE-02", name: "Gateway South", ip: "192.168.1.102", status: "online", cpu: 78, ram: 85, temp: 55, latency: "15ms" },
  { id: "EDGE-03", name: "Substation Controller", ip: "192.168.1.200", status: "offline", cpu: 0, ram: 0, temp: 0, latency: "-" },
  { id: "EDGE-04", name: "Met Mast Logger", ip: "192.168.1.50", status: "online", cpu: 12, ram: 30, temp: 38, latency: "45ms" },
];