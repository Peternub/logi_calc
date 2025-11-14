import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/automation/safety
 * Получение настроек безопасных ограничений для автоматизации
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Реализовать получение настроек безопасных ограничений
    return NextResponse.json({
      maxPriceChangePercent: 30,
      minProfitMargin: 10,
      maxDailyActions: 100,
      priceFreezePeriod: 24,
      excludedProducts: []
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch safety limits' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/automation/safety
 * Обновление настроек безопасных ограничений
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Реализовать обновление настроек безопасных ограничений
    return NextResponse.json(
      { message: 'Safety limits updated successfully' }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update safety limits' },
      { status: 500 }
    );
  }
}