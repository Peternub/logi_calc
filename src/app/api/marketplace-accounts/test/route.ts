import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { handleAPIError, validateAuth } from '@/lib/api-utils'
import { marketplaceSyncService } from '@/lib/marketplace-sync'

// POST /api/marketplace-accounts/test - тестирование подключения
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    validateAuth(user)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { account_id } = await request.json()

    if (!account_id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    // Проверяем, что аккаунт принадлежит пользователю
    const { data: account, error: accountError } = await supabase
      .from('marketplace_accounts')
      .select('id')
      .eq('id', account_id)
      .eq('user_id', user.id)
      .single()

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Тестируем подключение
    const result = await marketplaceSyncService.testConnection(account_id)

    return NextResponse.json(result)

  } catch (error) {
    return handleAPIError(error)
  }
}

// PUT /api/marketplace-accounts/sync - синхронизация товаров
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    validateAuth(user)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { account_id } = await request.json()

    if (!account_id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    // Проверяем, что аккаунт принадлежит пользователю
    const { data: account, error: accountError } = await supabase
      .from('marketplace_accounts')
      .select('id')
      .eq('id', account_id)
      .eq('user_id', user.id)
      .single()

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Запускаем синхронизацию
    const result = await marketplaceSyncService.syncProducts(account_id)

    return NextResponse.json(result)

  } catch (error) {
    return handleAPIError(error)
  }
}