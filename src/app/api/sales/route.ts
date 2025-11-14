// API для работы с продажами
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { handleAPIError, validateAuth } from '@/lib/api-utils';
import { z } from 'zod';

const salesQuerySchema = z.object({
  marketplace_account_id: z.string().uuid().optional(),
  marketplace: z.enum(['ozon', 'wildberries', 'yandex_market']).optional(),
  product_id: z.string().uuid().optional(),
  status: z.enum(['new', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned']).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  sort: z.enum(['order_date', 'total_price', 'profit', 'created_at']).default('order_date'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

const salesAnalyticsSchema = z.object({
  marketplace_account_id: z.string().uuid().optional(),
  marketplace: z.enum(['ozon', 'wildberries', 'yandex_market']).optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  group_by: z.enum(['day', 'week', 'month']).default('day'),
});

// GET /api/sales - получение продаж
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    validateAuth(user);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Проверяем, запрашивается ли аналитика
    if (searchParams.get('analytics') === 'true') {
      return await getAnalytics(request, user);
    }

    const query = salesQuerySchema.parse({
      marketplace_account_id: searchParams.get('marketplace_account_id'),
      marketplace: searchParams.get('marketplace'),
      product_id: searchParams.get('product_id'),
      status: searchParams.get('status'),
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sort: searchParams.get('sort') || 'order_date',
      order: searchParams.get('order') || 'desc',
    });

    // Базовый запрос
    let queryBuilder = supabase
      .from('sales')
      .select(`
        *,
        products(id, name, sku, images, category_name),
        marketplace_accounts!inner(id, name, marketplace, user_id)
      `)
      .eq('marketplace_accounts.user_id', user.id);

    // Применяем фильтры
    if (query.marketplace_account_id) {
      queryBuilder = queryBuilder.eq('marketplace_account_id', query.marketplace_account_id);
    }

    if (query.marketplace) {
      queryBuilder = queryBuilder.eq('marketplace', query.marketplace);
    }

    if (query.product_id) {
      queryBuilder = queryBuilder.eq('product_id', query.product_id);
    }

    if (query.status) {
      queryBuilder = queryBuilder.eq('status', query.status);
    }

    if (query.start_date) {
      queryBuilder = queryBuilder.gte('order_date', query.start_date);
    }

    if (query.end_date) {
      queryBuilder = queryBuilder.lte('order_date', query.end_date);
    }

    // Сортировка и пагинация
    queryBuilder = queryBuilder
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(query.offset, query.offset + query.limit - 1);

    const { data: sales, error } = await queryBuilder;

    if (error) {
      console.error('Error fetching sales:', error);
      return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
    }

    // Получаем общее количество
    let countQuery = supabase
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('marketplace_accounts.user_id', user.id);

    // Применяем те же фильтры для подсчета
    if (query.marketplace_account_id) {
      countQuery = countQuery.eq('marketplace_account_id', query.marketplace_account_id);
    }
    if (query.marketplace) {
      countQuery = countQuery.eq('marketplace', query.marketplace);
    }
    if (query.product_id) {
      countQuery = countQuery.eq('product_id', query.product_id);
    }
    if (query.status) {
      countQuery = countQuery.eq('status', query.status);
    }
    if (query.start_date) {
      countQuery = countQuery.gte('order_date', query.start_date);
    }
    if (query.end_date) {
      countQuery = countQuery.lte('order_date', query.end_date);
    }

    const { count: totalCount } = await countQuery;

    return NextResponse.json({
      sales,
      pagination: {
        total: totalCount || 0,
        limit: query.limit,
        offset: query.offset,
        has_more: (query.offset + query.limit) < (totalCount || 0),
      },
    });

  } catch (error) {
    return handleAPIError(error);
  }
}

// Функция для получения аналитики продаж
async function getAnalytics(request: NextRequest, user: any) {
  try {
    const { searchParams } = new URL(request.url);
    const query = salesAnalyticsSchema.parse({
      marketplace_account_id: searchParams.get('marketplace_account_id'),
      marketplace: searchParams.get('marketplace'),
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
      group_by: searchParams.get('group_by') || 'day',
    });

    const supabase = await createServerSupabaseClient();

    // Определяем формат группировки даты
    let dateFormat: string;
    switch (query.group_by) {
      case 'week':
        dateFormat = 'YYYY-"W"WW';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
    }

    // Базовый запрос для аналитики
    let analyticsQuery = supabase
      .from('sales')
      .select(`
        order_date,
        total_price,
        commission,
        profit,
        quantity,
        marketplace_accounts!inner(user_id)
      `)
      .eq('marketplace_accounts.user_id', user.id)
      .gte('order_date', query.start_date)
      .lte('order_date', query.end_date);

    if (query.marketplace_account_id) {
      analyticsQuery = analyticsQuery.eq('marketplace_account_id', query.marketplace_account_id);
    }

    if (query.marketplace) {
      analyticsQuery = analyticsQuery.eq('marketplace', query.marketplace);
    }

    const { data: salesData, error } = await analyticsQuery;

    if (error) {
      console.error('Error fetching sales analytics:', error);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    // Группируем данные по периодам
    const analytics = groupSalesByPeriod(salesData || [], query.group_by);

    // Подсчитываем общие метрики
    const totalRevenue = salesData?.reduce((sum, sale) => sum + Number(sale.total_price), 0) || 0;
    const totalCommission = salesData?.reduce((sum, sale) => sum + Number(sale.commission), 0) || 0;
    const totalProfit = salesData?.reduce((sum, sale) => sum + Number(sale.profit), 0) || 0;
    const totalOrders = salesData?.length || 0;
    const totalItems = salesData?.reduce((sum, sale) => sum + Number(sale.quantity), 0) || 0;

    return NextResponse.json({
      analytics,
      summary: {
        total_revenue: totalRevenue,
        total_commission: totalCommission,
        total_profit: totalProfit,
        total_orders: totalOrders,
        total_items: totalItems,
        average_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        profit_margin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.issues }, { status: 400 });
    }
    return handleAPIError(error);
  }
}

// Вспомогательная функция для группировки продаж по периодам
function groupSalesByPeriod(sales: any[], groupBy: 'day' | 'week' | 'month') {
  const grouped: { [key: string]: any } = {};

  sales.forEach(sale => {
    const date = new Date(sale.order_date);
    let key: string;

    switch (groupBy) {
      case 'week':
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        revenue: 0,
        commission: 0,
        profit: 0,
        orders: 0,
        items: 0,
      };
    }

    grouped[key].revenue += Number(sale.total_price);
    grouped[key].commission += Number(sale.commission);
    grouped[key].profit += Number(sale.profit);
    grouped[key].orders += 1;
    grouped[key].items += Number(sale.quantity);
  });

  // Преобразуем в массив и сортируем по дате
  return Object.values(grouped).sort((a: any, b: any) => 
    new Date(a.period).getTime() - new Date(b.period).getTime()
  );
}