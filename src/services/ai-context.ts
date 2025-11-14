import { 
  AIContextData,
  UserContext,
  BusinessContext,
  ProductContext,
  SalesContext,
  AnalyticsContext,
  MarketplaceContext,
  SessionContext
} from '@/types/ai';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * AI Context Manager
 * Manages and provides context data for AI agent interactions
 */
export class AIContextManager {
  private supabase = createClientComponentClient();
  private contextCache: Map<string, { data: AIContextData; timestamp: Date }> = new Map();
  private cacheExpiration = 5 * 60 * 1000; // 5 minutes

  /**
   * Get complete context data for AI agent
   */
  async getContextData(userId: string, sessionId: string): Promise<AIContextData> {
    const cacheKey = `${userId}_${sessionId}`;
    const cached = this.contextCache.get(cacheKey);

    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp.getTime() < this.cacheExpiration) {
      return cached.data;
    }

    try {
      // Fetch all context data in parallel
      const [
        userContext,
        businessContext,
        productContext,
        salesContext,
        analyticsContext,
        marketplaceContext,
        sessionContext
      ] = await Promise.all([
        this.getUserContext(userId),
        this.getBusinessContext(userId),
        this.getProductContext(userId),
        this.getSalesContext(userId),
        this.getAnalyticsContext(userId),
        this.getMarketplaceContext(userId),
        this.getSessionContext(sessionId, userId)
      ]);

      const contextData: AIContextData = {
        user: userContext,
        business: businessContext,
        products: productContext,
        sales: salesContext,
        analytics: analyticsContext,
        marketplace: marketplaceContext,
        session: sessionContext
      };

      // Cache the context data
      this.contextCache.set(cacheKey, {
        data: contextData,
        timestamp: new Date()
      });

      return contextData;
    } catch (error) {
      console.error('Error fetching AI context data:', error);
      throw new Error('Failed to fetch context data for AI agent');
    }
  }

  /**
   * Get user context information
   */
  private async getUserContext(userId: string): Promise<UserContext> {
    const { data: user, error } = await this.supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        preferences,
        created_at
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user context:', error);
      throw error;
    }

    // Get user permissions (mock data for now)
    const permissions = await this.getUserPermissions(userId);

    return {
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      role: user.role || 'user',
      preferences: user.preferences || {
        language: 'ru',
        timezone: 'Europe/Moscow',
        currency: 'RUB',
        notification_settings: {
          email: true,
          telegram: false,
          push: true
        }
      },
      permissions
    };
  }

  /**
   * Get business context information
   */
  private async getBusinessContext(userId: string): Promise<BusinessContext> {
    // For now, return mock business context
    // In production, this would fetch from business_profiles table
    return {
      id: `business_${userId}`,
      name: 'LogiCalc Business',
      industry: 'E-commerce',
      size: 'medium',
      primary_markets: ['Russia', 'CIS'],
      business_model: 'B2C Marketplace',
      integration_status: {
        ozon: true,
        wildberries: true,
        yandex_market: false
      }
    };
  }

  /**
   * Get product context information
   */
  private async getProductContext(userId: string): Promise<ProductContext> {
    // Get product statistics
    const { data: productStats } = await this.supabase
      .from('products')
      .select('id, name, sku, status, category, price, inventory_count')
      .eq('user_id', userId);

    if (!productStats) {
      return this.getEmptyProductContext();
    }

    const totalProducts = productStats.length;
    const activeProducts = productStats.filter(p => p.status === 'active').length;

    // Group by categories
    const categoryMap = new Map<string, number>();
    productStats.forEach(product => {
      const category = product.category || 'Uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      product_count: count
    }));

    // Get top products (mock revenue data for now)
    const topProducts = productStats
      .slice(0, 10)
      .map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        revenue: Math.random() * 100000, // Mock data
        units_sold: Math.floor(Math.random() * 1000),
        profit_margin: 20 + Math.random() * 30
      }));

    // Inventory status
    const inventoryStatus = {
      in_stock: productStats.filter(p => p.inventory_count > 10).length,
      low_stock: productStats.filter(p => p.inventory_count > 0 && p.inventory_count <= 10).length,
      out_of_stock: productStats.filter(p => p.inventory_count === 0).length
    };

    // Pricing info
    const prices = productStats.map(p => p.price).filter(p => p > 0);
    const pricingInfo = {
      avg_price: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
      price_range: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0
      },
      recent_price_changes: Math.floor(Math.random() * 20) // Mock data
    };

    return {
      total_products: totalProducts,
      active_products: activeProducts,
      categories,
      top_products: topProducts,
      inventory_status: inventoryStatus,
      pricing_info: pricingInfo
    };
  }

  /**
   * Get sales context information
   */
  private async getSalesContext(userId: string): Promise<SalesContext> {
    // Get sales data (mock for now - in production would fetch from orders/sales tables)
    const currentPeriod = {
      revenue: 150000 + Math.random() * 50000,
      orders: 120 + Math.floor(Math.random() * 80),
      avg_order_value: 1250 + Math.random() * 500,
      conversion_rate: 2.5 + Math.random() * 2
    };

    const previousPeriod = {
      revenue: currentPeriod.revenue * (0.8 + Math.random() * 0.4),
      orders: Math.floor(currentPeriod.orders * (0.8 + Math.random() * 0.4)),
      avg_order_value: currentPeriod.avg_order_value * (0.9 + Math.random() * 0.2),
      conversion_rate: currentPeriod.conversion_rate * (0.8 + Math.random() * 0.4)
    };

    const trends = {
      revenue_growth: ((currentPeriod.revenue - previousPeriod.revenue) / previousPeriod.revenue) * 100,
      order_growth: ((currentPeriod.orders - previousPeriod.orders) / previousPeriod.orders) * 100,
      seasonal_patterns: [
        { period: 'Q1', multiplier: 0.8 },
        { period: 'Q2', multiplier: 0.9 },
        { period: 'Q3', multiplier: 1.1 },
        { period: 'Q4', multiplier: 1.4 }
      ]
    };

    return {
      current_period: currentPeriod,
      previous_period: previousPeriod,
      trends,
      top_performing: {
        products: [
          { id: '1', name: 'Product A', revenue: 25000 },
          { id: '2', name: 'Product B', revenue: 18000 },
          { id: '3', name: 'Product C', revenue: 15000 }
        ],
        categories: [
          { id: 'electronics', name: 'Electronics', revenue: 60000 },
          { id: 'clothing', name: 'Clothing', revenue: 45000 },
          { id: 'home', name: 'Home & Garden', revenue: 30000 }
        ],
        marketplaces: [
          { name: 'Ozon', revenue: 80000, share: 45 },
          { name: 'Wildberries', revenue: 70000, share: 40 },
          { name: 'Direct Sales', revenue: 25000, share: 15 }
        ]
      }
    };
  }

  /**
   * Get analytics context information
   */
  private async getAnalyticsContext(userId: string): Promise<AnalyticsContext> {
    return {
      dashboard_metrics: {
        total_revenue: 580000,
        total_orders: 2450,
        avg_profit_margin: 28.5,
        customer_acquisition_cost: 125,
        lifetime_value: 850
      },
      recent_insights: [
        {
          type: 'trend',
          title: 'Sales Growth Acceleration',
          description: 'Sales have increased 25% over the last 30 days',
          impact: 'high',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'opportunity',
          title: 'Price Optimization Potential',
          description: '15 products could benefit from price adjustments',
          impact: 'medium',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      ],
      active_campaigns: [
        {
          id: 'camp_1',
          name: 'Summer Sale Campaign',
          type: 'promotional',
          status: 'active',
          performance: {
            impressions: 25000,
            clicks: 1200,
            conversions: 85,
            revenue: 12500
          }
        }
      ]
    };
  }

  /**
   * Get marketplace context information
   */
  private async getMarketplaceContext(userId: string): Promise<MarketplaceContext> {
    return {
      integrations: [
        {
          marketplace: 'ozon',
          status: 'active',
          last_sync: new Date(Date.now() - 2 * 60 * 60 * 1000),
          products_count: 150,
          revenue_share: 45
        },
        {
          marketplace: 'wildberries',
          status: 'active',
          last_sync: new Date(Date.now() - 1 * 60 * 60 * 1000),
          products_count: 120,
          revenue_share: 40
        },
        {
          marketplace: 'yandex_market',
          status: 'inactive',
          last_sync: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          products_count: 0,
          revenue_share: 0
        }
      ],
      sync_status: {
        in_progress: false,
        last_successful_sync: new Date(Date.now() - 1 * 60 * 60 * 1000),
        errors: []
      },
      competitor_data: [
        {
          competitor_name: 'Competitor A',
          products_monitored: 50,
          avg_price_difference: -5.2,
          market_share_estimate: 15.5
        },
        {
          competitor_name: 'Competitor B',
          products_monitored: 30,
          avg_price_difference: 8.1,
          market_share_estimate: 12.3
        }
      ]
    };
  }

  /**
   * Get session context information
   */
  private async getSessionContext(sessionId: string, userId: string): Promise<SessionContext> {
    return {
      id: sessionId,
      started_at: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      last_activity: new Date(),
      messages_count: 0,
      actions_performed: [],
      current_page: '/dashboard',
      user_intent: null
    };
  }

  /**
   * Get user permissions (mock implementation)
   */
  private async getUserPermissions(userId: string): Promise<string[]> {
    // In production, this would fetch from user_permissions table
    return [
      'read_products',
      'write_products',
      'read_sales',
      'read_analytics',
      'use_ai_agent',
      'export_data'
    ];
  }

  /**
   * Update session context
   */
  async updateSessionContext(
    sessionId: string, 
    userId: string, 
    updates: Partial<SessionContext>
  ): Promise<void> {
    const cacheKey = `${userId}_${sessionId}`;
    const cached = this.contextCache.get(cacheKey);

    if (cached) {
      cached.data.session = { ...cached.data.session, ...updates };
      cached.timestamp = new Date();
    }
  }

  /**
   * Clear context cache
   */
  clearCache(userId?: string, sessionId?: string): void {
    if (userId && sessionId) {
      this.contextCache.delete(`${userId}_${sessionId}`);
    } else {
      this.contextCache.clear();
    }
  }

  /**
   * Get empty product context for cases where no products exist
   */
  private getEmptyProductContext(): ProductContext {
    return {
      total_products: 0,
      active_products: 0,
      categories: [],
      top_products: [],
      inventory_status: {
        in_stock: 0,
        low_stock: 0,
        out_of_stock: 0
      },
      pricing_info: {
        avg_price: 0,
        price_range: { min: 0, max: 0 },
        recent_price_changes: 0
      }
    };
  }

  /**
   * Get context summary for AI prompt
   */
  getContextSummary(context: AIContextData): string {
    return `
User: ${context.user.name} (${context.user.role})
Business: ${context.business.name} - ${context.business.industry}
Products: ${context.products.total_products} total, ${context.products.active_products} active
Current Revenue: ${context.sales.current_period.revenue.toLocaleString('ru-RU')} RUB
Growth: ${context.sales.trends.revenue_growth.toFixed(1)}%
Marketplaces: ${context.marketplace.integrations.filter(i => i.status === 'active').map(i => i.marketplace).join(', ')}
Session: ${context.session.messages_count} messages, current page: ${context.session.current_page}
    `.trim();
  }
}

// Export singleton instance
export const aiContextManager = new AIContextManager();