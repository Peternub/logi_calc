// API для управления товарами
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { handleAPIError, validateAuth } from '@/lib/api-utils';
import { z } from 'zod';

const productCreateSchema = z.object({
  marketplace_account_id: z.string().uuid(),
  marketplace_product_id: z.string().min(1),
  name: z.string().min(1).max(500),
  sku: z.string().min(1).max(100),
  barcode: z.string().optional(),
  category_id: z.string().min(1),
  category_name: z.string().min(1),
  brand: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url()).default([]),
  price: z.number().positive(),
  old_price: z.number().positive().optional(),
  stock_quantity: z.number().min(0),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional(),
  weight: z.number().positive().optional(),
});

const productUpdateSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  price: z.number().positive().optional(),
  old_price: z.number().positive().optional(),
  stock_quantity: z.number().min(0).optional(),
  is_active: z.boolean().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
});

const productQuerySchema = z.object({
  marketplace_account_id: z.string().uuid().optional(),
  marketplace: z.enum(['ozon', 'wildberries', 'yandex_market']).optional(),
  category_id: z.string().optional(),
  is_active: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sort: z.enum(['name', 'price', 'stock_quantity', 'created_at', 'updated_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// GET /api/products - получение списка товаров
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    validateAuth(user);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = productQuerySchema.parse({
      marketplace_account_id: searchParams.get('marketplace_account_id'),
      marketplace: searchParams.get('marketplace'),
      category_id: searchParams.get('category_id'),
      is_active: searchParams.get('is_active') === 'true',
      search: searchParams.get('search'),
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sort: searchParams.get('sort') || 'created_at',
      order: searchParams.get('order') || 'desc',
    });

    // Базовый запрос
    let queryBuilder = supabase
      .from('products')
      .select(`
        *,
        marketplace_accounts!inner(id, name, marketplace, user_id)
      `)
      .eq('marketplace_accounts.user_id', user.id);

    // Применяем фильтры
    if (query.marketplace_account_id) {
      queryBuilder = queryBuilder.eq('marketplace_account_id', query.marketplace_account_id);
    }

    if (query.marketplace) {
      queryBuilder = queryBuilder.eq('marketplace', query.marketplace);
    }

    if (query.category_id) {
      queryBuilder = queryBuilder.eq('category_id', query.category_id);
    }

    if (query.is_active !== undefined) {
      queryBuilder = queryBuilder.eq('is_active', query.is_active);
    }

    if (query.search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query.search}%,sku.ilike.%${query.search}%,brand.ilike.%${query.search}%`);
    }

    // Сортировка и пагинация
    queryBuilder = queryBuilder
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(query.offset, query.offset + query.limit - 1);

    const { data: products, error } = await queryBuilder;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    // Получаем общее количество
    const { count: totalCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('marketplace_accounts.user_id', user.id);

    return NextResponse.json({
      products,
      pagination: {
        total: totalCount || 0,
        limit: query.limit,
        offset: query.offset,
        has_more: (query.offset + query.limit) < (totalCount || 0),
      },
    });

  } catch (error) {
    return handleAPIError(error);
  }
}

// POST /api/products - создание нового товара
export async function POST(request: NextRequest) {
  try {
    const supabaseClient = await createServerSupabaseClient();
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    validateAuth(user);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const productData = productCreateSchema.parse(body);

    // Проверяем, что аккаунт маркетплейса принадлежит пользователю
    const { data: account, error: accountError } = await supabaseClient
      .from('marketplace_accounts')
      .select('id, marketplace')
      .eq('id', productData.marketplace_account_id)
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Marketplace account not found' }, { status: 404 });
    }

    // Создаем товар
    const newProduct = {
      ...productData,
      marketplace: account.marketplace,
      available_quantity: productData.stock_quantity,
      currency: 'RUB',
      last_sync: new Date().toISOString(),
    };

    const { data: product, error } = await supabaseClient
      .from('products')
      .insert(newProduct)
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      if (error.code === '23505') { // unique constraint violation
        return NextResponse.json({ error: 'Product already exists for this marketplace account' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }

    return NextResponse.json({ product }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return handleAPIError(error);
  }
}