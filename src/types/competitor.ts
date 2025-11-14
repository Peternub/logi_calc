// Типы для системы анализа конкурентов

// Интерфейс конкурента
export interface Competitor {
  id: string;
  name: string;
  marketplace: 'ozon' | 'wildberries' | 'yandex-market';
  shopUrl: string;
  monitoredProducts: string[];
  priceMonitoringEnabled: boolean;
  positionMonitoringEnabled: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// История цен
export interface PriceHistory {
  productId: string;
  competitorId: string;
  prices: {
    date: string;
    price: number;
  }[];
  ourPrices: {
    date: string;
    price: number;
  }[];
}

// Данные о позициях
export interface PositionData {
  productId: string;
  keyword: string;
  positions: {
    date: string;
    position: number;
  }[];
  ourPositions: {
    date: string;
    position: number;
  }[];
}

// Тренд рынка
export interface MarketTrend {
  category: string;
  trendType: 'price' | 'demand' | 'assortment';
  direction: 'up' | 'down' | 'stable';
  strength: 'weak' | 'moderate' | 'strong';
  data: any;
  updatedAt: string;
}

// Правило алерта
export interface AlertRule {
  id: string;
  userId: string;
  competitorId?: string;
  productId?: string;
  alertType: 'price_change' | 'position_change' | 'new_product';
  threshold: number; // процент изменения цены или позиции
  notificationChannels: ('email' | 'telegram' | 'push')[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}