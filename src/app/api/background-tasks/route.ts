// API для управления фоновыми задачами
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { handleAPIError, validateAuth } from '@/lib/api-utils';
import { TaskScheduler, SyncUtils } from '@/lib/task-scheduler';
import { z } from 'zod';

const taskCreateSchema = z.object({
  type: z.enum(['sync_products', 'sync_orders', 'sync_sales', 'sync_analytics', 'update_prices', 'update_stocks', 'generate_report', 'competitor_analysis']),
  marketplace_account_id: z.string().uuid().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  data: z.any().optional(),
  scheduled_at: z.string().datetime().optional(),
});

const taskQuerySchema = z.object({
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']).optional(),
  type: z.enum(['sync_products', 'sync_orders', 'sync_sales', 'sync_analytics', 'update_prices', 'update_stocks', 'generate_report', 'competitor_analysis']).optional(),
  marketplace_account_id: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const syncRequestSchema = z.object({
  marketplace_account_id: z.string().uuid(),
  sync_type: z.enum(['products', 'orders', 'sales', 'full']),
  date_range: z.object({
    start_date: z.string().datetime(),
    end_date: z.string().datetime(),
  }).optional(),
  options: z.object({
    force_update: z.boolean().optional(),
  }).optional(),
});

// GET /api/background-tasks - получение списка задач пользователя
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    validateAuth(user);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = taskQuerySchema.parse({
      status: searchParams.get('status'),
      type: searchParams.get('type'),
      marketplace_account_id: searchParams.get('marketplace_account_id'),
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    });

    let queryBuilder = supabase
      .from('background_tasks')
      .select(`
        *,
        marketplace_accounts(id, name, marketplace)
      `)
      .eq('user_id', user.id);

    // Применяем фильтры
    if (query.status) {
      queryBuilder = queryBuilder.eq('status', query.status);
    }

    if (query.type) {
      queryBuilder = queryBuilder.eq('type', query.type);
    }

    if (query.marketplace_account_id) {
      queryBuilder = queryBuilder.eq('marketplace_account_id', query.marketplace_account_id);
    }

    // Сортировка и пагинация
    queryBuilder = queryBuilder
      .order('created_at', { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    const { data: tasks, error } = await queryBuilder;

    if (error) {
      console.error('Error fetching background tasks:', error);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    // Получаем общее количество
    let countQuery = supabase
      .from('background_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (query.status) {
      countQuery = countQuery.eq('status', query.status);
    }
    if (query.type) {
      countQuery = countQuery.eq('type', query.type);
    }
    if (query.marketplace_account_id) {
      countQuery = countQuery.eq('marketplace_account_id', query.marketplace_account_id);
    }

    const { count: totalCount } = await countQuery;

    return NextResponse.json({
      tasks,
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

// POST /api/background-tasks - создание новой задачи
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    validateAuth(user);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Проверяем, запрашивается ли быстрая синхронизация
    if (body.action === 'sync') {
      return await handleSyncRequest(body, user.id);
    }

    const taskData = taskCreateSchema.parse(body);

    // Проверяем, что аккаунт маркетплейса принадлежит пользователю (если указан)
    if (taskData.marketplace_account_id) {
      const { data: account, error: accountError } = await supabase
        .from('marketplace_accounts')
        .select('id')
        .eq('id', taskData.marketplace_account_id)
        .eq('user_id', user.id)
        .single();

      if (accountError || !account) {
        return NextResponse.json({ error: 'Marketplace account not found' }, { status: 404 });
      }
    }

    const scheduler = TaskScheduler.getInstance();
    
    const taskId = await scheduler.createTask({
      user_id: user.id,
      marketplace_account_id: taskData.marketplace_account_id,
      type: taskData.type,
      priority: taskData.priority,
      data: taskData.data,
      scheduled_at: taskData.scheduled_at ? new Date(taskData.scheduled_at) : undefined,
    });

    return NextResponse.json({ 
      message: 'Task created successfully',
      task_id: taskId,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return handleAPIError(error);
  }
}

// Обработка запросов на синхронизацию
async function handleSyncRequest(body: any, userId: string) {
  try {
    const syncData = syncRequestSchema.parse(body);

    let taskIds: any;

    switch (syncData.sync_type) {
      case 'products':
        const productTaskId = await SyncUtils.scheduleProductSync(
          userId,
          syncData.marketplace_account_id,
          syncData.options
        );
        taskIds = { product_task_id: productTaskId };
        break;

      case 'orders':
        const orderTaskId = await SyncUtils.scheduleOrderSync(
          userId,
          syncData.marketplace_account_id,
          syncData.date_range
        );
        taskIds = { order_task_id: orderTaskId };
        break;

      case 'sales':
        const salesTaskId = await SyncUtils.scheduleSalesSync(
          userId,
          syncData.marketplace_account_id,
          syncData.date_range
        );
        taskIds = { sales_task_id: salesTaskId };
        break;

      case 'full':
        taskIds = await SyncUtils.scheduleFullSync(
          userId,
          syncData.marketplace_account_id
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid sync type' }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Sync tasks scheduled successfully',
      task_ids: taskIds,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid sync request', details: error.issues }, { status: 400 });
    }
    throw error;
  }
}