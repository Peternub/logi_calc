// Планировщик и управление фоновыми задачами
import { createServerSupabaseClient } from '@/lib/supabase';
import { BackgroundTask, TaskType, TaskStatus, TaskPriority, TaskData, TaskResult } from '@/types/background-tasks';
import { MarketplaceType } from '@/types/marketplace';

export class TaskScheduler {
  private static instance: TaskScheduler;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance(): TaskScheduler {
    if (!TaskScheduler.instance) {
      TaskScheduler.instance = new TaskScheduler();
    }
    return TaskScheduler.instance;
  }

  // Запуск планировщика
  async start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('Task scheduler started');

    // Запускаем обработку каждые 30 секунд
    this.intervalId = setInterval(() => {
      this.processPendingTasks();
    }, 30000);

    // Обработаем задачи сразу при запуске
    this.processPendingTasks();
  }

  // Остановка планировщика
  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('Task scheduler stopped');
  }

  // Создание новой задачи
  async createTask(params: {
    user_id: string;
    marketplace_account_id?: string;
    type: TaskType;
    priority?: TaskPriority;
    data?: TaskData;
    scheduled_at?: Date;
  }): Promise<string> {
    const supabase = await createServerSupabaseClient();

    const task = {
      user_id: params.user_id,
      marketplace_account_id: params.marketplace_account_id,
      type: params.type,
      status: 'pending' as TaskStatus,
      priority: params.priority || 'normal',
      progress: 0,
      data: params.data || {},
      retry_count: 0,
      max_retries: 3,
      scheduled_at: params.scheduled_at?.toISOString(),
    };

    const { data, error } = await supabase
      .from('background_tasks')
      .insert(task)
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }

    console.log(`Created task ${data.id} of type ${params.type}`);
    return data.id;
  }

  // Обработка ожидающих задач
  private async processPendingTasks() {
    try {
      const supabase = await createServerSupabaseClient();

      // Получаем задачи готовые к выполнению
      const { data: tasks, error } = await supabase
        .from('background_tasks')
        .select('*')
        .in('status', ['pending'])
        .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`)
        .order('priority', { ascending: false }) // urgent -> high -> normal -> low
        .order('created_at', { ascending: true })
        .limit(5); // Обрабатываем максимум 5 задач за раз

      if (error) {
        console.error('Error fetching pending tasks:', error);
        return;
      }

      if (!tasks || tasks.length === 0) {
        return;
      }

      console.log(`Processing ${tasks.length} pending tasks`);

      // Обрабатываем каждую задачу
      for (const task of tasks) {
        await this.executeTask(task);
      }

    } catch (error) {
      console.error('Error processing pending tasks:', error);
    }
  }

  // Выполнение конкретной задачи
  private async executeTask(task: BackgroundTask) {
    const supabase = await createServerSupabaseClient();

    try {
      // Обновляем статус на "running"
      await supabase
        .from('background_tasks')
        .update({
          status: 'running',
          started_at: new Date().toISOString(),
          progress: 0,
        })
        .eq('id', task.id);

      console.log(`Executing task ${task.id} of type ${task.type}`);

      let result: TaskResult;

      // Выполняем задачу в зависимости от типа
      switch (task.type) {
        case 'sync_products':
          result = await this.syncProducts(task);
          break;
        case 'sync_orders':
          result = await this.syncOrders(task);
          break;
        case 'sync_sales':
          result = await this.syncSales(task);
          break;
        case 'sync_analytics':
          result = await this.syncAnalytics(task);
          break;
        case 'update_prices':
          result = await this.updatePrices(task);
          break;
        case 'update_stocks':
          result = await this.updateStocks(task);
          break;
        case 'generate_report':
          result = await this.generateReport(task);
          break;
        case 'competitor_analysis':
          result = await this.analyzeCompetitors(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      // Обновляем статус на "completed"
      await supabase
        .from('background_tasks')
        .update({
          status: 'completed',
          progress: 100,
          result,
          completed_at: new Date().toISOString(),
        })
        .eq('id', task.id);

      console.log(`Task ${task.id} completed successfully`);

      // Создаем лог успешного выполнения
      await this.createSyncLog(task, 'completed', result);

    } catch (error: any) {
      console.error(`Task ${task.id} failed:`, error);

      const shouldRetry = task.retry_count < task.max_retries;
      const newStatus: TaskStatus = shouldRetry ? 'pending' : 'failed';
      const nextRunAt = shouldRetry ? new Date(Date.now() + Math.pow(2, task.retry_count) * 60000) : undefined; // Exponential backoff

      await supabase
        .from('background_tasks')
        .update({
          status: newStatus,
          error_message: error.message,
          retry_count: task.retry_count + 1,
          next_run_at: nextRunAt?.toISOString(),
          completed_at: newStatus === 'failed' ? new Date().toISOString() : undefined,
        })
        .eq('id', task.id);

      // Создаем лог неудачного выполнения
      await this.createSyncLog(task, 'failed', undefined, error.message);
    }
  }

  // Синхронизация товаров
  private async syncProducts(task: BackgroundTask): Promise<TaskResult> {
    // TODO: Реализовать логику синхронизации товаров
    await this.updateProgress(task.id, 50);
    
    // Заглушка для демонстрации
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      processed_items: 0,
      success_count: 0,
      error_count: 0,
      duration_ms: 2000,
    };
  }

  // Синхронизация заказов
  private async syncOrders(task: BackgroundTask): Promise<TaskResult> {
    // TODO: Реализовать логику синхронизации заказов
    await this.updateProgress(task.id, 50);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      processed_items: 0,
      success_count: 0,
      error_count: 0,
      duration_ms: 1500,
    };
  }

  // Синхронизация продаж
  private async syncSales(task: BackgroundTask): Promise<TaskResult> {
    // TODO: Реализовать логику синхронизации продаж
    await this.updateProgress(task.id, 50);
    
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    return {
      processed_items: 0,
      success_count: 0,
      error_count: 0,
      duration_ms: 1800,
    };
  }

  // Синхронизация аналитики
  private async syncAnalytics(task: BackgroundTask): Promise<TaskResult> {
    // TODO: Реализовать логику синхронизации аналитики
    await this.updateProgress(task.id, 50);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      processed_items: 0,
      success_count: 0,
      error_count: 0,
      duration_ms: 3000,
    };
  }

  // Обновление цен
  private async updatePrices(task: BackgroundTask): Promise<TaskResult> {
    // TODO: Реализовать логику обновления цен
    await this.updateProgress(task.id, 50);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      processed_items: 0,
      success_count: 0,
      error_count: 0,
      duration_ms: 1000,
    };
  }

  // Обновление остатков
  private async updateStocks(task: BackgroundTask): Promise<TaskResult> {
    // TODO: Реализовать логику обновления остатков
    await this.updateProgress(task.id, 50);
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      processed_items: 0,
      success_count: 0,
      error_count: 0,
      duration_ms: 1200,
    };
  }

  // Генерация отчетов
  private async generateReport(task: BackgroundTask): Promise<TaskResult> {
    // TODO: Реализовать логику генерации отчетов
    await this.updateProgress(task.id, 50);
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return {
      processed_items: 1,
      success_count: 1,
      error_count: 0,
      duration_ms: 5000,
    };
  }

  // Анализ конкурентов
  private async analyzeCompetitors(task: BackgroundTask): Promise<TaskResult> {
    // TODO: Реализовать логику анализа конкурентов
    await this.updateProgress(task.id, 50);
    
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    return {
      processed_items: 0,
      success_count: 0,
      error_count: 0,
      duration_ms: 4000,
    };
  }

  // Обновление прогресса задачи
  private async updateProgress(taskId: string, progress: number) {
    const supabase = await createServerSupabaseClient();
    
    await supabase
      .from('background_tasks')
      .update({ progress })
      .eq('id', taskId);
  }

  // Создание лога синхронизации
  private async createSyncLog(
    task: BackgroundTask, 
    status: TaskStatus, 
    result?: TaskResult, 
    errorSummary?: string
  ) {
    const supabase = await createServerSupabaseClient();

    await supabase
      .from('sync_logs')
      .insert({
        marketplace_account_id: task.marketplace_account_id,
        task_id: task.id,
        type: task.type,
        status,
        items_processed: result?.processed_items || 0,
        items_success: result?.success_count || 0,
        items_failed: result?.error_count || 0,
        duration_ms: result?.duration_ms || 0,
        error_summary: errorSummary,
        started_at: task.started_at,
        completed_at: new Date().toISOString(),
      });
  }

  // Получение статуса задач пользователя
  async getUserTasksStatus(userId: string) {
    const supabase = await createServerSupabaseClient();

    const { data: tasks, error } = await supabase
      .from('background_tasks')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'running'])
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user tasks: ${error.message}`);
    }

    return tasks || [];
  }

  // Отмена задачи
  async cancelTask(taskId: string, userId: string) {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('background_tasks')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .in('status', ['pending', 'running']);

    if (error) {
      throw new Error(`Failed to cancel task: ${error.message}`);
    }

    console.log(`Task ${taskId} cancelled by user ${userId}`);
  }
}

// Утилиты для создания задач синхронизации
export class SyncUtils {
  
  static async scheduleProductSync(
    userId: string, 
    marketplaceAccountId: string, 
    options?: { force_update?: boolean }
  ) {
    const scheduler = TaskScheduler.getInstance();
    
    return await scheduler.createTask({
      user_id: userId,
      marketplace_account_id: marketplaceAccountId,
      type: 'sync_products',
      priority: 'normal',
      data: {
        sync_options: options,
      },
    });
  }

  static async scheduleOrderSync(
    userId: string, 
    marketplaceAccountId: string,
    dateRange?: { start_date: string; end_date: string }
  ) {
    const scheduler = TaskScheduler.getInstance();
    
    return await scheduler.createTask({
      user_id: userId,
      marketplace_account_id: marketplaceAccountId,
      type: 'sync_orders',
      priority: 'normal',
      data: {
        date_range: dateRange,
      },
    });
  }

  static async scheduleSalesSync(
    userId: string, 
    marketplaceAccountId: string,
    dateRange?: { start_date: string; end_date: string }
  ) {
    const scheduler = TaskScheduler.getInstance();
    
    return await scheduler.createTask({
      user_id: userId,
      marketplace_account_id: marketplaceAccountId,
      type: 'sync_sales',
      priority: 'normal',
      data: {
        date_range: dateRange,
      },
    });
  }

  static async scheduleFullSync(
    userId: string, 
    marketplaceAccountId: string
  ) {
    const scheduler = TaskScheduler.getInstance();
    
    // Создаем задачи синхронизации в правильном порядке
    const productTaskId = await scheduler.createTask({
      user_id: userId,
      marketplace_account_id: marketplaceAccountId,
      type: 'sync_products',
      priority: 'high',
    });

    const orderTaskId = await scheduler.createTask({
      user_id: userId,
      marketplace_account_id: marketplaceAccountId,
      type: 'sync_orders',
      priority: 'high',
      scheduled_at: new Date(Date.now() + 60000), // Через минуту после создания
    });

    const salesTaskId = await scheduler.createTask({
      user_id: userId,
      marketplace_account_id: marketplaceAccountId,
      type: 'sync_sales',
      priority: 'high',
      scheduled_at: new Date(Date.now() + 120000), // Через 2 минуты
    });

    const analyticsTaskId = await scheduler.createTask({
      user_id: userId,
      marketplace_account_id: marketplaceAccountId,
      type: 'sync_analytics',
      priority: 'normal',
      scheduled_at: new Date(Date.now() + 180000), // Через 3 минуты
    });

    return {
      product_task_id: productTaskId,
      order_task_id: orderTaskId,
      sales_task_id: salesTaskId,
      analytics_task_id: analyticsTaskId,
    };
  }

  static async scheduleReportGeneration(
    userId: string,
    reportType: string,
    parameters: any
  ) {
    const scheduler = TaskScheduler.getInstance();
    
    return await scheduler.createTask({
      user_id: userId,
      type: 'generate_report',
      priority: 'low',
      data: {
        report_type: reportType,
        parameters,
      },
    });
  }
}