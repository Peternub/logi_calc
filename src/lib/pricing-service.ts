// Types are now defined directly in this file

// Типы для правил ценообразования
export interface PricingRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  conditions: {
    // Условия применения правила
    minPrice?: number;
    maxPrice?: number;
    categories?: string[];
    brands?: string[];
    tags?: string[];
    stockLevel?: 'low' | 'medium' | 'high';
    competitorPriceRatio?: number; // Отношение к цене конкурента (например, 0.95 для 5% ниже)
  };
  actions: {
    // Действия при выполнении условий
    type: 'fixed' | 'percentage' | 'match_competitor' | 'optimal';
    value: number; // Для fixed и percentage типов
    offset: number; // Смещение от цены конкурента
    minMargin?: number; // Минимальная маржа в процентах
  };
  active: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Данные о рентабельности
export interface ProfitabilityData {
  productId: string;
  productName: string;
  currentPrice: number;
  costPrice: number;
  estimatedProfit: number;
  profitMargin: number;
  competitorPrice: number;
  recommendedPrice: number;
  lastUpdated: string;
}

// Лог изменения цены
export interface PriceLog {
  id: string;
  productId: string;
  oldPrice: number;
  newPrice: number;
  reason: 'manual' | 'rule' | 'schedule';
  ruleId?: string;
  userId?: string;
  timestamp: string;
}

// Сервис управления ценами
export class PricingService {
  // Получение списка правил ценообразования пользователя
  static async getPricingRules(userId: string): Promise<PricingRule[]> {
    // TODO: Реализовать получение списка правил из базы данных
    return [];
  }

  // Получение конкретного правила ценообразования
  static async getPricingRule(id: string, userId: string): Promise<PricingRule | null> {
    // TODO: Реализовать получение конкретного правила из базы данных
    return null;
  }

  // Создание нового правила ценообразования
  static async createPricingRule(ruleData: Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<PricingRule> {
    // TODO: Реализовать создание нового правила в базе данных
    throw new Error('Not implemented');
  }

  // Обновление правила ценообразования
  static async updatePricingRule(id: string, ruleData: Partial<PricingRule>, userId: string): Promise<PricingRule> {
    // TODO: Реализовать обновление правила в базе данных
    throw new Error('Not implemented');
  }

  // Удаление правила ценообразования
  static async deletePricingRule(id: string, userId: string): Promise<void> {
    // TODO: Реализовать удаление правила из базы данных
    throw new Error('Not implemented');
  }

  // Получение данных о рентабельности товаров
  static async getProfitabilityData(userId: string): Promise<ProfitabilityData[]> {
    // TODO: Реализовать расчет рентабельности на основе себестоимости, цен и продаж
    return [];
  }

  // Получение логов изменений цен
  static async getPriceLogs(userId: string, productId?: string): Promise<PriceLog[]> {
    // TODO: Реализовать получение логов изменений цен из базы данных
    return [];
  }

  // Применение правил ценообразования
  static async applyPricingRules(userId: string): Promise<void> {
    // TODO: Реализовать применение всех активных правил ценообразования
    // 1. Получить все активные правила пользователя
    // 2. Для каждого продукта:
    //    a. Проверить условия всех правил по приоритету
    //    b. Рассчитать новую цену согласно действию правила
    //    c. Убедиться, что цена соответствует минимальной марже
    //    d. Записать изменение в лог
    throw new Error('Not implemented');
  }
}