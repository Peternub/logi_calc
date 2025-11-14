// API для управления конкретным товаром по ID
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { handleAPIError, validateAuth } from '@/lib/api-utils';
import { z } from 'zod';

const productUpdateSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  price: z.number().positive().optional(),
  old_price: z.number().positive().optional(),
  stock_quantity: z.number().min(0).optional(),
  is_active: z.boolean().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
});

// GET /api/products/[id] - получение конкретного товара
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    validateAuth(user);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        marketplace_accounts!inner(id, name, marketplace, user_id)
      `)
      .eq('id', params.id)
      .eq('marketplace_accounts.user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      if (error.code === 'PGRST116') { // No rows returned
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }

    return NextResponse.json({ product });

  } catch (error) {
    return handleAPIError(error);
  }
}

// PUT /api/products/[id] - обновление товара
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    validateAuth(user);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updateData = productUpdateSchema.parse(body);

    // Проверяем, что товар принадлежит пользователю
    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select(`
        id,
        marketplace_accounts!inner(user_id)
      `)
      .eq('id', params.id)
      .eq('marketplace_accounts.user_id', user.id)
      .single();

    if (checkError || !existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Обновляем товар
    const { data: product, error } = await supabase
      .from('products')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    return NextResponse.json({ product });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return handleAPIError(error);
  }
}

// DELETE /api/products/[id] - удаление товара
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    validateAuth(user);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверяем, что товар принадлежит пользователю
    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select(`
        id,
        marketplace_accounts!inner(user_id)
      `)
      .eq('id', params.id)
      .eq('marketplace_accounts.user_id', user.id)
      .single();

    if (checkError || !existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Мягкое удаление - помечаем как архивный
    const { error } = await supabase
      .from('products')
      .update({
        is_archived: true,
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) {
      console.error('Error archiving product:', error);
      return NextResponse.json({ error: 'Failed to archive product' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product archived successfully' });

  } catch (error) {
    return handleAPIError(error);
  }
}