import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  AIRequest, 
  AIResponse, 
  ChatMessage, 
  ChatSession,
  AIAction,
  AIFeedback,
  AIUsageStats
} from '@/types/ai';
import { aiContextManager } from '@/services/ai-context';
import { withRateLimit, rateLimiters } from '@/middleware/rate-limiting';

// AI Service class to handle AI operations
class AIService {
  private supabase = createRouteHandlerClient({ cookies });

  /**
   * Process AI chat message and generate response
   */
  async processMessage(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      // Log the incoming request
      await this.logAIRequest(request);

      // Get fresh context data
      const context = await aiContextManager.getContextData(
        request.user_id, 
        request.session_id
      );

      // Generate AI response (mock implementation)
      const response = await this.generateAIResponse(request, context);

      // Log the response
      await this.logAIResponse(request.id, response);

      // Update session context
      await aiContextManager.updateSessionContext(
        request.session_id,
        request.user_id,
        {
          messages_count: context.session.messages_count + 1,
          last_activity: new Date()
        }
      );

      return response;
    } catch (error) {
      console.error('AI processing error:', error);
      
      const errorResponse: AIResponse = {
        id: `response_${Date.now()}`,
        request_id: request.id,
        message: {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          type: 'error',
          content: 'I apologize, but I encountered an error while processing your request. Please try again.',
          timestamp: new Date()
        },
        timestamp: new Date(),
        processing_time: Date.now() - startTime,
        model_info: {
          model: 'error_handler',
          version: '1.0',
          tokens_used: 0
        }
      };

      await this.logAIResponse(request.id, errorResponse);
      return errorResponse;
    }
  }

  /**
   * Generate AI response (mock implementation)
   * In production, this would integrate with OpenAI, Claude, or other AI models
   */
  private async generateAIResponse(request: AIRequest, context: any): Promise<AIResponse> {
    const userMessage = request.message.content.toLowerCase();
    
    let responseContent = '';
    let actions: AIAction[] = [];
    let suggestedFollowups: string[] = [];

    // Simple rule-based responses for demonstration
    if (userMessage.includes('продажи') || userMessage.includes('sales')) {
      responseContent = `Based on your current sales data:
      
📈 **Current Period Performance:**
- Revenue: ${context.sales.current_period.revenue.toLocaleString('ru-RU')} RUB
- Orders: ${context.sales.current_period.orders}
- Average Order Value: ${context.sales.current_period.avg_order_value.toLocaleString('ru-RU')} RUB
- Growth: ${context.sales.trends.revenue_growth.toFixed(1)}%

Your sales are ${context.sales.trends.revenue_growth > 0 ? 'growing' : 'declining'} compared to the previous period. ${context.sales.trends.revenue_growth > 10 ? 'Excellent performance! 🎉' : context.sales.trends.revenue_growth > 0 ? 'Good progress! 👍' : 'Let\'s work on improving this. 💪'}`;

      suggestedFollowups = [
        'Show me sales by marketplace',
        'What are my top performing products?',
        'Generate a sales report'
      ];
    } 
    else if (userMessage.includes('товары') || userMessage.includes('products')) {
      responseContent = `Here's your product overview:
      
📦 **Product Portfolio:**
- Total Products: ${context.products.total_products}
- Active Products: ${context.products.active_products}
- Categories: ${context.products.categories.length}

📊 **Inventory Status:**
- In Stock: ${context.products.inventory_status.in_stock}
- Low Stock: ${context.products.inventory_status.low_stock}
- Out of Stock: ${context.products.inventory_status.out_of_stock}

💰 **Pricing Info:**
- Average Price: ${context.products.pricing_info.avg_price.toLocaleString('ru-RU')} RUB
- Price Range: ${context.products.pricing_info.price_range.min.toLocaleString('ru-RU')} - ${context.products.pricing_info.price_range.max.toLocaleString('ru-RU')} RUB`;

      suggestedFollowups = [
        'Show me products with low stock',
        'Analyze product performance',
        'Suggest price optimizations'
      ];
    }
    else if (userMessage.includes('отчет') || userMessage.includes('report')) {
      responseContent = `I can help you generate various reports:
      
📊 **Available Reports:**
- Sales Performance Report
- Product Analytics Report
- Marketplace Comparison Report
- Inventory Status Report
- Profit Margin Analysis

Which report would you like me to generate?`;

      actions.push({
        id: `action_${Date.now()}`,
        type: 'generate_report',
        parameters: { report_type: 'prompt_user' },
        status: 'pending',
        created_at: new Date()
      });

      suggestedFollowups = [
        'Generate sales report',
        'Create product analytics report',
        'Show marketplace comparison'
      ];
    }
    else if (userMessage.includes('помощь') || userMessage.includes('help')) {
      responseContent = `👋 I'm your LogiCalc AI assistant! Here's what I can help you with:
      
🔍 **Analytics & Insights:**
- Sales performance analysis
- Product recommendations
- Market trend analysis
- Competitor insights

📊 **Reports & Data:**
- Generate detailed reports
- Export data in various formats
- Create visualizations
- Track KPIs

⚙️ **Automation:**
- Price optimization suggestions
- Inventory alerts
- Campaign management
- Workflow automation

💡 **Business Intelligence:**
- Revenue forecasting
- Profit optimization
- Market opportunities
- Risk assessment

Just ask me anything about your business data!`;

      suggestedFollowups = [
        'Show me my sales performance',
        'What are my top products?',
        'Generate a business report',
        'Help me optimize prices'
      ];
    }
    else {
      // Default response
      responseContent = `I understand you're asking about: "${request.message.content}"
      
Based on your current business context:
- You have ${context.products.total_products} products across ${context.products.categories.length} categories
- Your current revenue is ${context.sales.current_period.revenue.toLocaleString('ru-RU')} RUB
- You're integrated with ${context.marketplace.integrations.filter((i: any) => i.status === 'active').length} marketplaces

How can I help you analyze or improve your business performance?`;

      suggestedFollowups = [
        'Show me sales analytics',
        'Analyze product performance',
        'Generate business report',
        'Help with price optimization'
      ];
    }

    const response: AIResponse = {
      id: `response_${Date.now()}`,
      request_id: request.id,
      message: {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        type: 'text',
        content: responseContent,
        timestamp: new Date(),
        metadata: {
          tokens_used: Math.floor(responseContent.length / 4), // Rough estimation
          response_time: Date.now() - Date.now(),
          confidence_score: 0.85,
          sources: ['sales_data', 'product_data', 'marketplace_data']
        }
      },
      actions,
      suggested_followups: suggestedFollowups,
      timestamp: new Date(),
      processing_time: Date.now() - Date.now(),
      model_info: {
        model: 'logicalc_assistant',
        version: '1.0',
        tokens_used: Math.floor(responseContent.length / 4)
      }
    };

    return response;
  }

  /**
   * Create a new chat session
   */
  async createChatSession(userId: string, title?: string): Promise<ChatSession> {
    const session: ChatSession = {
      id: `session_${Date.now()}_${userId}`,
      user_id: userId,
      title: title || 'New Chat',
      status: 'active',
      messages: [],
      context: await aiContextManager.getContextData(userId, `session_${Date.now()}_${userId}`),
      created_at: new Date(),
      updated_at: new Date(),
      metadata: {
        total_messages: 0,
        ai_actions_count: 0,
        avg_response_time: 0,
        user_satisfaction: null
      }
    };

    // Save session to database
    const { error } = await this.supabase
      .from('ai_chat_sessions')
      .insert({
        id: session.id,
        user_id: session.user_id,
        title: session.title,
        status: session.status,
        created_at: session.created_at.toISOString(),
        updated_at: session.updated_at.toISOString(),
        metadata: session.metadata
      });

    if (error) {
      throw new Error(`Failed to create chat session: ${error.message}`);
    }

    return session;
  }

  /**
   * Get chat session by ID
   */
  async getChatSession(sessionId: string, userId: string): Promise<ChatSession | null> {
    const { data: session, error } = await this.supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (error || !session) {
      return null;
    }

    // Get messages for this session
    const { data: messages } = await this.supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    const chatMessages: ChatMessage[] = (messages || []).map(msg => ({
      id: msg.id,
      role: msg.role as any,
      type: msg.type as any,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      metadata: msg.metadata
    }));

    return {
      id: session.id,
      user_id: session.user_id,
      title: session.title,
      status: session.status,
      messages: chatMessages,
      context: await aiContextManager.getContextData(userId, sessionId),
      created_at: new Date(session.created_at),
      updated_at: new Date(session.updated_at),
      metadata: session.metadata
    };
  }

  /**
   * Save chat message to database
   */
  async saveChatMessage(sessionId: string, message: ChatMessage): Promise<void> {
    const { error } = await this.supabase
      .from('ai_chat_messages')
      .insert({
        id: message.id,
        session_id: sessionId,
        role: message.role,
        type: message.type,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
        metadata: message.metadata
      });

    if (error) {
      throw new Error(`Failed to save chat message: ${error.message}`);
    }
  }

  /**
   * Log AI request for analytics
   */
  private async logAIRequest(request: AIRequest): Promise<void> {
    try {
      await this.supabase
        .from('ai_request_logs')
        .insert({
          id: request.id,
          user_id: request.user_id,
          session_id: request.session_id,
          request_data: request,
          created_at: request.timestamp.toISOString()
        });
    } catch (error) {
      console.error('Failed to log AI request:', error);
    }
  }

  /**
   * Log AI response for analytics
   */
  private async logAIResponse(requestId: string, response: AIResponse): Promise<void> {
    try {
      await this.supabase
        .from('ai_request_logs')
        .update({
          response_data: response,
          processing_time: response.processing_time,
          tokens_used: response.model_info.tokens_used,
          success: true
        })
        .eq('id', requestId);
    } catch (error) {
      console.error('Failed to log AI response:', error);
    }
  }

  /**
   * Get AI usage statistics
   */
  async getUsageStats(userId: string, period: 'day' | 'week' | 'month'): Promise<AIUsageStats> {
    // Mock implementation - in production would query actual data
    return {
      period,
      total_requests: 150,
      total_tokens: 45000,
      avg_response_time: 1200,
      success_rate: 0.95,
      user_satisfaction: 4.2,
      most_common_queries: [
        { query_type: 'sales_analysis', count: 35, avg_satisfaction: 4.5 },
        { query_type: 'product_insights', count: 28, avg_satisfaction: 4.1 },
        { query_type: 'report_generation', count: 22, avg_satisfaction: 4.3 }
      ],
      error_rate: 0.05,
      cost: 12.50
    };
  }
}

const aiService = new AIService();

// POST /api/ai - Process AI chat message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...data } = body;

    switch (action) {
      case 'chat': {
        const { user_id, session_id, message } = data;
        
        if (!user_id || !session_id || !message) {
          return NextResponse.json(
            { error: 'Missing required fields: user_id, session_id, message' },
            { status: 400 }
          );
        }

        const request: AIRequest = {
          id: `req_${Date.now()}`,
          user_id,
          session_id,
          message: {
            id: `msg_${Date.now()}`,
            role: 'user',
            type: message.type || 'text',
            content: message.content,
            timestamp: new Date()
          },
          context: await aiContextManager.getContextData(user_id, session_id),
          timestamp: new Date(),
          priority: 'normal'
        };

        // Save user message
        await aiService.saveChatMessage(session_id, request.message);

        // Process AI response
        const response = await aiService.processMessage(request);

        // Save AI response
        await aiService.saveChatMessage(session_id, response.message);

        return NextResponse.json({
          success: true,
          data: response
        });
      }

      case 'feedback': {
        const feedback: AIFeedback = {
          id: `feedback_${Date.now()}`,
          message_id: data.message_id,
          user_id: data.user_id,
          rating: data.rating,
          feedback_type: data.feedback_type,
          comment: data.comment,
          timestamp: new Date()
        };

        // Save feedback (mock implementation)
        return NextResponse.json({
          success: true,
          message: 'Feedback saved successfully'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/ai - Get AI data and sessions
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user_id parameter' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'sessions': {
        // Get user's chat sessions (mock implementation)
        const sessions = [
          {
            id: `session_${Date.now()}_${userId}`,
            title: 'Sales Analysis Chat',
            status: 'active',
            created_at: new Date().toISOString(),
            message_count: 5
          }
        ];

        return NextResponse.json({
          success: true,
          data: sessions
        });
      }

      case 'session': {
        const sessionId = url.searchParams.get('session_id');
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Missing session_id parameter' },
            { status: 400 }
          );
        }

        const session = await aiService.getChatSession(sessionId, userId);
        if (!session) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: session
        });
      }

      case 'stats': {
        const period = url.searchParams.get('period') as 'day' | 'week' | 'month' || 'week';
        const stats = await aiService.getUsageStats(userId, period);

        return NextResponse.json({
          success: true,
          data: stats
        });
      }

      case 'context': {
        const sessionId = url.searchParams.get('session_id') || `temp_${Date.now()}`;
        const context = await aiContextManager.getContextData(userId, sessionId);

        return NextResponse.json({
          success: true,
          data: {
            context,
            summary: aiContextManager.getContextSummary(context)
          }
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI API GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Apply rate limiting to AI endpoints
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';