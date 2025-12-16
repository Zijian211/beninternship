import { NextResponse } from 'next/server';
import { MOCK_STATION_STATUS, MOCK_ANALYSIS_DATA } from '@/app/data/mock'; 

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json({
    success: true,
    data: {
      kpi: MOCK_STATION_STATUS,
      trend: MOCK_ANALYSIS_DATA
    },
    timestamp: new Date().toISOString(),
  });
}