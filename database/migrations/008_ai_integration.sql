-- AI Integration Database Schema
-- This script creates the necessary tables for AI agent functionality

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Indexes
    INDEX idx_ai_chat_sessions_user_id (user_id),
    INDEX idx_ai_chat_sessions_status (status),
    INDEX idx_ai_chat_sessions_created_at (created_at)
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    type VARCHAR(50) NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'command', 'analysis_request', 'data_query', 'action_request', 'error', 'system_notification')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Indexes
    INDEX idx_ai_chat_messages_session_id (session_id),
    INDEX idx_ai_chat_messages_timestamp (timestamp),
    INDEX idx_ai_chat_messages_role (role)
);

-- AI Request Logs Table (for analytics and monitoring)
CREATE TABLE IF NOT EXISTS ai_request_logs (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) REFERENCES ai_chat_sessions(id) ON DELETE SET NULL,
    request_data JSONB NOT NULL,
    response_data JSONB,
    processing_time INTEGER, -- in milliseconds
    tokens_used INTEGER DEFAULT 0,
    success BOOLEAN DEFAULT TRUE,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_ai_request_logs_user_id (user_id),
    INDEX idx_ai_request_logs_session_id (session_id),
    INDEX idx_ai_request_logs_created_at (created_at),
    INDEX idx_ai_request_logs_success (success)
);

-- AI Feedback Table
CREATE TABLE IF NOT EXISTS ai_feedback (
    id VARCHAR(255) PRIMARY KEY,
    message_id VARCHAR(255) NOT NULL REFERENCES ai_chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('helpful', 'not_helpful', 'incorrect', 'incomplete', 'other')),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_ai_feedback_message_id (message_id),
    INDEX idx_ai_feedback_user_id (user_id),
    INDEX idx_ai_feedback_rating (rating),
    INDEX idx_ai_feedback_created_at (created_at)
);

-- AI Actions Table (for tracking AI-initiated actions)
CREATE TABLE IF NOT EXISTS ai_actions (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL CHECK (action_type IN (
        'generate_report', 'update_product', 'analyze_sales', 'optimize_pricing',
        'create_campaign', 'export_data', 'send_notification', 'schedule_task'
    )),
    parameters JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    result JSONB,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    INDEX idx_ai_actions_session_id (session_id),
    INDEX idx_ai_actions_user_id (user_id),
    INDEX idx_ai_actions_status (status),
    INDEX idx_ai_actions_action_type (action_type),
    INDEX idx_ai_actions_created_at (created_at)
);

-- AI Usage Statistics Table (for analytics and billing)
CREATE TABLE IF NOT EXISTS ai_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    total_requests INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0,
    avg_response_time INTEGER DEFAULT 0, -- in milliseconds
    success_rate DECIMAL(5,4) DEFAULT 0, -- 0.0 to 1.0
    user_satisfaction DECIMAL(3,2), -- 1.0 to 5.0
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, period_start, period_end),
    
    -- Indexes
    INDEX idx_ai_usage_stats_user_id (user_id),
    INDEX idx_ai_usage_stats_period (period_start, period_end),
    INDEX idx_ai_usage_stats_created_at (created_at)
);

-- AI Context Cache Table (for performance optimization)
CREATE TABLE IF NOT EXISTS ai_context_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    context_type VARCHAR(100) NOT NULL, -- 'user', 'business', 'products', 'sales', etc.
    context_data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_ai_context_cache_user_id (user_id),
    INDEX idx_ai_context_cache_session_id (session_id),
    INDEX idx_ai_context_cache_expires_at (expires_at),
    INDEX idx_ai_context_cache_context_type (context_type)
);

-- Row Level Security Policies

-- AI Chat Sessions
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own chat sessions" 
ON ai_chat_sessions FOR ALL 
USING (auth.uid() = user_id);

-- AI Chat Messages
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access messages from their own sessions" 
ON ai_chat_messages FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM ai_chat_sessions 
        WHERE ai_chat_sessions.id = ai_chat_messages.session_id 
        AND ai_chat_sessions.user_id = auth.uid()
    )
);

-- AI Request Logs
ALTER TABLE ai_request_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own request logs" 
ON ai_request_logs FOR ALL 
USING (auth.uid() = user_id);

-- AI Feedback
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own feedback" 
ON ai_feedback FOR ALL 
USING (auth.uid() = user_id);

-- AI Actions
ALTER TABLE ai_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own AI actions" 
ON ai_actions FOR ALL 
USING (auth.uid() = user_id);

-- AI Usage Statistics
ALTER TABLE ai_usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own usage statistics" 
ON ai_usage_stats FOR ALL 
USING (auth.uid() = user_id);

-- AI Context Cache
ALTER TABLE ai_context_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own context cache" 
ON ai_context_cache FOR ALL 
USING (auth.uid() = user_id);

-- Functions for automatic updates

-- Update updated_at timestamp on ai_chat_sessions
CREATE OR REPLACE FUNCTION update_ai_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_chat_sessions_updated_at_trigger
    BEFORE UPDATE ON ai_chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_chat_sessions_updated_at();

-- Function to clean up expired context cache
CREATE OR REPLACE FUNCTION cleanup_expired_ai_context_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM ai_context_cache WHERE expires_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired cache (if pg_cron is available)
-- SELECT cron.schedule('cleanup-ai-context-cache', '*/5 * * * *', 'SELECT cleanup_expired_ai_context_cache();');

-- Insert sample data for development (optional)
-- Uncomment the following lines for development/testing

/*
INSERT INTO ai_chat_sessions (id, user_id, title, status) VALUES
('sample_session_1', (SELECT id FROM auth.users LIMIT 1), 'Sales Analysis Chat', 'active'),
('sample_session_2', (SELECT id FROM auth.users LIMIT 1), 'Product Optimization', 'completed');

INSERT INTO ai_chat_messages (id, session_id, role, type, content) VALUES
('msg_1', 'sample_session_1', 'user', 'text', 'Show me my sales performance'),
('msg_2', 'sample_session_1', 'assistant', 'text', 'Based on your current sales data, your revenue is 150,000 RUB with 120 orders this month. Your growth is 15.2% compared to last month.'),
('msg_3', 'sample_session_1', 'user', 'text', 'What are my top products?'),
('msg_4', 'sample_session_1', 'assistant', 'text', 'Your top performing products are: 1. Product A (25,000 RUB), 2. Product B (18,000 RUB), 3. Product C (15,000 RUB)');
*/

-- Comments and documentation
COMMENT ON TABLE ai_chat_sessions IS 'Stores AI chat sessions for each user';
COMMENT ON TABLE ai_chat_messages IS 'Stores individual messages within chat sessions';
COMMENT ON TABLE ai_request_logs IS 'Logs all AI requests and responses for analytics';
COMMENT ON TABLE ai_feedback IS 'User feedback on AI responses for improvement';
COMMENT ON TABLE ai_actions IS 'Tracks AI-initiated actions and their status';
COMMENT ON TABLE ai_usage_stats IS 'Aggregated usage statistics for analytics and billing';
COMMENT ON TABLE ai_context_cache IS 'Caches context data for performance optimization';