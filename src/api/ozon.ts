// Клиент для Ozon Seller API
// Документация: https://docs.ozon.ru/api/seller/

interface OzonConfig {
  clientId: string
  apiKey: string
  baseUrl?: string
}

interface OzonProductListRequest {
  page?: number
  page_size?: number
  sort_dir?: 'ASC' | 'DESC'
  sort_by?: 'name' | 'created_at' | 'updated_at'
  filter?: {
    offer_id?: string[]
    product_id?: number[]
    visibility?: 'ALL' | 'VISIBLE' | 'INVISIBLE'
  }
}

interface OzonProduct {
  product_id: number
  offer_id: string
  barcode: string
  name: string
  price: string
  old_price: string
  premium_price: string
  recommended_price: string
  marketing_price: string
  min_price: string
  buybox_price: string
  category_id: number
  state: string
  visible: boolean
  has_discounted_item: boolean
  currency_code: string
  updated_at: string
  created_at: string
  images: Array<{
    file_name: string
    default: boolean
    index: number
  }>
  stocks: {
    coming: number
    present: number
    reserved: number
  }
}

interface OzonProductListResponse {
  result: {
    items: OzonProduct[]
    total: number
    last_id: string
  }
}

interface OzonAnalyticsRequest {
  date_from: string
  date_to: string
  metrics: string[]
  dimension?: string[]
  sort?: Array<{
    key: string
    order: 'DESC' | 'ASC'
  }>
  limit?: number
  offset?: number
}

interface OzonAnalyticsResponse {
  result: {
    data: Array<{
      dimensions: Array<{
        id: string
        name: string
      }>
      metrics: number[]
    }>
    totals: number[]
  }
}

export class OzonClient {
  private config: OzonConfig
  private baseUrl: string

  constructor(config: OzonConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 'https://api-seller.ozon.ru'
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'Client-Id': this.config.clientId,
      'Api-Key': this.config.apiKey,
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
        throw new Error(`Ozon API Error: ${response.status} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Ozon API request failed:', error)
      throw error
    }
  }

  // Получение списка товаров
  async getProductList(params: OzonProductListRequest = {}): Promise<OzonProductListResponse> {
    const requestData = {
      page: params.page || 1,
      page_size: params.page_size || 100,
      sort_dir: params.sort_dir || 'DESC',
      sort_by: params.sort_by || 'created_at',
      ...(params.filter && { filter: params.filter })
    }

    return this.makeRequest<OzonProductListResponse>('/v2/product/list', 'POST', requestData)
  }

  // Получение информации о товаре
  async getProductInfo(productIds: number[]): Promise<any> {
    return this.makeRequest('/v2/product/info', 'POST', {
      product_id: productIds
    })
  }

  // Получение цен товаров
  async getProductPrices(productIds: number[]): Promise<any> {
    return this.makeRequest('/v1/product/info/prices', 'POST', {
      product_id: productIds
    })
  }

  // Обновление цен товаров
  async updateProductPrices(prices: Array<{
    product_id: number
    price: string
    old_price?: string
    premium_price?: string
  }>): Promise<any> {
    return this.makeRequest('/v1/product/import/prices', 'POST', {
      prices
    })
  }

  // Получение остатков товаров
  async getProductStocks(params: {
    limit?: number
    offset?: number
    warehouse_type?: 'ALL' | 'FBO' | 'FBS' | 'CROSSDOCK'
  } = {}): Promise<any> {
    return this.makeRequest('/v2/products/stocks', 'POST', {
      limit: params.limit || 100,
      offset: params.offset || 0,
      warehouse_type: params.warehouse_type || 'ALL'
    })
  }

  // Получение аналитических данных
  async getAnalyticsData(params: OzonAnalyticsRequest): Promise<OzonAnalyticsResponse> {
    return this.makeRequest<OzonAnalyticsResponse>('/v1/analytics/data', 'POST', params)
  }

  // Получение отчета по продажам
  async getSalesReport(dateFrom: string, dateTo: string): Promise<any> {
    return this.makeRequest('/v1/analytics/data', 'POST', {
      date_from: dateFrom,
      date_to: dateTo,
      metrics: [
        'revenue',
        'ordered_units',
        'delivered_units',
        'returns',
        'cancellations'
      ],
      dimension: ['product_id', 'sku'],
      sort: [{ key: 'revenue', order: 'DESC' }]
    })
  }

  // Получение заказов
  async getOrders(params: {
    dir?: 'ASC' | 'DESC'
    filter?: {
      since: string
      to: string
      status?: string
    }
    limit?: number
    offset?: number
  }): Promise<any> {
    return this.makeRequest('/v3/posting/fbo/list', 'POST', {
      dir: params.dir || 'DESC',
      filter: params.filter || {},
      limit: params.limit || 50,
      offset: params.offset || 0,
      with: {
        analytics_data: true,
        financial_data: true
      }
    })
  }

  // Тестирование подключения
  async testConnection(): Promise<boolean> {
    try {
      await this.getProductList({ page: 1, page_size: 1 })
      return true
    } catch (error) {
      console.error('Ozon connection test failed:', error)
      return false
    }
  }
}

// Фабрика для создания клиента Ozon
export function createOzonClient(clientId: string, apiKey: string): OzonClient {
  return new OzonClient({ clientId, apiKey })
}

// Хелперы для работы с данными Ozon
export const OzonHelpers = {
  // Преобразование товара Ozon в наш формат
  transformProduct: (ozonProduct: OzonProduct, accountId: string) => ({
    marketplace_account_id: accountId,
    marketplace_product_id: ozonProduct.product_id.toString(),
    name: ozonProduct.name,
    sku: ozonProduct.offer_id,
    price: parseFloat(ozonProduct.price),
    stock: ozonProduct.stocks.present,
    category: null, // Нужно дополнительно получать категории
    status: ozonProduct.visible ? 'active' : 'inactive'
  }),

  // Форматирование цены для Ozon
  formatPrice: (price: number): string => {
    return price.toFixed(2)
  },

  // Валидация настроек Ozon
  validateConfig: (config: { clientId: string; apiKey: string }): boolean => {
    return !!(config.clientId && config.apiKey)
  }
}