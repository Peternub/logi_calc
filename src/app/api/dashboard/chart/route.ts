import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('[CHART API] Starting chart data request')
    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d
    
    console.log('[CHART API] Period:', period)
    
    // Получаем пользователя из сессии
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('[CHART API] User error:', userError)
      return NextResponse.json({ error: 'Authentication error: ' + userError.message }, { status: 401 })
    }
    
    if (!user) {
      console.log('[CHART API] No user found')
      return NextResponse.json({ error: 'No authenticated user' }, { status: 401 })
    }
    
    console.log('[CHART API] User authenticated:', user.id)

    // Определяем период для запроса
    const periodMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    }

    const days = periodMap[period as keyof typeof periodMap] || 7
    
    // Временно используем mock данные, пока не создана таблица sales
    // TODO: Заменить на реальные данные из БД когда таблица sales будет создана
    const generateMockData = (days: number) => {
      const data = []
      const baseRevenue = 50000
      
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (days - 1 - i))
        const dateKey = date.toISOString().split('T')[0]
        
        // Генерируем случайные, но реалистичные данные
        const dailyVariation = (Math.random() - 0.5) * 0.4 // ±20% вариация
        const sales = baseRevenue + (baseRevenue * dailyVariation)
        const orders = Math.floor(sales / 1200) + Math.floor(Math.random() * 10) // ~1200 руб за заказ
        const profit = sales * (0.15 + Math.random() * 0.1) // 15-25% маржа
        
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
      
      return data
    }

    const chartData = generateMockData(days)
    
    console.log('[CHART API] Generated chart data:', chartData.length, 'days')

    const response = {
      period,
      data: chartData,
      summary: {
        totalSales: chartData.reduce((sum, day) => sum + day.sales, 0),
        totalOrders: chartData.reduce((sum, day) => sum + day.orders, 0),
        totalProfit: chartData.reduce((sum, day) => sum + day.profit, 0),
        averageDailySales: chartData.reduce((sum, day) => sum + day.sales, 0) / days,
        averageDailyOrders: chartData.reduce((sum, day) => sum + day.orders, 0) / days
      }
    }
    
    console.log('[CHART API] Sending response with summary:', response.summary)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Chart data error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}