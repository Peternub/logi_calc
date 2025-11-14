// Сервис для синхронизации данных с маркетплейсами
import { createOzonClient, OzonHelpers } from '@/api/ozon'
import { createWildberriesClient, WildberriesHelpers } from '@/api/wildberries' 
import { createYandexMarketClient, YandexMarketHelpers } from '@/api/yandex-market'
import { createServerSupabaseClient } from '@/lib/supabase'
import { wildberriesParserService } from '@/lib/wildberries-parser'

interface MarketplaceAccount {
  id: string
  marketplace: 'ozon' | 'wildberries' | 'yandex_market'
  credentials: {
    clientId?: string
    apiKey?: string
    warehouseId?: string
  }
}

export class MarketplaceSyncService {
  private async getSupabase() {
    return await createServerSupabaseClient()
  }

  // Синхронизация товаров с маркетплейса
  async syncProducts(accountId: string): Promise<{ success: boolean; message: string; synced: number }> {
    try {
      const supabase = await this.getSupabase()
      
      // Получаем настройки аккаунта
      const { data: account, error } = await supabase
        .from('marketplace_accounts')
        .select('*')
        .eq('id', accountId)
        .single()

      if (error || !account) {
        return { success: false, message: 'Аккаунт не найден', synced: 0 }
      }

      let syncedCount = 0

      switch (account.marketplace) {
        case 'ozon':
          syncedCount = await this.syncOzonProducts(account, supabase)
          break
        case 'wildberries':
          syncedCount = await this.syncWildberriesProducts(account, supabase)
          break
        case 'yandex_market':
          syncedCount = await this.syncYandexMarketProducts(account, supabase)
          break
        default:
          return { success: false, message: 'Неподдерживаемый маркетплейс', synced: 0 }
      }

      return { 
        success: true, 
        message: `Синхронизировано ${syncedCount} товаров`, 
        synced: syncedCount 
      }

    } catch (error) {
      console.error('Sync error:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Ошибка синхронизации', 
        synced: 0 
      }
    }
  }

  // Синхронизация товаров Ozon
  private async syncOzonProducts(account: MarketplaceAccount, supabase: any): Promise<number> {
    const { clientId, apiKey } = account.credentials

    if (!clientId || !apiKey) {
      throw new Error('Не указаны Client ID или API ключ для Ozon')
    }

    // Валидация конфигурации
    if (!OzonHelpers.validateConfig({ clientId, apiKey })) {
      throw new Error('Некорректные данные для подключения к Ozon')
    }

    const ozonClient = createOzonClient(clientId, apiKey)

    // Тестируем подключение
    const isConnected = await ozonClient.testConnection()
    if (!isConnected) {
      throw new Error('Не удалось подключиться к Ozon API. Проверьте Client ID и API ключ')
    }

    let syncedCount = 0
    let page = 1
    const pageSize = 100

    while (true) {
      try {
        // Получаем товары с Ozon
        const response = await ozonClient.getProductList({
          page,
          page_size: pageSize
        })

        if (!response.result.items.length) {
          break // Больше товаров нет
        }

        // Обрабатываем каждый товар
        for (const ozonProduct of response.result.items) {
          try {
            // Преобразуем в наш формат
            const productData = OzonHelpers.transformProduct(ozonProduct, account.id)

            // Проверяем, существует ли товар
            const { data: existingProduct } = await supabase
              .from('products')
              .select('id')
              .eq('marketplace_account_id', account.id)
              .eq('marketplace_product_id', productData.marketplace_product_id)
              .single()

            if (existingProduct) {
              // Обновляем существующий товар
              await supabase
                .from('products')
                .update({
                  name: productData.name,
                  price: productData.price,
                  stock_quantity: productData.stock,
                  available_quantity: productData.stock,
                  is_active: productData.status === 'active',
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingProduct.id)
            } else {
              // Создаем новый товар
              await supabase
                .from('products')
                .insert({
                  ...productData,
                  marketplace: account.marketplace,
                  currency: 'RUB',
                  available_quantity: productData.stock,
                  last_sync: new Date().toISOString()
                })
            }

            syncedCount++
          } catch (productError) {
            console.error(`Ошибка синхронизации товара ${ozonProduct.product_id}:`, productError)
            // Продолжаем с другими товарами
          }
        }

        // Переходим к следующей странице
        page++

        // Проверяем, есть ли еще товары
        if (response.result.items.length < pageSize) {
          break
        }

      } catch (pageError) {
        console.error(`Ошибка загрузки страницы ${page}:`, pageError)
        break
      }
    }

    return syncedCount
  }

  // Синхронизация товаров Wildberries (с использованием Python парсера)
  private async syncWildberriesProducts(account: MarketplaceAccount, supabase: any): Promise<number> {
    const { apiKey } = account.credentials

    if (!apiKey) {
      throw new Error('Не указан API ключ для Wildberries')
    }

    // Валидация конфигурации
    if (!WildberriesHelpers.validateConfig({ apiKey })) {
      throw new Error('Некорректные данные для подключения к Wildberries')
    }

    // Используем Python парсер для Wildberries (ваш скрипт)
    try {
      // Проверяем доступность Python парсера
      if (await wildberriesParserService.isParserAvailable()) {
        console.log('Используем Python парсер для Wildberries')
        
        // Запускаем парсинг (параметры можно настроить в зависимости от аккаунта)
        const result = await wildberriesParserService.parseAndSave({
          url: 'https://www.wildberries.ru/catalog/elektronika/telefony', // TODO: Получать из настроек аккаунта
          category: 'Электроника/Телефоны', // TODO: Получать из настроек аккаунта
          limit: 100 // TODO: Получать из настроек аккаунта
        }, account.id)
        
        if (result.success) {
          console.log(result.message)
          // Возвращаем количество спарсенных товаров
          return result.parsedCount
        } else {
          throw new Error(result.message)
        }
      } else {
        // Fallback на API если парсер недоступен
        console.warn('Python парсер недоступен, используем стандартный API (может не сработать)')
        return await this.syncWildberriesWithAPI(account, supabase)
      }
    } catch (parserError) {
      console.error('Ошибка при использовании Python парсера:', parserError)
      // Fallback на API если парсер не сработал
      console.warn('Fallback на стандартный API (может не сработать)')
      return await this.syncWildberriesWithAPI(account, supabase)
    }
  }

  // Fallback метод для синхронизации Wildberries через API
  private async syncWildberriesWithAPI(account: MarketplaceAccount, supabase: any): Promise<number> {
    const { apiKey } = account.credentials
    const wbClient = createWildberriesClient(apiKey!)

    // Тестируем подключение
    const isConnected = await wbClient.testConnection()
    if (!isConnected) {
      throw new Error('Не удалось подключиться к Wildberries API. Проверьте API ключ')
    }

    let syncedCount = 0
    let page = 1
    const pageSize = 50 // Меньше для Wildberries из-за ограничений

    while (true) {
      try {
        // Получаем товары с Wildberries
        const products: any[] = await wbClient.getProducts(pageSize)

        if (!products.length) {
          break // Больше товаров нет
        }

        // Обрабатываем каждый товар
        for (const wbProduct of products) {
          try {
            // Преобразуем в наш формат
            const productData = WildberriesHelpers.transformProduct(wbProduct, account.id)

            // Проверяем, существует ли товар
            const { data: existingProduct } = await supabase
              .from('products')
              .select('id')
              .eq('marketplace_account_id', account.id)
              .eq('marketplace_product_id', productData.marketplace_product_id)
              .single()

            if (existingProduct) {
              // Обновляем существующий товар
              await supabase
                .from('products')
                .update({
                  name: productData.name,
                  price: productData.price,
                  stock_quantity: productData.stock,
                  available_quantity: productData.stock,
                  category_name: productData.category || '',
                  is_active: productData.status === 'active',
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingProduct.id)
            } else {
              // Создаем новый товар
              await supabase
                .from('products')
                .insert({
                  ...productData,
                  marketplace: account.marketplace,
                  currency: 'RUB',
                  available_quantity: productData.stock,
                  last_sync: new Date().toISOString()
                })
            }

            syncedCount++
          } catch (productError) {
            console.error(`Ошибка синхронизации товара Wildberries:`, productError)
            // Продолжаем с другими товарами
          }
        }

        // Переходим к следующей странице
        page++

        // Проверяем, есть ли еще товары
        if (products.length < pageSize) {
          break
        }

        // Небольшая задержка между страницами для Wildberries
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (pageError) {
        console.error(`Ошибка загрузки страницы Wildberries ${page}:`, pageError)
        break
      }
    }

    return syncedCount
  }

  // Синхронизация товаров Яндекс.Маркет
  private async syncYandexMarketProducts(account: MarketplaceAccount, supabase: any): Promise<number> {
    const { apiKey, clientId } = account.credentials

    if (!apiKey || !clientId) {
      throw new Error('Не указаны API ключ или Campaign ID для Яндекс.Маркет')
    }

    // Валидация конфигурации
    if (!YandexMarketHelpers.validateConfig({ oauthToken: apiKey, campaignId: clientId })) {
      throw new Error('Некорректные данные для подключения к Яндекс.Маркет')
    }

    const ymClient = createYandexMarketClient(apiKey, clientId)

    // Тестируем подключение
    const isConnected = await ymClient.testConnection()
    if (!isConnected) {
      throw new Error('Не удалось подключиться к Яндекс.Маркет API. Проверьте API ключ и Campaign ID')
    }

    let syncedCount = 0
    let page = 1
    const pageSize = 100

    while (true) {
      try {
        // Получаем товары с Яндекс.Маркет
        const response = await ymClient.getOffers({
          page,
          pageSize
        })

        if (!response.offers.length) {
          break // Больше товаров нет
        }

        // Обрабатываем каждый товар
        for (const ymProduct of response.offers) {
          try {
            // Преобразуем в наш формат
            const productData = YandexMarketHelpers.transformProduct(ymProduct, account.id)

            // Проверяем, существует ли товар
            const { data: existingProduct } = await supabase
              .from('products')
              .select('id')
              .eq('marketplace_account_id', account.id)
              .eq('marketplace_product_id', productData.marketplace_product_id)
              .single()

            if (existingProduct) {
              // Обновляем существующий товар
              await supabase
                .from('products')
                .update({
                  name: productData.name,
                  price: productData.price,
                  stock_quantity: productData.stock,
                  available_quantity: productData.stock,
                  category_name: productData.category || '',
                  is_active: productData.status === 'active',
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingProduct.id)
            } else {
              // Создаем новый товар
              await supabase
                .from('products')
                .insert({
                  ...productData,
                  marketplace: account.marketplace,
                  currency: 'RUB',
                  available_quantity: productData.stock,
                  last_sync: new Date().toISOString()
                })
            }

            syncedCount++
          } catch (productError) {
            console.error(`Ошибка синхронизации товара Яндекс.Маркет:`, productError)
            // Продолжаем с другими товарами
          }
        }

        // Переходим к следующей странице
        page++

        // Проверяем, есть ли еще товары
        if (response.offers.length < pageSize) {
          break
        }

      } catch (pageError) {
        console.error(`Ошибка загрузки страницы Яндекс.Маркет ${page}:`, pageError)
        break
      }
    }

    return syncedCount
  }

  // Тестирование подключения к маркетплейсу
  async testConnection(accountId: string): Promise<{ success: boolean; message: string }> {
    try {
      const supabase = await this.getSupabase()
      
      const { data: account, error } = await supabase
        .from('marketplace_accounts')
        .select('*')
        .eq('id', accountId)
        .single()

      if (error || !account) {
        return { success: false, message: 'Аккаунт не найден' }
      }

      switch (account.marketplace) {
        case 'ozon':
          const { clientId, apiKey } = account.credentials
          if (!clientId || !apiKey) {
            return { success: false, message: 'Не указаны Client ID или API ключ для Ozon' }
          }

          const ozonClient = createOzonClient(clientId, apiKey)
          const isConnected = await ozonClient.testConnection()
          
          return { 
            success: isConnected, 
            message: isConnected ? 'Подключение к Ozon успешно' : 'Ошибка подключения к Ozon. Проверьте данные для входа' 
          }
          
        case 'wildberries':
          const { apiKey: wbApiKey } = account.credentials
          if (!wbApiKey) {
            return { success: false, message: 'Не указан API ключ для Wildberries' }
          }

          // Для Wildberries рекомендуем использовать Python парсер
          if (await wildberriesParserService.isParserAvailable()) {
            return { 
              success: true, 
              message: 'Python парсер Wildberries доступен' 
            }
          } else {
            // Fallback на API тестирование
            const wbClient = createWildberriesClient(wbApiKey)
            try {
              await wbClient.testConnection()
              return { 
                success: true, 
                message: 'Подключение к Wildberries API успешно (но рекомендуется использовать Python парсер)' 
              }
            } catch (error) {
              return { 
                success: false, 
                message: 'Ошибка подключения к Wildberries API. Рекомендуется использовать Python парсер' 
              }
            }
          }
          
        case 'yandex_market':
          const { apiKey: ymApiKey, clientId: ymClientId } = account.credentials
          if (!ymApiKey || !ymClientId) {
            return { success: false, message: 'Не указаны API ключ или Campaign ID для Яндекс.Маркет' }
          }

          const ymClient = createYandexMarketClient(ymApiKey, ymClientId)
          const ymIsConnected = await ymClient.testConnection()
          
          return { 
            success: ymIsConnected, 
            message: ymIsConnected ? 'Подключение к Яндекс.Маркет успешно' : 'Ошибка подключения к Яндекс.Маркет. Проверьте данные для входа' 
          }

        default:
          return { success: false, message: 'Тестирование для этого маркетплейса пока не поддерживается' }
      }

    } catch (error) {
      console.error('Connection test error:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Ошибка тестирования подключения' 
      }
    }
  }
}

export const marketplaceSyncService = new MarketplaceSyncService()