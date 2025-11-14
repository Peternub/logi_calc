// Константы приложения LogiCalc

// Информация о приложении
export const APP_NAME = 'LogiCalc'
export const APP_DESCRIPTION = 'Веб-сервис аналитики маркетплейсов с ИИ-агентами'
export const APP_VERSION = '0.1.0'

// URL и конфигурация
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// Маркетплейсы
export const MARKETPLACES = {
  OZON: 'ozon',
  WILDBERRIES: 'wildberries', 
  YANDEX_MARKET: 'yandex_market'
} as const

export const MARKETPLACE_NAMES = {
  [MARKETPLACES.OZON]: 'Ozon',
  [MARKETPLACES.WILDBERRIES]: 'Wildberries',
  [MARKETPLACES.YANDEX_MARKET]: 'Яндекс.Маркет'
} as const

// API конфигурация
export const API_ENDPOINTS = {
  // Ozon API
  OZON: {
    BASE_URL: 'https://api-seller.ozon.ru',
    PRODUCTS: '/v2/product/list',
    PRODUCT_INFO: '/v2/product/info',
    PRICES: '/v2/product/prices', 
    ANALYTICS: '/v1/analytics/data'
  },
  // Wildberries API
  WILDBERRIES: {
    BASE_URL: 'https://suppliers-api.wildberries.ru',
    ORDERS: '/api/v2/orders',
    STOCKS: '/api/v2/stocks',
    PRICES: '/api/v2/prices'
  },
  // Яндекс.Маркет API
  YANDEX_MARKET: {
    BASE_URL: 'https://api.partner.market.yandex.ru',
    ORDERS: '/campaigns/{campaignId}/orders.json',
    PRICES: '/campaigns/{campaignId}/offers/prices.json'
  }
} as const

// Статусы продуктов
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive', 
  DELETED: 'deleted'
} as const

// Типы метрик аналитики
export const METRIC_TYPES = {
  SALES: 'sales',
  PROFIT: 'profit',
  STOCK: 'stock',
  CONVERSION: 'conversion'
} as const

// Периоды для аналитики
export const ANALYTICS_PERIODS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  CUSTOM: 'custom'
} as const

// Лимиты и пагинация
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1
} as const

// Интервалы обновления данных (в миллисекундах)
export const UPDATE_INTERVALS = {
  REAL_TIME: 10 * 1000, // 10 секунд
  FREQUENT: 30 * 1000, // 30 секунд  
  NORMAL: 5 * 60 * 1000, // 5 минут
  SLOW: 30 * 60 * 1000 // 30 минут
} as const

// Цвета для графиков и UI
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#10b981', 
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
  PURPLE: '#8b5cf6',
  PINK: '#ec4899',
  INDIGO: '#6366f1'
} as const

// Форматы файлов для экспорта
export const EXPORT_FORMATS = {
  CSV: 'csv',
  XLSX: 'xlsx',
  PDF: 'pdf',
  JSON: 'json'
} as const

// Роли пользователей
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
} as const

// Локали
export const LOCALES = {
  RU: 'ru',
  EN: 'en'
} as const

// Режимы темы
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const