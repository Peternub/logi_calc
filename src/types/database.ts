// Типы для Supabase Database
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      marketplace_accounts: {
        Row: {
          id: string
          user_id: string
          marketplace: 'ozon' | 'wildberries' | 'yandex_market'
          account_name: string
          api_key: string
          client_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          marketplace: 'ozon' | 'wildberries' | 'yandex_market'
          account_name: string
          api_key: string
          client_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          marketplace?: 'ozon' | 'wildberries' | 'yandex_market'
          account_name?: string
          api_key?: string
          client_id?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          marketplace_account_id: string
          marketplace_product_id: string
          name: string
          sku: string | null
          price: number
          stock: number
          category: string | null
          status: 'active' | 'inactive' | 'deleted'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          marketplace_account_id: string
          marketplace_product_id: string
          name: string
          sku?: string | null
          price: number
          stock: number
          category?: string | null
          status?: 'active' | 'inactive' | 'deleted'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          marketplace_account_id?: string
          marketplace_product_id?: string
          name?: string
          sku?: string | null
          price?: number
          stock?: number
          category?: string | null
          status?: 'active' | 'inactive' | 'deleted'
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          user_id: string
          product_id: string
          marketplace_account_id: string
          order_id: string
          quantity: number
          price: number
          commission: number
          net_profit: number
          sale_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          marketplace_account_id: string
          order_id: string
          quantity: number
          price: number
          commission: number
          net_profit: number
          sale_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          marketplace_account_id?: string
          order_id?: string
          quantity?: number
          price?: number
          commission?: number
          net_profit?: number
          sale_date?: string
        }
      }
      analytics: {
        Row: {
          id: string
          user_id: string
          metric_type: 'sales' | 'profit' | 'stock' | 'conversion'
          metric_value: number
          period_start: string
          period_end: string
          metadata: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          metric_type: 'sales' | 'profit' | 'stock' | 'conversion'
          metric_value: number
          period_start: string
          period_end: string
          metadata?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          metric_type?: 'sales' | 'profit' | 'stock' | 'conversion'
          metric_value?: number
          period_start?: string
          period_end?: string
          metadata?: Record<string, any> | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      marketplace_type: 'ozon' | 'wildberries' | 'yandex_market'
      product_status: 'active' | 'inactive' | 'deleted'
      metric_type: 'sales' | 'profit' | 'stock' | 'conversion'
    }
  }
}

// Хелперы для типов
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]