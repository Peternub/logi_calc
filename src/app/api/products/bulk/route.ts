// API для массовых операций с товарами
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { handleAPIError, validateAuth } from '@/lib/api-utils';
import { z } from 'zod';

const bulkOperationSchema = z.object({
  product_ids: z.array(z.string().uuid()).min(1, 'Необходимо выбрать хотя бы один товар'),
  operation: z.enum(['price_update', 'status_update', 'stock_update', 'delete']),
  data: z.object({
    // Для обновления цен
    price_type: z.enum(['increase', 'decrease']).optional(),
    price_percentage: z.number().min(0).max(100).optional(),
    price_absolute: z.number().positive().optional(),
    
    // Для обновления статуса
    is_active: z.boolean().optional(),
    
    // Для обновления остатков
    stock_adjustment: z.number().optional(),
    stock_absolute: z.number().min(0).optional(),
  }).optional(),
});

// POST /api/products/bulk - массовые операции с товарами
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    validateAuth(user);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { product_ids, operation, data } = bulkOperationSchema.parse(body);

    // Проверяем, что все товары принадлежат пользователю
    const { data: userProducts, error: checkError } = await supabase
      .from('products')
      .select(`
        id,
        marketplace_accounts!inner(user_id)
      `)
      .in('id', product_ids)
      .eq('marketplace_accounts.user_id', user.id);

    if (checkError || !userProducts || userProducts.length !== product_ids.length) {
      return NextResponse.json({ 
        error: 'Некоторые товары не найдены или не принадлежат пользователю' 
      }, { status: 404 });
    }

    let updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Подготавливаем данные для обновления в зависимости от операции
    switch (operation) {
      case 'price_update':
        if (data?.price_percentage && data?.price_type) {
          // Для процентного изменения цен нужно обновлять каждый товар отдельно
          const results = [];
          
          for (const productId of product_ids) {
            // Получаем текущую цену товара
            const { data: currentProduct } = await supabase
              .from('products')
              .select('price')
              .eq('id', productId)
              .single();

            if (currentProduct) {
              const currentPrice = currentProduct.price;
              const multiplier = data.price_type === 'increase' 
                ? (1 + data.price_percentage / 100)
                : (1 - data.price_percentage / 100);
              
              const newPrice = Math.round(currentPrice * multiplier * 100) / 100;

              const { error: updateError } = await supabase
                .from('products')
                .update({
                  price: newPrice,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', productId);

              results.push({ productId, success: !updateError, newPrice });
            }
          }

          return NextResponse.json({
            message: 'Цены обновлены',
            results,
            updated_count: results.filter(r => r.success).length,
          });
        } else if (data?.price_absolute) {
          updateData.price = data.price_absolute;
        }
        break;

      case 'status_update':
        if (data?.is_active !== undefined) {
          updateData.is_active = data.is_active;
        }
        break;

      case 'stock_update':
        if (data?.stock_absolute !== undefined) {
          updateData.stock_quantity = data.stock_absolute;
          updateData.available_quantity = data.stock_absolute;
        } else if (data?.stock_adjustment !== undefined) {
          // Для относительного изменения остатков нужно обновлять каждый товар отдельно
          const results = [];
          
          for (const productId of product_ids) {
            const { data: currentProduct } = await supabase
              .from('products')
              .select('stock_quantity, available_quantity')
              .eq('id', productId)
              .single();

            if (currentProduct) {
              const newStock = Math.max(0, currentProduct.stock_quantity + data.stock_adjustment);
              const newAvailable = Math.max(0, currentProduct.available_quantity + data.stock_adjustment);

              const { error: updateError } = await supabase
                .from('products')
                .update({
                  stock_quantity: newStock,
                  available_quantity: newAvailable,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', productId);

              results.push({ 
                productId, 
                success: !updateError, 
                newStock, 
                newAvailable 
              });
            }
          }

          return NextResponse.json({
            message: 'Остатки обновлены',
            results,
            updated_count: results.filter(r => r.success).length,
          });
        }
        break;

      case 'delete':
        // Мягкое удаление - помечаем как архивные
        updateData.is_archived = true;
        updateData.is_active = false;
        break;

      default:
        return NextResponse.json({ error: 'Неизвестная операция' }, { status: 400 });
    }

    // Выполняем массовое обновление для простых операций
    const { data: updatedProducts, error } = await supabase
      .from('products')
      .update(updateData)
      .in('id', product_ids)
      .select();

    if (error) {
      console.error('Error in bulk operation:', error);
      return NextResponse.json({ error: 'Ошибка выполнения операции' }, { status: 500 });
    }

    const operationMessages = {
      price_update: 'Цены обновлены',
      status_update: 'Статусы обновлены',
      stock_update: 'Остатки обновлены',
      delete: 'Товары помечены как удаленные',
    };

    return NextResponse.json({
      message: operationMessages[operation],
      updated_count: updatedProducts?.length || 0,
      products: updatedProducts,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Неверные данные', 
        details: error.issues 
      }, { status: 400 });
    }
    return handleAPIError(error);
  }
}