// Types are now defined directly in this file

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

// Сервис настройки автоматизации
export class AutomationService {
  // Получение списка сценариев автопилота пользователя
  static async getScenarios(userId: string): Promise<AutomationScenario[]> {
    // TODO: Реализовать получение списка сценариев из базы данных
    return [];
  }

  // Получение конкретного сценария автопилота
  static async getScenario(id: string, userId: string): Promise<AutomationScenario | null> {
    // TODO: Реализовать получение конкретного сценария из базы данных
    return null;
  }

  // Создание нового сценария автопилота
  static async createScenario(scenarioData: Omit<AutomationScenario, 'id' | 'createdAt' | 'updatedAt'>): Promise<AutomationScenario> {
    // TODO: Реализовать создание нового сценария в базе данных
    throw new Error('Not implemented');
  }

  // Обновление сценария автопилота
  static async updateScenario(id: string, scenarioData: Partial<AutomationScenario>, userId: string): Promise<AutomationScenario> {
    // TODO: Реализовать обновление сценария в базе данных
    throw new Error('Not implemented');
  }

  // Удаление сценария автопилота
  static async deleteScenario(id: string, userId: string): Promise<void> {
    // TODO: Реализовать удаление сценария из базы данных
    throw new Error('Not implemented');
  }

  // Получение списка правил автоматизации
  static async getRules(userId: string): Promise<AutomationRule[]> {
    // TODO: Реализовать получение списка правил из базы данных
    return [];
  }

  // Создание нового правила автоматизации
  static async createRule(ruleData: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AutomationRule> {
    // TODO: Реализовать создание нового правила в базе данных
    throw new Error('Not implemented');
  }

  // Обновление правила автоматизации
  static async updateRule(id: string, ruleData: Partial<AutomationRule>, userId: string): Promise<AutomationRule> {
    // TODO: Реализовать обновление правила в базе данных
    throw new Error('Not implemented');
  }

  // Удаление правила автоматизации
  static async deleteRule(id: string, userId: string): Promise<void> {
    // TODO: Реализовать удаление правила из базы данных
    throw new Error('Not implemented');
  }

  // Получение расписания автоматических действий
  static async getScheduledActions(userId: string): Promise<ScheduledAction[]> {
    // TODO: Реализовать получение расписания действий из базы данных
    return [];
  }

  // Получение настроек безопасных ограничений
  static async getSafetyLimits(userId: string): Promise<SafetyLimits | null> {
    // TODO: Реализовать получение настроек безопасных ограничений из базы данных
    return null;
  }

  // Обновление настроек безопасных ограничений
  static async updateSafetyLimits(limits: SafetyLimits): Promise<SafetyLimits> {
    // TODO: Реализовать обновление настроек безопасных ограничений в базе данных
    throw new Error('Not implemented');
  }

  // Проверка безопасности действия
  static async checkSafety(action: any, userId: string): Promise<{ safe: boolean; reason?: string }> {
    // TODO: Реализовать проверку действия на соответствие безопасным ограничениям
    // Проверить изменение цены, маржинальность, количество действий и т.д.
    return { safe: true };
  }
}