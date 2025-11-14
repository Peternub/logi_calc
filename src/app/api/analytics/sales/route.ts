// API для получения данных аналитики продаж
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { handleAPIError, validateAuth } from '@/lib/api-utils';
import { z } from 'zod';

const analyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d']).default('30d'),
  marketplace: z.enum(['ozon', 'wildberries', 'yandex_market', 'all']).default('all'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

// GET /api/analytics/sales - получение данных аналитики продаж
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    validateAuth(user);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = analyticsQuerySchema.parse({
      period: searchParams.get('period') || '30d',
      marketplace: searchParams.get('marketplace') || 'all',
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
    });

    // В демо режиме возвращаем mock данные
    const mockAnalyticsData = {
      metrics: {
        total_revenue: 1245000,
        total_orders: 456,
        total_products: 892,
        revenue_change: 12.5,
        orders_change: -3.2,
        average_order_value: 2730,
      },
      daily_sales: [
        { date: '2024-01-01', revenue: 125000, orders: 45, products_sold: 87, marketplace: 'wildberries' },
        { date: '2024-01-02', revenue: 89000, orders: 32, products_sold: 56, marketplace: 'ozon' },
        { date: '2024-01-03', revenue: 156000, orders: 58, products_sold: 102, marketplace: 'wildberries' },
        { date: '2024-01-04', revenue: 97000, orders: 35, products_sold: 67, marketplace: 'yandex_market' },
        { date: '2024-01-05', revenue: 134000, orders: 48, products_sold: 89, marketplace: 'wildberries' },
        { date: '2024-01-06', revenue: 78000, orders: 28, products_sold: 45, marketplace: 'ozon' },
        { date: '2024-01-07', revenue: 167000, orders: 62, products_sold: 115, marketplace: 'wildberries' },
        { date: '2024-01-08', revenue: 112000, orders: 41, products_sold: 78, marketplace: 'yandex_market' },
        { date: '2024-01-09', revenue: 145000, orders: 52, products_sold: 94, marketplace: 'wildberries' },
        { date: '2024-01-10', revenue: 92000, orders: 33, products_sold: 59, marketplace: 'ozon' },
        { date: '2024-01-11', revenue: 178000, orders: 65, products_sold: 125, marketplace: 'wildberries' },
        { date: '2024-01-12', revenue: 98000, orders: 36, products_sold: 68, marketplace: 'yandex_market' },
        { date: '2024-01-13', revenue: 156000, orders: 56, products_sold: 105, marketplace: 'wildberries' },
        { date: '2024-01-14', revenue: 87000, orders: 31, products_sold: 54, marketplace: 'ozon' },
        { date: '2024-01-15', revenue: 189000, orders: 68, products_sold: 134, marketplace: 'wildberries' }
      ],
      marketplace_breakdown: {
        wildberries: { revenue: 745000, orders: 267, percentage: 59.8 },
        ozon: { revenue: 312000, orders: 112, percentage: 25.1 },
        yandex_market: { revenue: 188000, orders: 77, percentage: 15.1 }
      },
      top_products: [
        { id: '1', name: 'Беспроводные наушники AirPods Pro', revenue: 124950, orders: 5, marketplace: 'wildberries' },
        { id: '2', name: 'Смартфон iPhone 15 Pro', revenue: 179980, orders: 2, marketplace: 'ozon' },
        { id: '3', name: 'Футболка хлопковая базовая', revenue: 15900, orders: 10, marketplace: 'yandex_market' }
      ]
    };

    // Применяем фильтры к демо данным
    let filteredSales = mockAnalyticsData.daily_sales;
    
    if (query.marketplace !== 'all') {
      filteredSales = filteredSales.filter(sale => sale.marketplace === query.marketplace);
    }

    // Фильтр по периоду
    const daysBack = query.period === '7d' ? 7 : query.period === '30d' ? 30 : 90;
    filteredSales = filteredSales.slice(-daysBack);

    // Пересчитываем метрики для отфильтрованных данных
    const filteredMetrics = {
      total_revenue: filteredSales.reduce((sum, sale) => sum + sale.revenue, 0),
      total_orders: filteredSales.reduce((sum, sale) => sum + sale.orders, 0),
      total_products: filteredSales.reduce((sum, sale) => sum + sale.products_sold, 0),
      revenue_change: mockAnalyticsData.metrics.revenue_change,
      orders_change: mockAnalyticsData.metrics.orders_change,
      average_order_value: 0
    };
    
    filteredMetrics.average_order_value = filteredMetrics.total_orders > 0 
      ? filteredMetrics.total_revenue / filteredMetrics.total_orders 
      : 0;

    return NextResponse.json({
      period: query.period,
      marketplace: query.marketplace,
      metrics: filteredMetrics,
      daily_sales: filteredSales,
      marketplace_breakdown: mockAnalyticsData.marketplace_breakdown,
      top_products: mockAnalyticsData.top_products,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid query parameters', 
        details: error.issues 
      }, { status: 400 });
    }
    return handleAPIError(error);
  }
}