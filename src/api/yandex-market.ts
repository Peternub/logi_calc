// Клиент для Яндекс.Маркет Partner API
// Документация: https://yandex.ru/dev/market/

interface YandexMarketConfig {
  oauthToken: string
  campaignId: string
  baseUrl?: string
}

interface YMProduct {
  offerId: string
  name: string
  category: string
  vendor: string
  vendorCode: string
  description: string
  manufacturerCountries: string[]
  weightDimensions: {
    length: number
    width: number
    height: number
  }
  urls: string[]
  pictures: string[]
  condition: {
    type: 'NEW' | 'USED' | 'REFURBISHED'
    quality: 'PERFECT' | 'EXCELLENT' | 'GOOD' | 'FAIR'
    reason: string
  }
  availability: 'ACTIVE' | 'INACTIVE' | 'DELISTED'
  price: {
    value: number
    currencyId: string
    discountBase: number
    vat: number
  }
  purchasePrice: {
    value: number
    currencyId: string
  }
  cofinancePrice: {
    value: number
    currencyId: string
  }
  categoryId: number
  basicPrice: {
    value: number
    currencyId: string
  }
}

interface YMOrder {
  id: number
  status: 'CANCELLED' | 'DELIVERED' | 'DELIVERY' | 'PICKUP' | 'PROCESSING' | 'UNPAID'
  substatus: string
  creationDate: string
  currency: string
  itemsTotal: number
  total: number
  totalWithSubsidy: number
  buyerTotal: number
  paymentType: 'PREPAID' | 'POSTPAID'
  paymentMethod: 'YANDEX' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'CARD_ON_DELIVERY' | 'CASH_ON_DELIVERY'
  fake: boolean
  delivery: {
    type: 'DELIVERY' | 'PICKUP'
    serviceName: string
    price: number
    dates: {
      fromDate: string
      toDate: string
    }
    region: {
      id: number
      name: string
      type: string
    }
    address: {
      country: string
      postcode: string
      city: string
      street: string
      house: string
      apartment: string
    }
  }
  buyer: {
    id: string
    lastName: string
    firstName: string
    middleName: string
    phone: string
    email: string
  }
  items: Array<{
    id: number
    offerId: string
    offerName: string
    price: number
    buyerPrice: number
    count: number
    vat: number
    shopSku: string
    subsidy: number
    partnerWarehouseId: string
  }>
}

interface YMStats {
  offerStats: Array<{
    offerId: string
    warehouseId: string
    tariff: string
    clicks: number
    shows: number
    ctr: number
    spend: number
    revenue: number
    orders: number
    modelId: number
  }>
  totalStats: {
    clicks: number
    shows: number
    ctr: number
    spend: number
    revenue: number
    orders: number
  }
}

export class YandexMarketClient {
  private config: YandexMarketConfig
  private baseUrl: string

  constructor(config: YandexMarketConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 'https://api.partner.market.yandex.ru'
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'Authorization': `OAuth ${this.config.oauthToken}`,
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
        throw new Error(`Yandex.Market API Error: ${response.status} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Yandex.Market API request failed:', error)
      throw error
    }
  }

  // Получение списка товаров
  async getOffers(params: {
    page?: number
    pageSize?: number
    archived?: boolean
    categoryIds?: number[]
    vendorNames?: string[]
    tags?: string[]
  } = {}): Promise<{ offers: YMProduct[], paging: any }> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.pageSize) queryParams.append('page_size', params.pageSize.toString())
    if (params.archived !== undefined) queryParams.append('archived', params.archived.toString())
    if (params.categoryIds) {
      params.categoryIds.forEach(id => queryParams.append('category_id', id.toString()))
    }
    if (params.vendorNames) {
      params.vendorNames.forEach(name => queryParams.append('vendor', name))
    }
    if (params.tags) {
      params.tags.forEach(tag => queryParams.append('tag', tag))
    }

    const endpoint = `/campaigns/${this.config.campaignId}/offers?${queryParams}`
    return this.makeRequest<{ offers: YMProduct[], paging: any }>(endpoint)
  }

  // Получение информации о конкретном товаре
  async getOffer(offerId: string): Promise<YMProduct> {
    const endpoint = `/campaigns/${this.config.campaignId}/offers/${encodeURIComponent(offerId)}`
    const response = await this.makeRequest<{ offer: YMProduct }>(endpoint)
    return response.offer
  }

  // Обновление цен товаров
  async updatePrices(offers: Array<{
    offerId: string
    price: {
      value: number
      currencyId: string
    }
  }>): Promise<any> {
    const endpoint = `/campaigns/${this.config.campaignId}/offer-prices/updates`
    return this.makeRequest(endpoint, 'POST', { offers })
  }

  // Обновление остатков товаров
  async updateStocks(skus: Array<{
    sku: string
    warehouseId: string
    items: Array<{
      count: number
      type: 'FIT' | 'DEFECT'
      updatedAt: string
    }>
  }>): Promise<any> {
    const endpoint = `/campaigns/${this.config.campaignId}/offers/stocks`
    return this.makeRequest(endpoint, 'PUT', { skus })
  }

  // Получение заказов
  async getOrders(params: {
    status?: string[]
    substatus?: string[]
    fromDate?: string
    toDate?: string
    supplierShipmentDateFrom?: string
    supplierShipmentDateTo?: string
    updatedAtFrom?: string
    updatedAtTo?: string
    dispatchType?: 'DROP_SHIP' | 'DROP_SHIP_BY_SELLER'
    fake?: boolean
    hasCis?: boolean
    onlyWaitingForCancellationApprove?: boolean
    onlyEstimatedDelivery?: boolean
    buyerType?: 'PERSON' | 'BUSINESS'
    page?: number
    pageSize?: number
  } = {}): Promise<{ orders: YMOrder[], paging: any }> {
    const queryParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()))
        } else {
          queryParams.append(key, value.toString())
        }
      }
    })

    const endpoint = `/campaigns/${this.config.campaignId}/orders?${queryParams}`
    return this.makeRequest<{ orders: YMOrder[], paging: any }>(endpoint)
  }

  // Получение статистики
  async getStats(params: {
    dateFrom: string
    dateTo: string
    offerIds?: string[]
    warehouseIds?: string[]
    groupByDate?: boolean
  }): Promise<YMStats> {
    const queryParams = new URLSearchParams({
      dateFrom: params.dateFrom,
      dateTo: params.dateTo
    })

    if (params.offerIds) {
      params.offerIds.forEach(id => queryParams.append('offerId', id))
    }
    if (params.warehouseIds) {
      params.warehouseIds.forEach(id => queryParams.append('warehouseId', id))
    }
    if (params.groupByDate) {
      queryParams.append('groupByDate', 'true')
    }

    const endpoint = `/campaigns/${this.config.campaignId}/stats/offers?${queryParams}`
    return this.makeRequest<YMStats>(endpoint)
  }

  // Получение отчета по продажам
  async getSalesReport(dateFrom: string, dateTo: string): Promise<any> {
    const endpoint = `/campaigns/${this.config.campaignId}/stats/orders`
    const queryParams = new URLSearchParams({
      dateFrom,
      dateTo
    })

    return this.makeRequest(`${endpoint}?${queryParams}`)
  }

  // Тестирование подключения
  async testConnection(): Promise<boolean> {
    try {
      await this.getOffers({ pageSize: 1 })
      return true
    } catch (error) {
      console.error('Yandex.Market connection test failed:', error)
      return false
    }
  }

  // Получение информации о кампании
  async getCampaignInfo(): Promise<any> {
    const endpoint = `/campaigns/${this.config.campaignId}`
    return this.makeRequest(endpoint)
  }
}

// Фабрика для создания клиента Яндекс.Маркет
export function createYandexMarketClient(oauthToken: string, campaignId: string): YandexMarketClient {
  return new YandexMarketClient({ oauthToken, campaignId })
}

// Хелперы для работы с данными Яндекс.Маркет
export const YandexMarketHelpers = {
  // Преобразование товара ЯМ в наш формат
  transformProduct: (ymProduct: YMProduct, accountId: string) => ({
    marketplace_account_id: accountId,
    marketplace_product_id: ymProduct.offerId,
    name: ymProduct.name,
    sku: ymProduct.vendorCode,
    price: ymProduct.price.value,
    stock: 0, // Остатки получаются отдельно
    category: ymProduct.category,
    status: ymProduct.availability === 'ACTIVE' ? 'active' : 'inactive'
  }),

  // Преобразование заказа ЯМ в наш формат продажи
  transformOrder: (ymOrder: YMOrder, productId: string, accountId: string) => {
    return ymOrder.items.map(item => ({
      product_id: productId,
      marketplace_account_id: accountId,
      order_id: ymOrder.id.toString(),
      quantity: item.count,
      price: item.price,
      commission: item.price - item.buyerPrice,
      net_profit: item.buyerPrice,
      sale_date: ymOrder.creationDate
    }))
  },

  // Валидация настроек ЯМ
  validateConfig: (config: { oauthToken: string; campaignId: string }): boolean => {
    return !!(config.oauthToken && config.campaignId)
  },

  // Форматирование цены для ЯМ
  formatPrice: (price: number): { value: number; currencyId: string } => {
    return {
      value: price,
      currencyId: 'RUR'
    }
  }
}