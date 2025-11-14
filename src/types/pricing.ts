// Типы для системы автоматического управления ценами

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