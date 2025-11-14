import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('[STATS API] Начало запроса статистики')
    const supabase = await createServerSupabaseClient()
    
    // Получаем пользователя из сессии
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('[STATS API] Ошибка пользователя:', userError)
      return NextResponse.json({ error: 'Ошибка аутентификации: ' + userError.message }, { status: 401 })
    }
    
    if (!user) {
      console.log('[STATS API] Пользователь не найден')
      return NextResponse.json({ error: 'Пользователь не аутентифицирован' }, { status: 401 })
    }
    
    console.log('[STATS API] Пользователь аутентифицирован:', user.id)

    // Временно используем mock данные, пока не созданы таблицы sales и marketplace_accounts
    // TODO: Заменить на реальные данные из БД когда таблицы будут созданы
    
    // Проверяем наличие товаров в реальной БД
    const { count: productsCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active')

    // Если есть ошибка, используем mock данные
    const realProductsCount = productsError ? 0 : (productsCount || 0)

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
        value: realProductsCount,
        formatted: new Intl.NumberFormat('ru-RU').format(realProductsCount)
      },
      accountsCount: {
        value: 2, // Mock: 2 подключенных маркетплейса
        formatted: '2'
      }
    }
    
    console.log('[STATS API] Отправка статистики:', stats)
    return NextResponse.json(stats)

  } catch (error) {
    console.error('[STATS API] Ошибка:', error)
    return NextResponse.json(
      { 
        error: 'Внутренняя ошибка сервера', 
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}