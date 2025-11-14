// Клиент для Wildberries Supplier API с интеграцией Python парсера
// Документация: https://openapi.wb.ru/

interface WildberriesConfig {
  apiKey: string
  baseUrl?: string
}

// Интерфейс для данных, которые возвращает Python парсер
interface WBProduct {
  Название: string
  Цена: string
  Скидка: string
  Рейтинг: string
  Отзывы: string
  Наличие: string
  Продавец: string
  Категория: string
  Бренд: string
  Артикул: string
  Ссылка: string
  Изображение: string
}

// Интерфейс для остатков (из оригинального API)
interface WBStock {
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  quantity: number
  isSupply: boolean
  isRealization: boolean
  quantityFull: number
  quantityNotInOrders: number
  warehouse: number
  warehouseName: string
  inWayToClient: number
  inWayFromClient: number
  nmId: number
  subject: string
  category: string
  daysOnSite: number
  brand: string
  SCCode: string
  Price: number
  Discount: number
  isStorekeeper: boolean
}

interface WBOrder {
  date: string
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  totalPrice: number
  discountPercent: number
  warehouseName: string
  oblast: string
  incomeID: number
  odid: number
  nmId: number
  subject: string
  category: string
  brand: string
  isCancel: boolean
  cancel_dt: string
  gNumber: string
  sticker: string
  srid: string
}

interface WBSale {
  date: string
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  totalPrice: number
  discountPercent: number
  isSupply: boolean
  isRealization: boolean
  promoCodeDiscount: number
  warehouseName: string
  countryName: string
  oblastOkrugName: string
  regionName: string
  incomeID: number
  saleID: string
  odid: number
  spp: number
  forPay: number
  finishedPrice: number
  priceWithDisc: number
  nmId: number
  subject: string
  category: string
  brand: string
  IsStorno: number
  gNumber: string
  sticker: string
  srid: string
}

export class WildberriesClient {
  private config: WildberriesConfig
  private baseUrl: string

  constructor(config: WildberriesConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 'https://suppliers-api.wildberries.ru'
  }

  // Метод для запуска Python парсера (новый подход)
  async runPythonParser(params: {
    url: string
    category?: string
    limit?: number
  }): Promise<WBProduct[]> {
    // Этот метод будет вызываться через наш TypeScript сервис
    // который использует child_process для запуска Python скрипта
    throw new Error('Этот метод должен вызываться через wildberriesParserService')
  }

  // Остальные методы API сохранены для обратной совместимости
  // но будут использоваться только в случае необходимости

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'Authorization': this.config.apiKey,
      'Content-Type': 'application/json'
    }

    const requestOptions: RequestInit = {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) })
    }

    try {
      const response = await fetch(url, requestOptions)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Wildberries API Error: ${response.status} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Wildberries API request failed:', error)
      throw error
    }
  }

  // Получение информации о товарах (оригинальный API)
  async getProducts(limit: number = 100, updatedAt?: string): Promise<WBProduct[]> {
    // Этот метод будет использоваться только как fallback
    // если Python парсер не сработает
    console.warn('Используется fallback API для Wildberries - это может не сработать из-за антибот-защиты')
    
    const params = new URLSearchParams({
      limit: limit.toString()
    })
    
    if (updatedAt) {
      params.append('updatedAt', updatedAt)
    }

    return this.makeRequest<WBProduct[]>(`/content/v1/cards/cursor/list?${params}`)
  }

  // Получение остатков товаров
  async getStocks(dateFrom?: string): Promise<WBStock[]> {
    const params = new URLSearchParams()
    
    if (dateFrom) {
      params.append('dateFrom', dateFrom)
    }

    return this.makeRequest<WBStock[]>(`/api/v3/stocks?${params}`)
  }

  // Получение заказов
  async getOrders(dateFrom: string, flag: number = 1): Promise<WBOrder[]> {
    const params = new URLSearchParams({
      dateFrom,
      flag: flag.toString()
    })

    return this.makeRequest<WBOrder[]>(`/api/v3/orders?${params}`)
  }

  // Получение продаж
  async getSales(dateFrom: string, flag: number = 1): Promise<WBSale[]> {
    const params = new URLSearchParams({
      dateFrom,
      flag: flag.toString()
    })

    return this.makeRequest<WBSale[]>(`/api/v3/sales?${params}`)
  }

  // Обновление цен товаров
  async updatePrices(prices: Array<{
    nmId: number
    price: number
  }>): Promise<any> {
    return this.makeRequest('/public/api/v1/prices', 'POST', prices)
  }

  // Обновление скидок
  async updateDiscounts(discounts: Array<{
    nm: number
    discount: number
  }>): Promise<any> {
    return this.makeRequest('/public/api/v1/updateDiscounts', 'POST', discounts)
  }

  // Получение отчета по складу
  async getWarehouseReport(dateFrom: string, dateTo: string): Promise<any> {
    const params = new URLSearchParams({
      dateFrom,
      dateTo
    })

    return this.makeRequest(`/api/v1/supplier/reportDetailByPeriod?${params}`)
  }

  // Получение статистики по товарам
  async getProductStats(dateFrom: string, dateTo: string): Promise<any> {
    const params = new URLSearchParams({
      dateFrom,
      dateTo
    })

    return this.makeRequest(`/api/v1/supplier/incomes?${params}`)
  }

  // Тестирование подключения
  async testConnection(): Promise<boolean> {
    try {
      // Для тестирования сначала пробуем Python парсер
      console.log('Для тестирования подключения Wildberries рекомендуется использовать Python парсер')
      // Если нужно тестирование через API:
      await this.getProducts(1)
      return true
    } catch (error) {
      console.error('Wildberries connection test failed:', error)
      return false
    }
  }
}

// Фабрика для создания клиента Wildberries
export function createWildberriesClient(apiKey: string): WildberriesClient {
  return new WildberriesClient({ apiKey })
}

// Хелперы для работы с данными Wildberries
export const WildberriesHelpers = {
  // Преобразование товара WB в наш формат
  transformProduct: (wbProduct: WBProduct, accountId: string) => ({
    marketplace_account_id: accountId,
    marketplace_product_id: wbProduct.Артикул,
    name: wbProduct.Название,
    sku: wbProduct.Артикул,
    price: parseFloat(wbProduct.Цена.replace(/[^\d.,]/g, '')) || 0,
    stock: 0, // Остатки получаются отдельно
    category: wbProduct.Категория,
    status: 'active'
  }),

  // Преобразование остатков WB в наш формат
  transformStock: (wbStock: WBStock) => ({
    marketplace_product_id: wbStock.nmId.toString(),
    price: wbStock.Price,
    stock: wbStock.quantity,
    last_updated: wbStock.lastChangeDate
  }),

  // Преобразование продажи WB в наш формат
  transformSale: (wbSale: WBSale, productId: string, accountId: string) => ({
    product_id: productId,
    marketplace_account_id: accountId,
    order_id: wbSale.saleID,
    quantity: 1,
    price: wbSale.totalPrice,
    commission: wbSale.totalPrice - wbSale.forPay,
    net_profit: wbSale.forPay,
    sale_date: wbSale.date
  }),

  // Валидация настроек WB
  validateConfig: (config: { apiKey: string }): boolean => {
    return !!(config.apiKey)
  },

  // Форматирование цены для WB (в копейках)
  formatPrice: (price: number): number => {
    return Math.round(price * 100)
  },

  // Конвертация цены из WB формата
  parsePrice: (price: string): number => {
    return parseFloat(price.replace(/[^\d.,]/g, '')) || 0
  }
}