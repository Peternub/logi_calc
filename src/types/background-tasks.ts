// Модели для фоновых задач и синхронизации
import { MarketplaceType } from './marketplace';

export type TaskType = 
  | 'sync_products'
  | 'sync_orders'
  | 'sync_sales'
  | 'sync_analytics'
  | 'update_prices'
  | 'update_stocks'
  | 'generate_report'
  | 'competitor_analysis';

export type TaskStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface BackgroundTask {
  id: string;
  user_id: string;
  marketplace_account_id?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number; // 0-100
  data: TaskData;
  result?: TaskResult;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  scheduled_at?: Date;
  started_at?: Date;
  completed_at?: Date;
  next_run_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TaskData {
  [key: string]: any;
  marketplace?: MarketplaceType;
  product_ids?: string[];
  date_range?: {
    start_date: string;
    end_date: string;
  };
  sync_options?: SyncOptions;
}

export interface TaskResult {
  [key: string]: any;
  processed_items?: number;
  success_count?: number;
  error_count?: number;
  errors?: TaskError[];
  duration_ms?: number;
}

export interface TaskError {
  item_id?: string;
  error_code: string;
  error_message: string;
  timestamp: Date;
}

export interface SyncOptions {
  force_update?: boolean;
  update_prices?: boolean;
  update_stocks?: boolean;
  update_metadata?: boolean;
  batch_size?: number;
}

// Логи синхронизации
export interface SyncLog {
  id: string;
  marketplace_account_id: string;
  task_id?: string;
  type: TaskType;
  status: TaskStatus;
  items_processed: number;
  items_success: number;
  items_failed: number;
  duration_ms: number;
  error_summary?: string;
  started_at: Date;
  completed_at: Date;
  created_at: Date;
}

// Кэш данных
export interface DataCache {
  id: string;
  cache_key: string;
  data: any;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

// Rate limiting
export interface RateLimit {
  id: string;
  marketplace_account_id: string;
  marketplace: MarketplaceType;
  endpoint: string;
  requests_count: number;
  window_start: Date;
  window_duration_ms: number;
  max_requests: number;
  created_at: Date;
  updated_at: Date;
}

// Webhook события
export interface WebhookEvent {
  id: string;
  marketplace_account_id: string;
  marketplace: MarketplaceType;
  event_type: string;
  payload: any;
  processed: boolean;
  processed_at?: Date;
  error_message?: string;
  created_at: Date;
}

// Уведомления
export type NotificationType = 
  | 'sync_completed'
  | 'sync_failed'
  | 'low_stock'
  | 'price_changed'
  | 'new_order'
  | 'order_cancelled'
  | 'competitor_price_change'
  | 'system_error';

export type NotificationChannel = 'email' | 'telegram' | 'push' | 'in_app';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  sent: boolean;
  sent_at?: Date;
  created_at: Date;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  type: NotificationType;
  enabled: boolean;
  channels: NotificationChannel[];
  conditions?: NotificationConditions;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationConditions {
  min_stock_level?: number;
  price_change_percent?: number;
  order_amount_threshold?: number;
  [key: string]: any;
}

// Автоматизация
export type AutomationTrigger = 
  | 'schedule'
  | 'low_stock'
  | 'price_change'
  | 'competitor_price'
  | 'order_received'
  | 'sync_completed';

export type AutomationAction = 
  | 'update_price'
  | 'update_stock'
  | 'send_notification'
  | 'generate_report'
  | 'sync_data'
  | 'pause_listing';

export interface AutomationRule {
  id: string;
  user_id: string;
  marketplace_account_id?: string;
  name: string;
  description?: string;
  is_active: boolean;
  trigger: AutomationTrigger;
  trigger_conditions: any;
  actions: AutomationActionConfig[];
  last_executed?: Date;
  execution_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface AutomationActionConfig {
  action: AutomationAction;
  parameters: any;
  delay_ms?: number;
}

export interface AutomationExecution {
  id: string;
  rule_id: string;
  status: 'success' | 'failed' | 'partial';
  trigger_data: any;
  actions_executed: number;
  actions_failed: number;
  error_message?: string;
  executed_at: Date;
  duration_ms: number;
}

// Мониторинг системы
export interface SystemHealth {
  id: string;
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  message?: string;
  metrics: any;
  checked_at: Date;
}

export interface ApiHealth {
  marketplace: MarketplaceType;
  endpoint: string;
  status: 'up' | 'down' | 'degraded';
  response_time_ms: number;
  last_check: Date;
  error_rate: number;
}

// Конфигурация синхронизации
export interface SyncConfiguration {
  id: string;
  marketplace_account_id: string;
  marketplace: MarketplaceType;
  sync_products: boolean;
  sync_orders: boolean;
  sync_analytics: boolean;
  sync_frequency_minutes: number;
  batch_size: number;
  auto_update_prices: boolean;
  auto_update_stocks: boolean;
  created_at: Date;
  updated_at: Date;
}