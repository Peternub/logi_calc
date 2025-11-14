// Утилиты для преобразования и валидации данных маркетплейсов

import { z } from 'zod';
import { MarketplaceType, Product, Sale, Order } from '@/types/marketplace';

// Схемы валидации
export const productSchema = z.object({
  marketplace_product_id: z.string().min(1),
  name: z.string().min(1).max(500),
  sku: z.string().min(1).max(100),
  barcode: z.string().optional(),
  category_id: z.string().min(1),
  category_name: z.string().min(1),
  brand: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url()),
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

export const saleSchema = z.object({
  marketplace_order_id: z.string().min(1),
  product_id: z.string().min(1),
  product_name: z.string().min(1),
  product_sku: z.string().min(1),
  quantity: z.number().positive(),
  price_per_item: z.number().positive(),
  total_price: z.number().positive(),
  commission: z.number().min(0),
  profit: z.number(),
  order_date: z.date(),
  delivery_date: z.date().optional(),
  status: z.enum(['new', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned']),
});

// Преобразователи данных для разных маркетплейсов
export class DataTransformer {
  
  static transformOzonProduct(data: any): Partial<Product> {
    return {
      marketplace_product_id: data.offer_id || data.product_id,
      name: data.name,
      sku: data.offer_id,
      barcode: data.barcode,
      category_id: data.category_id?.toString(),
      category_name: data.category_name,
      brand: data.brand,
      description: data.description,
      images: data.images?.map((img: any) => img.file_name || img.url) || [],
      price: data.price ? parseFloat(data.price) : 0,
      old_price: data.old_price ? parseFloat(data.old_price) : undefined,
      stock_quantity: data.stocks?.present || 0,
      reserved_quantity: data.stocks?.reserved || 0,
      available_quantity: (data.stocks?.present || 0) - (data.stocks?.reserved || 0),
      is_active: data.visible === true,
      rating: data.rating,
      reviews_count: data.reviews_count,
      commission_percent: data.fbs_sku ? data.fbs_sku.commission_percent : undefined,
      dimensions: data.dimensions ? {
        length: data.dimensions.length,
        width: data.dimensions.width,
        height: data.dimensions.height,
      } : undefined,
      weight: data.weight ? parseFloat(data.weight) : undefined,
      currency: 'RUB',
      last_sync: new Date(),
    };
  }

  static transformWildberriesProduct(data: any): Partial<Product> {
    return {
      marketplace_product_id: data.nmId?.toString() || data.vendorCode,
      name: data.subject || data.name,
      sku: data.vendorCode,
      barcode: data.barcode,
      category_id: data.subjectId?.toString(),
      category_name: data.subject,
      brand: data.brand,
      description: data.description,
      images: data.photos?.map((photo: any) => photo.big || photo.c516x688) || [],
      price: data.salePriceU ? data.salePriceU / 100 : 0,
      old_price: data.priceU ? data.priceU / 100 : undefined,
      stock_quantity: data.quantity || 0,
      available_quantity: data.quantity || 0,
      is_active: data.isVisible === true,
      rating: data.rating,
      reviews_count: data.feedbacks,
      dimensions: data.dimensions ? {
        length: data.dimensions.length,
        width: data.dimensions.width,
        height: data.dimensions.height,
      } : undefined,
      weight: data.weight,
      currency: 'RUB',
      last_sync: new Date(),
    };
  }

  static transformYandexProduct(data: any): Partial<Product> {
    return {
      marketplace_product_id: data.offerId,
      name: data.name,
      sku: data.offerId,
      barcode: data.barcodes?.[0],
      category_id: data.categoryId?.toString(),
      category_name: data.category,
      brand: data.vendor,
      description: data.description,
      images: data.pictures?.map((pic: any) => pic.url) || [],
      price: data.price ? parseFloat(data.price) : 0,
      old_price: data.oldPrice ? parseFloat(data.oldPrice) : undefined,
      stock_quantity: data.stock?.count || 0,
      available_quantity: data.stock?.count || 0,
      is_active: data.available === true,
      dimensions: data.dimensions ? {
        length: data.dimensions.length,
        width: data.dimensions.width,
        height: data.dimensions.height,
      } : undefined,
      weight: data.weight,
      currency: 'RUB',
      last_sync: new Date(),
    };
  }

  static transformOzonSale(data: any): Partial<Sale> {
    return {
      marketplace_order_id: data.posting_number,
      product_name: data.products?.[0]?.name,
      product_sku: data.products?.[0]?.offer_id,
      quantity: data.products?.[0]?.quantity || 1,
      price_per_item: parseFloat(data.products?.[0]?.price || '0'),
      total_price: parseFloat(data.total_price || '0'),
      commission: parseFloat(data.commission || '0'),
      profit: parseFloat(data.total_price || '0') - parseFloat(data.commission || '0'),
      order_date: new Date(data.created_at),
      delivery_date: data.delivered_at ? new Date(data.delivered_at) : undefined,
      status: this.mapOzonStatus(data.status),
      customer_region: data.delivery?.region,
      delivery_service: data.delivery?.provider_name,
      currency: 'RUB',
    };
  }

  static transformWildberriesSale(data: any): Partial<Sale> {
    return {
      marketplace_order_id: data.srid,
      product_name: data.subject,
      product_sku: data.supplierArticle,
      quantity: 1,
      price_per_item: data.totalPrice || 0,
      total_price: data.totalPrice || 0,
      commission: (data.totalPrice || 0) * (data.commissionPercent || 0) / 100,
      profit: (data.totalPrice || 0) - ((data.totalPrice || 0) * (data.commissionPercent || 0) / 100),
      order_date: new Date(data.date),
      delivery_date: data.lastChangeDate ? new Date(data.lastChangeDate) : undefined,
      status: this.mapWildberriesStatus(data.supplierOperName),
      customer_region: data.regionName,
      currency: 'RUB',
    };
  }

  static transformYandexSale(data: any): Partial<Sale> {
    const item = data.items?.[0];
    return {
      marketplace_order_id: data.id?.toString(),
      product_name: item?.offerName,
      product_sku: item?.offerId,
      quantity: item?.count || 1,
      price_per_item: parseFloat(item?.price || '0'),
      total_price: parseFloat(data.total || '0'),
      commission: parseFloat(data.commission || '0'),
      profit: parseFloat(data.total || '0') - parseFloat(data.commission || '0'),
      order_date: new Date(data.creationDate),
      delivery_date: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
      status: this.mapYandexStatus(data.status),
      currency: 'RUB',
    };
  }

  // Вспомогательные методы для маппинга статусов
  private static mapOzonStatus(status: string): Sale['status'] {
    const statusMap: Record<string, Sale['status']> = {
      'awaiting_packaging': 'new',
      'awaiting_deliver': 'confirmed',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
      'returned': 'returned',
    };
    return statusMap[status] || 'new';
  }

  private static mapWildberriesStatus(status: string): Sale['status'] {
    const statusMap: Record<string, Sale['status']> = {
      'Продажа': 'delivered',
      'Возврат': 'returned',
      'Отмена': 'cancelled',
    };
    return statusMap[status] || 'new';
  }

  private static mapYandexStatus(status: string): Sale['status'] {
    const statusMap: Record<string, Sale['status']> = {
      'PROCESSING': 'new',
      'DELIVERY': 'shipped',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled',
      'RETURNED': 'returned',
    };
    return statusMap[status] || 'new';
  }
}

// Утилиты для работы с данными
export class DataUtils {
  
  static generateSKU(marketplace: MarketplaceType, productId: string): string {
    const prefix = {
      'ozon': 'OZ',
      'wildberries': 'WB',
      'yandex_market': 'YM',
    };
    return `${prefix[marketplace]}-${productId}`;
  }

  static calculateProfit(price: number, commission: number, costs: number = 0): number {
    return price - commission - costs;
  }

  static calculateMargin(price: number, profit: number): number {
    return price > 0 ? (profit / price) * 100 : 0;
  }

  static calculateCommissionPercent(price: number, commission: number): number {
    return price > 0 ? (commission / price) * 100 : 0;
  }

  static formatCurrency(amount: number, currency: string = 'RUB'): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  static formatNumber(number: number, decimals: number = 0): string {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);
  }

  static formatPercent(number: number, decimals: number = 1): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number / 100);
  }

  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  static sumBy<T>(array: T[], key: keyof T): number {
    return array.reduce((sum, item) => sum + Number(item[key] || 0), 0);
  }

  static averageBy<T>(array: T[], key: keyof T): number {
    if (array.length === 0) return 0;
    return this.sumBy(array, key) / array.length;
  }

  static getDateRange(period: 'today' | 'week' | 'month' | 'quarter' | 'year'): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date();
    const end = new Date(now);

    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }

    return { start, end };
  }

  static isValidBarcode(barcode: string): boolean {
    // Проверка EAN-13 и EAN-8
    if (!/^\d{8}$|^\d{13}$/.test(barcode)) return false;
    
    const digits = barcode.split('').map(Number);
    const checkDigit = digits.pop()!;
    
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }
    
    const calculatedCheckDigit = (10 - (sum % 10)) % 10;
    return calculatedCheckDigit === checkDigit;
  }

  static sanitizeProductName(name: string): string {
    return name
      .replace(/[^\w\s\-\(\)\[\]]/g, '') // Удаляем специальные символы
      .replace(/\s+/g, ' ') // Убираем множественные пробелы
      .trim()
      .substring(0, 500); // Ограничиваем длину
  }

  static generateProductSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s\-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}