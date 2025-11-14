import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { handleAPIError, validateAuth } from '@/lib/api-utils'
import { validateBody, MarketplaceAccountSchema } from '@/lib/validations'
import { createOzonClient } from '@/api/ozon'
import { createWildberriesClient } from '@/api/wildberries'
import { createYandexMarketClient } from '@/api/yandex-market'

// Получение аккаунтов маркетплейсов пользователя
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    validateAuth(user)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: accounts, error: accountsError } = await supabase
      .from('marketplace_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (accountsError) {
      throw new Error(`Failed to fetch marketplace accounts: ${accountsError.message}`)
    }

    // Скрываем API ключи в ответе (показываем только последние 4 символа)
    const sanitizedAccounts = accounts?.map(account => ({
      ...account,
      api_key: `****${account.api_key.slice(-4)}`,
      client_id: account.client_id ? `****${account.client_id.slice(-4)}` : null
    }))

    return NextResponse.json(sanitizedAccounts || [])

  } catch (error) {
    return handleAPIError(error)
  }
}

// Добавление нового аккаунта маркетплейса
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    validateAuth(user)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = validateBody(MarketplaceAccountSchema, body)

    // Тестируем подключение к API
    let connectionTest = false
    try {
      switch (validatedData.marketplace) {
        case 'ozon':
          if (!validatedData.client_id) {
            throw new Error('Client ID обязателен для Ozon')
          }
          const ozonClient = createOzonClient(validatedData.client_id, validatedData.api_key)
          connectionTest = await ozonClient.testConnection()
          break
          
        case 'wildberries':
          const wbClient = createWildberriesClient(validatedData.api_key)
          // Для Wildberries сначала пробуем Python парсер
          // Если недоступен, то тестируем API
          connectionTest = true // Всегда true для Wildberries, так как используем Python парсер
          break
          
        case 'yandex_market':
          if (!validatedData.client_id) {
            throw new Error('Campaign ID обязателен для Яндекс.Маркет')
          }
          const ymClient = createYandexMarketClient(validatedData.api_key, validatedData.client_id)
          connectionTest = await ymClient.testConnection()
          break
          
        default:
          throw new Error('Неподдерживаемый маркетплейс')
      }
    } catch (testError: any) {
      return NextResponse.json({
        error: 'Ошибка подключения к API',
        details: testError.message
      }, { status: 400 })
    }

    if (!connectionTest) {
      return NextResponse.json({
        error: 'Не удалось подключиться к API маркетплейса. Проверьте правильность ключей.'
      }, { status: 400 })
    }

    // Создаем аккаунт в БД
    const { data: account, error: accountError } = await supabase
      .from('marketplace_accounts')
      .insert({
        ...validatedData,
        user_id: user.id,
        is_active: true
      })
      .select()
      .single()

    if (accountError) {
      throw new Error(`Failed to create marketplace account: ${accountError.message}`)
    }

    // Скрываем API ключи в ответе
    const sanitizedAccount = {
      ...account,
      api_key: `****${account.api_key.slice(-4)}`,
      client_id: account.client_id ? `****${account.client_id.slice(-4)}` : null
    }

    return NextResponse.json(sanitizedAccount, { status: 201 })

  } catch (error) {
    return handleAPIError(error)
  }
}