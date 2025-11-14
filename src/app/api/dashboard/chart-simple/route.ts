import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[CHART API SIMPLE] Starting simple chart data request')
    
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'
    
    console.log('[CHART API SIMPLE] Period:', period)
    
    const periodMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    }

    const days = periodMap[period as keyof typeof periodMap] || 7
    
    // Generate simple mock data
    const data = []
    const baseRevenue = 50000
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      const dateKey = date.toISOString().split('T')[0]
      
      const dailyVariation = (Math.random() - 0.5) * 0.4
      const sales = baseRevenue + (baseRevenue * dailyVariation)
      const orders = Math.floor(sales / 1200) + Math.floor(Math.random() * 10)
      const profit = sales * (0.15 + Math.random() * 0.1)
      
      data.push({
        date: dateKey,
        formattedDate: date.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit'
        }),
        sales: Math.round(sales),
        orders: orders,
        profit: Math.round(profit),
        formattedSales: new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0
        }).format(sales),
        formattedProfit: new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0
        }).format(profit)
      })
    }

    const response = {
      period,
      data: data,
      summary: {
        totalSales: data.reduce((sum, day) => sum + day.sales, 0),
        totalOrders: data.reduce((sum, day) => sum + day.orders, 0),
        totalProfit: data.reduce((sum, day) => sum + day.profit, 0),
        averageDailySales: data.reduce((sum, day) => sum + day.sales, 0) / days,
        averageDailyOrders: data.reduce((sum, day) => sum + day.orders, 0) / days
      }
    }
    
    console.log('[CHART API SIMPLE] Sending response with', data.length, 'data points')
    return NextResponse.json(response)

  } catch (error) {
    console.error('[CHART API SIMPLE] Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}