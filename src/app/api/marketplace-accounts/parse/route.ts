// API endpoint для запуска парсинга Wildberries
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { handleAPIError, validateAuth } from '@/lib/api-utils'
import { wildberriesParserService } from '@/lib/wildberries-parser'
import { WbParseSchema, validateBody } from '@/lib/validations'

// POST /api/marketplace-accounts/parse - запуск парсинга Wildberries
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    validateAuth(user)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Валидация входных данных
    const validatedData = validateBody(WbParseSchema, body)
    const { account_id, url, category, limit, proxies_file, save_to_db = true } = validatedData

    // Если нужно сохранить в БД, проверяем account_id
    if (save_to_db && !account_id) {
      return NextResponse.json({ error: 'Account ID is required for saving to database' }, { status: 400 })
    }

    // Если указан account_id, проверяем, что аккаунт принадлежит пользователю
    if (account_id) {
      const { data: account, error: accountError } = await supabase
        .from('marketplace_accounts')
        .select('id, marketplace')
        .eq('id', account_id)
        .eq('user_id', user.id)
        .single()

      if (accountError || !account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 })
      }

      // Проверяем, что это аккаунт Wildberries
      if (account.marketplace !== 'wildberries') {
        return NextResponse.json({ error: 'This endpoint is only for Wildberries accounts' }, { status: 400 })
      }
    }

    // Проверяем доступность парсера
    if (!(await wildberriesParserService.isParserAvailable())) {
      return NextResponse.json({ 
        error: 'Wildberries parser is not available',
        message: 'Python скрипт парсера не найден. Убедитесь, что файл market_parser.py/wb_full_parser.py.txt существует.'
      }, { status: 503 })
    }

    try {
      // Запускаем парсинг
      const result = await wildberriesParserService.parseCategory({
        url: url,
        category: category,
        limit: limit,
        proxiesFile: proxies_file // Передаем файл с прокси если указан
      })

      // Если не нужно сохранять в БД, просто возвращаем результаты
      if (!save_to_db) {
        // Читаем данные из файла результатов
        const readResult = await wildberriesParserService.readParsedData(result.resultFile)
        
        return NextResponse.json({
          success: true,
          message: result.message,
          products: readResult.products
        })
      }

      // Если нужно сохранить в БД (account_id гарантированно существует здесь)
      const saveResult = await wildberriesParserService.saveParsedData(result.resultFile, account_id!)
      
      return NextResponse.json({
        success: true,
        message: saveResult.message,
        parsedCount: saveResult.parsedCount
      })
    } catch (parseError: any) {
      // Обрабатываем ошибки парсинга
      console.error('Ошибка парсинга Wildberries:', parseError)
      
      // Если ошибка связана с блокировкой Wildberries, возвращаем специальное сообщение
      if (parseError.message.includes('498') || parseError.message.includes('blocked') || parseError.message.includes('captcha')) {
        return NextResponse.json({ 
          success: false,
          error: 'Wildberries blocking detected',
          message: 'Wildberries заблокировал запрос как подозрительный. Это нормальное поведение маркетплейса. Попробуйте позже или используйте другой подход.'
        }, { status: 429 })
      }
      
      // Для других ошибок возвращаем стандартное сообщение
      return NextResponse.json({ 
        success: false,
        error: 'Parsing failed',
        message: `Ошибка парсинга: ${parseError.message}`
      }, { status: 500 })
    }

  } catch (error) {
    return handleAPIError(error)
  }
}