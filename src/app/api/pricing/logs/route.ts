import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/pricing/logs
 * Получение логов изменений цен
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Реализовать получение логов изменений цен
    return NextResponse.json({ priceLogs: [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch price logs' },
      { status: 500 }
    );
  }
}