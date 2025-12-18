import { NextResponse } from 'next/server';
import { MOCK_STATION_STATUS, MOCK_ANALYSIS_DATA, MOCK_STATION_MAP } from '@/app/data/mock'; 

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay

  return NextResponse.json({
    success: true,
    data: {
      kpi: MOCK_STATION_STATUS,
      trend: MOCK_ANALYSIS_DATA,
      map: MOCK_STATION_MAP
    },
    timestamp: new Date().toISOString(),
  });
}