// API для просмотра логов синхронизации
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { handleAPIError, validateAuth } from '@/lib/api-utils';
import { z } from 'zod';

const logsQuerySchema = z.object({
  marketplace_account_id: z.string().uuid().optional(),
  type: z.enum(['sync_products', 'sync_orders', 'sync_sales', 'sync_analytics', 'update_prices', 'update_stocks', 'generate_report', 'competitor_analysis']).optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// GET /api/sync-logs - получение логов синхронизации
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    validateAuth(user);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = logsQuerySchema.parse({
      marketplace_account_id: searchParams.get('marketplace_account_id'),
      type: searchParams.get('type'),
      status: searchParams.get('status'),
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    });

    // Получаем статистику, если запрашивается
    if (searchParams.get('stats') === 'true') {
      return await getSyncStats(query, user.id);
    }

    let queryBuilder = supabase
      .from('sync_logs')
      .select(`
        *,
        marketplace_accounts!inner(id, name, marketplace, user_id),
        background_tasks(id, priority, data)
      `)
      .eq('marketplace_accounts.user_id', user.id);

    // Применяем фильтры
    if (query.marketplace_account_id) {
      queryBuilder = queryBuilder.eq('marketplace_account_id', query.marketplace_account_id);
    }

    if (query.type) {
      queryBuilder = queryBuilder.eq('type', query.type);
    }

    if (query.status) {
      queryBuilder = queryBuilder.eq('status', query.status);
    }

    if (query.start_date) {
      queryBuilder = queryBuilder.gte('started_at', query.start_date);
    }

    if (query.end_date) {
      queryBuilder = queryBuilder.lte('completed_at', query.end_date);
    }

    // Сортировка и пагинация
    queryBuilder = queryBuilder
      .order('started_at', { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    const { data: logs, error } = await queryBuilder;

    if (error) {
      console.error('Error fetching sync logs:', error);
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    // Получаем общее количество
    let countQuery = supabase
      .from('sync_logs')
      .select('*', { count: 'exact', head: true })
      .eq('marketplace_accounts.user_id', user.id);

    // Применяем те же фильтры для подсчета
    if (query.marketplace_account_id) {
      countQuery = countQuery.eq('marketplace_account_id', query.marketplace_account_id);
    }
    if (query.type) {
      countQuery = countQuery.eq('type', query.type);
    }
    if (query.status) {
      countQuery = countQuery.eq('status', query.status);
    }
    if (query.start_date) {
      countQuery = countQuery.gte('started_at', query.start_date);
    }
    if (query.end_date) {
      countQuery = countQuery.lte('completed_at', query.end_date);
    }

    const { count: totalCount } = await countQuery;

    return NextResponse.json({
      logs,
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

// Получение статистики синхронизации
async function getSyncStats(query: any, userId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    // Базовый запрос для статистики
    let statsQuery = supabase
      .from('sync_logs')
      .select(`
        type,
        status,
        items_processed,
        items_success,
        items_failed,
        duration_ms,
        started_at,
        marketplace_accounts!inner(user_id)
      `)
      .eq('marketplace_accounts.user_id', userId);

    // Применяем фильтры
    if (query.marketplace_account_id) {
      statsQuery = statsQuery.eq('marketplace_account_id', query.marketplace_account_id);
    }
    if (query.type) {
      statsQuery = statsQuery.eq('type', query.type);
    }
    if (query.start_date) {
      statsQuery = statsQuery.gte('started_at', query.start_date);
    }
    if (query.end_date) {
      statsQuery = statsQuery.lte('completed_at', query.end_date);
    }

    const { data: statsData, error } = await statsQuery;

    if (error) {
      console.error('Error fetching sync stats:', error);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    // Вычисляем статистику
    const stats = calculateSyncStats(statsData || []);

    return NextResponse.json({ stats });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.issues }, { status: 400 });
    }
    throw error;
  }
}

// Вспомогательная функция для вычисления статистики
function calculateSyncStats(logs: any[]) {
  const totalLogs = logs.length;
  
  if (totalLogs === 0) {
    return {
      total_syncs: 0,
      successful_syncs: 0,
      failed_syncs: 0,
      success_rate: 0,
      total_items_processed: 0,
      total_items_success: 0,
      total_items_failed: 0,
      average_duration_ms: 0,
      by_type: {},
      by_status: {},
      recent_activity: [],
    };
  }

  const successfulSyncs = logs.filter(log => log.status === 'completed').length;
  const failedSyncs = logs.filter(log => log.status === 'failed').length;
  
  const totalItemsProcessed = logs.reduce((sum, log) => sum + (log.items_processed || 0), 0);
  const totalItemsSuccess = logs.reduce((sum, log) => sum + (log.items_success || 0), 0);
  const totalItemsFailed = logs.reduce((sum, log) => sum + (log.items_failed || 0), 0);
  
  const totalDuration = logs.reduce((sum, log) => sum + (log.duration_ms || 0), 0);
  const averageDuration = totalLogs > 0 ? totalDuration / totalLogs : 0;

  // Группировка по типам
  const byType = logs.reduce((acc, log) => {
    acc[log.type] = acc[log.type] || { count: 0, success: 0, failed: 0 };
    acc[log.type].count++;
    if (log.status === 'completed') acc[log.type].success++;
    if (log.status === 'failed') acc[log.type].failed++;
    return acc;
  }, {});

  // Группировка по статусам
  const byStatus = logs.reduce((acc, log) => {
    acc[log.status] = (acc[log.status] || 0) + 1;
    return acc;
  }, {});

  // Последняя активность (последние 10 записей)
  const recentActivity = logs
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
    .slice(0, 10)
    .map(log => ({
      type: log.type,
      status: log.status,
      items_processed: log.items_processed,
      duration_ms: log.duration_ms,
      started_at: log.started_at,
    }));

  return {
    total_syncs: totalLogs,
    successful_syncs: successfulSyncs,
    failed_syncs: failedSyncs,
    success_rate: totalLogs > 0 ? (successfulSyncs / totalLogs) * 100 : 0,
    total_items_processed: totalItemsProcessed,
    total_items_success: totalItemsSuccess,
    total_items_failed: totalItemsFailed,
    average_duration_ms: averageDuration,
    by_type: byType,
    by_status: byStatus,
    recent_activity: recentActivity,
  };
}