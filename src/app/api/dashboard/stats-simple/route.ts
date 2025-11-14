import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('[STATS API SIMPLE] Запрос простой статистики')
    
    // Mock данные для демонстрации
    const totalSales = 750000 + Math.floor(Math.random() * 100000)
    const totalOrders = 425 + Math.floor(Math.random() * 50)
    const totalProfit = totalSales * (0.18 + Math.random() * 0.07) // 18-25% маржа
    
    // Предыдущий период для расчета роста
    const previousSales = totalSales * (0.85 + Math.random() * 0.2) // ±15% вариация
    const previousOrders = Math.floor(totalOrders * (0.85 + Math.random() * 0.2))
    
    // Вычисляем процентные изменения
    const salesGrowth = ((totalSales - previousSales) / previousSales) * 100
    const ordersGrowth = ((totalOrders - previousOrders) / previousOrders) * 100

    const stats = {
      totalSales: {
        value: totalSales,
        growth: salesGrowth,
        formatted: new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0
        }).format(totalSales)
      },
      totalOrders: {
        value: totalOrders,
        growth: ordersGrowth,
        formatted: new Intl.NumberFormat('ru-RU').format(totalOrders)
      },
      totalProfit: {
        value: totalProfit,
        formatted: new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0
        }).format(totalProfit)
      },
      productsCount: {
        value: 156, // Mock: количество товаров
        formatted: '156'
      },
      accountsCount: {
        value: 2, // Mock: 2 подключенных маркетплейса
        formatted: '2'
      }
    }
    
    console.log('[STATS API SIMPLE] Отправка статистики:', stats)
    return NextResponse.json(stats)

  } catch (error) {
    console.error('[STATS API SIMPLE] Ошибка:', error)
    return NextResponse.json(
      { 
        error: 'Ошибка генерации статистики', 
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}