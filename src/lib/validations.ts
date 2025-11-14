import { z } from 'zod'

// Схемы валидации для API

export const DashboardStatsSchema = z.object({
  period: z.enum(['7d', '30d', '90d']).optional().default('30d')
})

export const ChartDataSchema = z.object({
  period: z.enum(['7d', '30d', '90d']).optional().default('7d')
})

export const MarketplaceAccountSchema = z.object({
  marketplace: z.enum(['ozon', 'wildberries', 'yandex_market']),
  account_name: z.string().min(1, 'Название аккаунта обязательно'),
  api_key: z.string().min(1, 'API ключ обязателен'),
  client_id: z.string().optional()
})

export const ProductSchema = z.object({
  marketplace_account_id: z.string().uuid('Некорректный ID аккаунта'),
  marketplace_product_id: z.string().min(1, 'ID товара в маркетплейсе обязателен'),
  name: z.string().min(1, 'Название товара обязательно'),
  sku: z.string().optional(),
  price: z.number().positive('Цена должна быть положительным числом'),
  stock: z.number().int().min(0, 'Остаток не может быть отрицательным'),
  category: z.string().optional(),
  status: z.enum(['active', 'inactive', 'deleted']).optional().default('active')
})

export const UpdateProductSchema = ProductSchema.partial()

export const SaleSchema = z.object({
  product_id: z.string().uuid('Некорректный ID товара'),
  marketplace_account_id: z.string().uuid('Некорректный ID аккаунта'),
  order_id: z.string().min(1, 'ID заказа обязателен'),
  quantity: z.number().int().positive('Количество должно быть положительным'),
  price: z.number().positive('Цена должна быть положительной'),
  commission: z.number().min(0, 'Комиссия не может быть отрицательной'),
  net_profit: z.number(),
  sale_date: z.string().datetime('Некорректная дата продажи')
})

export const UserProfileSchema = z.object({
  full_name: z.string().min(1, 'Имя обязательно').optional(),
  avatar_url: z.string().url('Некорректный URL аватара').optional()
})

export const PaginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc')
})

export const FilterSchema = z.object({
  marketplace: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  price_min: z.number().positive().optional(),
  price_max: z.number().positive().optional()
})

// Схема валидации для парсинга Wildberries
export const WbParseSchema = z.object({
  account_id: z.string().optional(),
  url: z.string().url('Некорректный URL категории'),
  category: z.string().optional(),
  limit: z.number().int().positive().max(1000).optional(),
  proxies_file: z.string().optional(),
  save_to_db: z.boolean().optional().default(true)
})

// Утилиты для валидации
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body)
  
  if (!result.success) {
    const errors = result.error.issues.map((err: z.ZodIssue) => ({
      field: err.path.join('.'),
      message: err.message
    }))
    
    throw new Error(`Ошибка валидации: ${JSON.stringify(errors)}`)
  }
  
  return result.data
}

export function validateQuery<T>(schema: z.ZodSchema<T>, query: Record<string, string | string[]>): T {
  // Преобразуем query параметры в подходящий формат
  const processedQuery: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      processedQuery[key] = value[0]
    } else {
      processedQuery[key] = value
    }
    
    // Преобразуем числовые параметры
    if (typeof processedQuery[key] === 'string') {
      const numValue = Number(processedQuery[key])
      if (!isNaN(numValue) && ['page', 'limit', 'price_min', 'price_max'].includes(key)) {
        processedQuery[key] = numValue
      }
    }
  }
  
  const result = schema.safeParse(processedQuery)
  
  if (!result.success) {
    const errors = result.error.issues.map((err: z.ZodIssue) => ({
      field: err.path.join('.'),
      message: err.message
    }))
    
    throw new Error(`Ошибка валидации параметров: ${JSON.stringify(errors)}`)
  }
  
  return result.data
}