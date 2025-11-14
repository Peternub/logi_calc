// Types and interfaces for AI agent integration

/**
 * Message types for AI chat system
 */
export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageType = 
  | 'text' 
  | 'command' 
  | 'analysis_request' 
  | 'data_query' 
  | 'action_request'
  | 'error'
  | 'system_notification';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  timestamp: Date;
  metadata?: {
    tokens_used?: number;
    response_time?: number;
    confidence_score?: number;
    sources?: string[];
    attachments?: MessageAttachment[];
  };
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'document' | 'chart' | 'data_export';
  name: string;
  url: string;
  size?: number;
  mime_type?: string;
}

/**
 * AI Agent Context Data Structures
 */
export interface AIContextData {
  user: UserContext;
  business: BusinessContext;
  products: ProductContext;
  sales: SalesContext;
  analytics: AnalyticsContext;
  marketplace: MarketplaceContext;
  session: SessionContext;
}

export interface UserContext {
  id: string;
  name: string;
  email: string;
  role: string;
  preferences: {
    language: string;
    timezone: string;
    currency: string;
    notification_settings: Record<string, boolean>;
  };
  permissions: string[];
}

export interface BusinessContext {
  id: string;
  name: string;
  industry: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  primary_markets: string[];
  business_model: string;
  integration_status: {
    ozon: boolean;
    wildberries: boolean;
    yandex_market: boolean;
  };
}

export interface ProductContext {
  total_products: number;
  active_products: number;
  categories: Array<{
    id: string;
    name: string;
    product_count: number;
  }>;
  top_products: Array<{
    id: string;
    name: string;
    sku: string;
    revenue: number;
    units_sold: number;
    profit_margin: number;
  }>;
  inventory_status: {
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
  };
  pricing_info: {
    avg_price: number;
    price_range: { min: number; max: number; };
    recent_price_changes: number;
  };
}

export interface SalesContext {
  current_period: {
    revenue: number;
    orders: number;
    avg_order_value: number;
    conversion_rate: number;
  };
  previous_period: {
    revenue: number;
    orders: number;
    avg_order_value: number;
    conversion_rate: number;
  };
  trends: {
    revenue_growth: number;
    order_growth: number;
    seasonal_patterns: Array<{
      period: string;
      multiplier: number;
    }>;
  };
  top_performing: {
    products: Array<{ id: string; name: string; revenue: number; }>;
    categories: Array<{ id: string; name: string; revenue: number; }>;
    marketplaces: Array<{ name: string; revenue: number; share: number; }>;
  };
}

export interface AnalyticsContext {
  dashboard_metrics: {
    total_revenue: number;
    total_orders: number;
    avg_profit_margin: number;
    customer_acquisition_cost: number;
    lifetime_value: number;
  };
  recent_insights: Array<{
    type: 'trend' | 'anomaly' | 'opportunity' | 'warning';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    created_at: Date;
  }>;
  active_campaigns: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    performance: Record<string, number>;
  }>;
}

export interface MarketplaceContext {
  integrations: Array<{
    marketplace: 'ozon' | 'wildberries' | 'yandex_market';
    status: 'active' | 'inactive' | 'error';
    last_sync: Date;
    products_count: number;
    revenue_share: number;
  }>;
  sync_status: {
    in_progress: boolean;
    last_successful_sync: Date;
    errors: Array<{
      marketplace: string;
      error: string;
      timestamp: Date;
    }>;
  };
  competitor_data: Array<{
    competitor_name: string;
    products_monitored: number;
    avg_price_difference: number;
    market_share_estimate: number;
  }>;
}

export interface SessionContext {
  id: string;
  started_at: Date;
  last_activity: Date;
  messages_count: number;
  actions_performed: Array<{
    action: string;
    timestamp: Date;
    result: 'success' | 'error' | 'pending';
  }>;
  current_page: string;
  user_intent: string | null;
}

/**
 * AI Request and Response Types
 */
export interface AIRequest {
  id: string;
  user_id: string;
  session_id: string;
  message: ChatMessage;
  context: AIContextData;
  timestamp: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface AIResponse {
  id: string;
  request_id: string;
  message: ChatMessage;
  actions?: AIAction[];
  context_updates?: Partial<AIContextData>;
  suggested_followups?: string[];
  timestamp: Date;
  processing_time: number;
  model_info: {
    model: string;
    version: string;
    tokens_used: number;
  };
}

/**
 * AI Actions and Commands
 */
export type AIActionType = 
  | 'generate_report'
  | 'update_product'
  | 'analyze_sales'
  | 'optimize_pricing'
  | 'create_campaign'
  | 'export_data'
  | 'send_notification'
  | 'schedule_task';

export interface AIAction {
  id: string;
  type: AIActionType;
  parameters: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
  created_at: Date;
  completed_at?: Date;
}

/**
 * AI Learning and Feedback
 */
export interface AIFeedback {
  id: string;
  message_id: string;
  user_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback_type: 'helpful' | 'not_helpful' | 'incorrect' | 'incomplete' | 'other';
  comment?: string;
  timestamp: Date;
}

export interface AILearningData {
  conversation_id: string;
  user_query: string;
  ai_response: string;
  user_satisfaction: number;
  context_relevance: number;
  action_success_rate: number;
  response_time: number;
  created_at: Date;
}

/**
 * AI Configuration and Settings
 */
export interface AIAgentConfig {
  model: {
    name: string;
    version: string;
    max_tokens: number;
    temperature: number;
    top_p: number;
  };
  context: {
    max_context_length: number;
    context_refresh_interval: number;
    include_historical_data: boolean;
  };
  behavior: {
    personality: 'professional' | 'friendly' | 'analytical' | 'concise';
    response_style: 'detailed' | 'brief' | 'adaptive';
    proactive_suggestions: boolean;
    auto_actions_enabled: boolean;
  };
  security: {
    allowed_actions: AIActionType[];
    require_confirmation: AIActionType[];
    data_access_level: 'read_only' | 'read_write' | 'full_access';
  };
}

/**
 * Chat Session Management
 */
export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  messages: ChatMessage[];
  context: AIContextData;
  created_at: Date;
  updated_at: Date;
  metadata: {
    total_messages: number;
    ai_actions_count: number;
    avg_response_time: number;
    user_satisfaction: number | null;
  };
}

/**
 * AI Analytics and Monitoring
 */
export interface AIUsageStats {
  period: 'hour' | 'day' | 'week' | 'month';
  total_requests: number;
  total_tokens: number;
  avg_response_time: number;
  success_rate: number;
  user_satisfaction: number;
  most_common_queries: Array<{
    query_type: string;
    count: number;
    avg_satisfaction: number;
  }>;
  error_rate: number;
  cost: number;
}

export interface AIPerformanceMetrics {
  accuracy: number;
  relevance: number;
  helpfulness: number;
  speed: number;
  action_success_rate: number;
  user_retention: number;
  daily_active_users: number;
  conversation_completion_rate: number;
}

/**
 * Database Models for AI Integration
 */
export interface ChatSessionDB {
  id: string;
  user_id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  metadata: any;
}

export interface ChatMessageDB {
  id: string;
  session_id: string;
  role: string;
  type: string;
  content: string;
  timestamp: string;
  metadata: any;
}

export interface AIRequestLogDB {
  id: string;
  user_id: string;
  session_id: string;
  request_data: any;
  response_data: any;
  processing_time: number;
  tokens_used: number;
  success: boolean;
  error?: string;
  created_at: string;
}

export interface AIFeedbackDB {
  id: string;
  message_id: string;
  user_id: string;
  rating: number;
  feedback_type: string;
  comment?: string;
  created_at: string;
}

/**
 * Utility Types
 */
export type AICapability = 
  | 'data_analysis'
  | 'report_generation'
  | 'price_optimization'
  | 'trend_prediction'
  | 'competitor_analysis'
  | 'campaign_management'
  | 'inventory_optimization'
  | 'customer_insights';

export interface AICapabilityInfo {
  name: AICapability;
  description: string;
  enabled: boolean;
  confidence_threshold: number;
  rate_limit: number;
  requires_confirmation: boolean;
}

export default AIContextData;