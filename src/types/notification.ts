// Типы для системы уведомлений

// Типы для уведомлений
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  channel: ('email' | 'telegram' | 'push')[];
  read: boolean;
  createdAt: string;
  userId: string;
}

// Триггеры уведомлений
export interface NotificationTrigger {
  id: string;
  name: string;
  description: string;
  event: 'price_change' | 'low_stock' | 'new_order' | 'competitor_price_change' | 'sales_target_reached';
  conditions: {
    // Условия срабатывания триггера
    threshold?: number; // пороговое значение
    frequency?: 'immediate' | 'daily' | 'weekly';
    active: boolean;
  };
  channels: ('email' | 'telegram' | 'push')[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Настройки email уведомлений
export interface EmailSettings {
  enabled: boolean;
  emailAddress: string;
  frequency: 'immediate' | 'digest';
  types: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Настройки Telegram уведомлений
export interface TelegramSettings {
  connected: boolean;
  chatId: string;
  botUsername: string;
  notificationTypes: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Подписка на push уведомления
export interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
  userId: string;
  createdAt: string;
}