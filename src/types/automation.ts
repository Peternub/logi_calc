// Типы для системы настройки автоматизации

// Сценарий автопилота
export interface AutomationScenario {
  id: string;
  name: string;
  description: string;
  active: boolean;
  priority: number;
  conditions: AutomationRule[];
  actions: {
    type: 'price_change' | 'send_notification' | 'generate_report';
    config: any;
  }[];
  schedule: {
    type: 'immediate' | 'daily' | 'weekly' | 'custom';
    time?: string;
    daysOfWeek?: number[];
  };
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Правило автоматизации
export interface AutomationRule {
  id: string;
  name: string;
  conditionType: 'sales' | 'stock' | 'competitor' | 'profitability';
  conditions: {
    // Условия срабатывания правила
    metric: string;
    operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
    value: number;
    duration?: number; // в часах
  }[];
  weight: number; // вес правила в принятии решений
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Запланированное действие
export interface ScheduledAction {
  id: string;
  scenarioId: string;
  actionType: 'price_change' | 'send_notification' | 'generate_report';
  payload: any;
  scheduledTime: string;
  executed: boolean;
  executionResult?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Безопасные ограничения
export interface SafetyLimits {
  id: string;
  userId: string;
  maxPriceChangePercent: number; // максимальный процент изменения цены за раз
  minProfitMargin: number; // минимальная маржинальность в процентах
  maxDailyActions: number; // максимальное количество автоматических действий в день
  priceFreezePeriod: number; // период заморозки цен после изменения (в часах)
  excludedProducts: string[]; // список исключенных товаров из автоматизации
  createdAt: string;
  updatedAt: string;
}