// Базовые типы для работы с маркетплейсами

export type MarketplaceType = 'ozon' | 'wildberries' | 'yandex_market';

export interface MarketplaceAccount {
  id: string;
  user_id: string;
  marketplace: MarketplaceType;
  name: string;
  api_key: string;
  client_id?: string;
  campaign_id?: string;
  is_active: boolean;
  last_sync: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Модели данных для товаров
export interface Product {
  id: string;
  marketplace_account_id: string;
  marketplace_product_id: string;
  marketplace: MarketplaceType;
  name: string;
  sku: string;
  barcode?: string;
  category_id: string;
  category_name: string;
  brand?: string;
  description?: string;
  images: string[];
  price: number;
  old_price?: number;
  discount_price?: number;
  currency: string;
  stock_quantity: number;
  reserved_quantity?: number;
  available_quantity: number;
  is_active: boolean;
  is_archived: boolean;
  rating?: number;
  reviews_count?: number;
  commission_percent?: number;
  dimensions?: ProductDimensions;
  weight?: number;
  created_at: Date;
  updated_at: Date;
  last_sync: Date;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface ProductPriceHistory {
  id: string;
  product_id: string;
  price: number;
  old_price?: number;
  discount_price?: number;
  commission_percent?: number;
  date: Date;
  created_at: Date;
}

export interface ProductStockHistory {
  id: string;
  product_id: string;
  stock_quantity: number;
  reserved_quantity?: number;
  available_quantity: number;
  date: Date;
  created_at: Date;
}

// Модели данных для продаж
export interface Sale {
  id: string;
  marketplace_account_id: string;
  marketplace_order_id: string;
  marketplace: MarketplaceType;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  price_per_item: number;
  total_price: number;
  commission: number;
  profit: number;
  currency: string;
  order_date: Date;
  delivery_date?: Date;
  status: SaleStatus;
  customer_region?: string;
  delivery_service?: string;
  created_at: Date;
  updated_at: Date;
}

export type SaleStatus = 
  | 'new'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface Order {
  id: string;
  marketplace_account_id: string;
  marketplace_order_id: string;
  marketplace: MarketplaceType;
  total_amount: number;
  commission: number;
  profit: number;
  currency: string;
  status: OrderStatus;
  items: OrderItem[];
  customer_info?: CustomerInfo;
  delivery_info?: DeliveryInfo;
  order_date: Date;
  delivery_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export type OrderStatus = 
  | 'awaiting_packaging'
  | 'packaged'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  price_per_item: number;
  total_price: number;
  commission: number;
}

export interface CustomerInfo {
  name?: string;
  region: string;
  city?: string;
}

export interface DeliveryInfo {
  service: string;
  address?: string;
  tracking_number?: string;
}

// Модели данных для аналитики
export interface DailySalesMetrics {
  id: string;
  marketplace_account_id: string;
  marketplace: MarketplaceType;
  date: Date;
  total_revenue: number;
  total_orders: number;
  total_items_sold: number;
  total_commission: number;
  total_profit: number;
  average_order_value: number;
  conversion_rate?: number;
  return_rate?: number;
  currency: string;
  created_at: Date;
}

export interface ProductMetrics {
  id: string;
  product_id: string;
  date: Date;
  views: number;
  clicks: number;
  orders: number;
  revenue: number;
  profit: number;
  conversion_rate: number;
  click_through_rate: number;
  position_avg?: number;
  created_at: Date;
}

export interface CategoryMetrics {
  id: string;
  marketplace_account_id: string;
  marketplace: MarketplaceType;
  category_id: string;
  category_name: string;
  date: Date;
  total_revenue: number;
  total_orders: number;
  total_products: number;
  average_price: number;
  market_share?: number;
  created_at: Date;
}

export interface CompetitorData {
  id: string;
  product_id: string;
  competitor_name: string;
  competitor_price: number;
  competitor_rating?: number;
  competitor_reviews_count?: number;
  position: number;
  date: Date;
  created_at: Date;
}

// Типы для API запросов
export interface ProductCreateRequest {
  marketplace_account_id: string;
  marketplace_product_id: string;
  name: string;
  sku: string;
  barcode?: string;
  category_id: string;
  category_name: string;
  brand?: string;
  description?: string;
  images: string[];
  price: number;
  old_price?: number;
  stock_quantity: number;
  dimensions?: ProductDimensions;
  weight?: number;
}

export interface ProductUpdateRequest {
  name?: string;
  price?: number;
  old_price?: number;
  stock_quantity?: number;
  is_active?: boolean;
  description?: string;
  images?: string[];
}

export interface SalesAnalyticsRequest {
  marketplace_account_id: string;
  start_date: Date;
  end_date: Date;
  marketplace?: MarketplaceType;
  product_ids?: string[];
  group_by?: 'day' | 'week' | 'month';
}

export interface SalesAnalyticsResponse {
  period: string;
  revenue: number;
  orders: number;
  items_sold: number;
  profit: number;
  commission: number;
  average_order_value: number;
  conversion_rate?: number;
}