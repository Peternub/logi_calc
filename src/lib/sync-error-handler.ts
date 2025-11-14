// Система обработки ошибок и уведомлений для синхронизации
import { createServerSupabaseClient } from '@/lib/supabase';
import { NotificationType, NotificationChannel } from '@/types/background-tasks';

export class SyncErrorHandler {
  private static instance: SyncErrorHandler;

  static getInstance(): SyncErrorHandler {
    if (!SyncErrorHandler.instance) {
      SyncErrorHandler.instance = new SyncErrorHandler();
    }
    return SyncErrorHandler.instance;
  }

  // Обработка ошибок синхронизации
  async handleSyncError(params: {
    userId: string;
    marketplaceAccountId?: string;
    taskId: string;
    error: Error;
    context?: any;
  }) {
    try {
      const supabase = await createServerSupabaseClient();

      // Логируем ошибку
      console.error(`Sync error for user ${params.userId}, task ${params.taskId}:`, params.error);

      // Создаем уведомление об ошибке
      await this.createNotification({
        userId: params.userId,
        type: 'sync_failed',
        title: 'Ошибка синхронизации',
        message: this.formatErrorMessage(params.error),
        data: {
          task_id: params.taskId,
          marketplace_account_id: params.marketplaceAccountId,
          error_details: params.error.message,
          context: params.context,
        },
      });

      // Анализируем тип ошибки и принимаем соответствующие меры
      await this.analyzeAndHandleError(params);

    } catch (error) {
      console.error('Error in SyncErrorHandler:', error);
    }
  }

  // Уведомление об успешной синхронизации
  async handleSyncSuccess(params: {
    userId: string;
    marketplaceAccountId?: string;
    taskId: string;
    result: any;
  }) {
    try {
      // Создаем уведомление об успехе только для важных синхронизаций
      if (params.result.processed_items > 0) {
        await this.createNotification({
          userId: params.userId,
          type: 'sync_completed',
          title: 'Синхронизация завершена',
          message: this.formatSuccessMessage(params.result),
          data: {
            task_id: params.taskId,
            marketplace_account_id: params.marketplaceAccountId,
            result: params.result,
          },
        });
      }

    } catch (error) {
      console.error('Error in handleSyncSuccess:', error);
    }
  }

  // Создание уведомления
  private async createNotification(params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    channels?: NotificationChannel[];
  }) {
    const supabase = await createServerSupabaseClient();

    // Получаем настройки уведомлений пользователя
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', params.userId)
      .eq('type', params.type)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Error fetching notification settings:', settingsError);
      return;
    }

    // Если уведомления этого типа отключены, не отправляем
    if (settings && !settings.enabled) {
      return;
    }

    const channels = params.channels || settings?.channels || ['in_app'];

    // Создаем уведомления для каждого канала
    for (const channel of channels) {
      await supabase
        .from('notifications')
        .insert({
          user_id: params.userId,
          type: params.type,
          channel,
          title: params.title,
          message: params.message,
          data: params.data,
        });
    }
  }

  // Анализ и обработка ошибок
  private async analyzeAndHandleError(params: {
    userId: string;
    marketplaceAccountId?: string;
    taskId: string;
    error: Error;
  }) {
    const errorMessage = params.error.message.toLowerCase();

    // API rate limiting
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
      await this.handleRateLimitError(params);
    }
    // Проблемы с аутентификацией
    else if (errorMessage.includes('unauthorized') || errorMessage.includes('invalid token')) {
      await this.handleAuthError(params);
    }
    // Проблемы с сетью
    else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      await this.handleNetworkError(params);
    }
    // Проблемы с данными
    else if (errorMessage.includes('validation') || errorMessage.includes('invalid data')) {
      await this.handleDataError(params);
    }
  }

  // Обработка ошибок rate limiting
  private async handleRateLimitError(params: {
    userId: string;
    marketplaceAccountId?: string;
    taskId: string;
    error: Error;
  }) {
    console.log(`Rate limit error for task ${params.taskId}, will retry with delay`);

    // Можно добавить логику для увеличения интервала между запросами
    // или временного отключения синхронизации для этого аккаунта
  }

  // Обработка ошибок аутентификации
  private async handleAuthError(params: {
    userId: string;
    marketplaceAccountId?: string;
    taskId: string;
    error: Error;
  }) {
    console.log(`Authentication error for task ${params.taskId}`);

    if (params.marketplaceAccountId) {
      const supabase = await createServerSupabaseClient();

      // Деактивируем аккаунт маркетплейса
      await supabase
        .from('marketplace_accounts')
        .update({ is_active: false })
        .eq('id', params.marketplaceAccountId);

      // Создаем специальное уведомление о проблемах с API ключами
      await this.createNotification({
        userId: params.userId,
        type: 'system_error',
        title: 'Проблема с API ключами',
        message: 'Проверьте правильность API ключей для вашего аккаунта маркетплейса',
        data: {
          marketplace_account_id: params.marketplaceAccountId,
          error_type: 'authentication',
        },
        channels: ['in_app', 'email'],
      });
    }
  }

  // Обработка сетевых ошибок
  private async handleNetworkError(params: {
    userId: string;
    marketplaceAccountId?: string;
    taskId: string;
    error: Error;
  }) {
    console.log(`Network error for task ${params.taskId}, will retry`);

    // Сетевые ошибки обычно временные, поэтому просто логируем
    // Система retry автоматически попробует еще раз
  }

  // Обработка ошибок данных
  private async handleDataError(params: {
    userId: string;
    marketplaceAccountId?: string;
    taskId: string;
    error: Error;
  }) {
    console.log(`Data validation error for task ${params.taskId}`);

    // Создаем уведомление о проблемах с данными
    await this.createNotification({
      userId: params.userId,
      type: 'system_error',
      title: 'Ошибка валидации данных',
      message: 'Обнаружены некорректные данные при синхронизации',
      data: {
        task_id: params.taskId,
        marketplace_account_id: params.marketplaceAccountId,
        error_type: 'data_validation',
        error_details: params.error.message,
      },
    });
  }

  // Форматирование сообщений об ошибках
  private formatErrorMessage(error: Error): string {
    const message = error.message;

    if (message.includes('rate limit')) {
      return 'Превышен лимит запросов к API. Синхронизация будет повторена позже.';
    }
    if (message.includes('unauthorized')) {
      return 'Ошибка авторизации. Проверьте правильность API ключей.';
    }
    if (message.includes('network') || message.includes('timeout')) {
      return 'Проблемы с сетевым соединением. Синхронизация будет повторена.';
    }
    if (message.includes('validation')) {
      return 'Ошибка валидации данных. Проверьте корректность информации.';
    }

    return `Ошибка синхронизации: ${message}`;
  }

  // Форматирование сообщений об успехе
  private formatSuccessMessage(result: any): string {
    const processed = result.processed_items || 0;
    const success = result.success_count || 0;
    const failed = result.error_count || 0;

    if (failed === 0) {
      return `Успешно обработано ${success} элементов`;
    } else {
      return `Обработано ${processed} элементов: ${success} успешно, ${failed} с ошибками`;
    }
  }
}

// Система мониторинга здоровья API
export class APIHealthMonitor {
  private static instance: APIHealthMonitor;

  static getInstance(): APIHealthMonitor {
    if (!APIHealthMonitor.instance) {
      APIHealthMonitor.instance = new APIHealthMonitor();
    }
    return APIHealthMonitor.instance;
  }

  // Проверка здоровья API маркетплейсов
  async checkAPIHealth() {
    const marketplaces = ['ozon', 'wildberries', 'yandex_market'];

    for (const marketplace of marketplaces) {
      await this.checkMarketplaceAPI(marketplace as any);
    }
  }

  // Проверка конкретного API маркетплейса
  private async checkMarketplaceAPI(marketplace: 'ozon' | 'wildberries' | 'yandex_market') {
    try {
      const startTime = Date.now();
      
      // Здесь будет логика проверки API маркетплейса
      // Пока заглушка
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const responseTime = Date.now() - startTime;
      
      await this.recordAPIHealth({
        marketplace,
        endpoint: 'health_check',
        status: 'up',
        response_time_ms: responseTime,
        error_rate: 0,
      });

    } catch (error: any) {
      await this.recordAPIHealth({
        marketplace,
        endpoint: 'health_check',
        status: 'down',
        response_time_ms: 0,
        error_rate: 100,
      });

      console.error(`API health check failed for ${marketplace}:`, error);
    }
  }

  // Запись результатов проверки здоровья
  private async recordAPIHealth(params: {
    marketplace: string;
    endpoint: string;
    status: 'up' | 'down' | 'degraded';
    response_time_ms: number;
    error_rate: number;
  }) {
    // Здесь можно записать результаты в базу данных или отправить в систему мониторинга
    console.log(`API Health: ${params.marketplace} - ${params.status} (${params.response_time_ms}ms)`);
  }
}

// Утилиты для работы с уведомлениями
export class NotificationUtils {
  
  static async createLowStockAlert(params: {
    userId: string;
    productId: string;
    productName: string;
    currentStock: number;
    minStockLevel: number;
  }) {
    const errorHandler = SyncErrorHandler.getInstance();

    await errorHandler['createNotification']({
      userId: params.userId,
      type: 'low_stock',
      title: 'Низкий остаток товара',
      message: `У товара "${params.productName}" остаток ${params.currentStock} шт. (минимум: ${params.minStockLevel})`,
      data: {
        product_id: params.productId,
        current_stock: params.currentStock,
        min_stock_level: params.minStockLevel,
      },
      channels: ['in_app', 'email'],
    });
  }

  static async createPriceChangeAlert(params: {
    userId: string;
    productId: string;
    productName: string;
    oldPrice: number;
    newPrice: number;
    changePercent: number;
  }) {
    const errorHandler = SyncErrorHandler.getInstance();

    await errorHandler['createNotification']({
      userId: params.userId,
      type: 'price_changed',
      title: 'Изменение цены товара',
      message: `Цена товара "${params.productName}" изменилась с ${params.oldPrice} на ${params.newPrice} (${params.changePercent > 0 ? '+' : ''}${params.changePercent.toFixed(1)}%)`,
      data: {
        product_id: params.productId,
        old_price: params.oldPrice,
        new_price: params.newPrice,
        change_percent: params.changePercent,
      },
    });
  }

  static async createNewOrderAlert(params: {
    userId: string;
    orderId: string;
    orderAmount: number;
    marketplaceName: string;
  }) {
    const errorHandler = SyncErrorHandler.getInstance();

    await errorHandler['createNotification']({
      userId: params.userId,
      type: 'new_order',
      title: 'Новый заказ',
      message: `Получен новый заказ на сумму ${params.orderAmount} руб. с ${params.marketplaceName}`,
      data: {
        order_id: params.orderId,
        order_amount: params.orderAmount,
        marketplace: params.marketplaceName,
      },
      channels: ['in_app', 'push'],
    });
  }
}