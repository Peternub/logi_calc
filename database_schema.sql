-- Создание таблиц для системы аналитики маркетплейсов

-- Таблица аккаунтов маркетплейсов
CREATE TABLE marketplace_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    marketplace TEXT NOT NULL CHECK (marketplace IN ('ozon', 'wildberries', 'yandex_market')),
    name TEXT NOT NULL,
    api_key TEXT NOT NULL,
    client_id TEXT,
    campaign_id TEXT,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, marketplace, name)
);

-- Таблица товаров
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketplace_account_id UUID REFERENCES marketplace_accounts(id) ON DELETE CASCADE,
    marketplace_product_id TEXT NOT NULL,
    marketplace TEXT NOT NULL CHECK (marketplace IN ('ozon', 'wildberries', 'yandex_market')),
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    barcode TEXT,
    category_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    brand TEXT,
    description TEXT,
    images JSONB DEFAULT '[]',
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    old_price DECIMAL(12,2),
    discount_price DECIMAL(12,2),
    currency TEXT DEFAULT 'RUB',
    stock_quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    rating DECIMAL(3,2),
    reviews_count INTEGER DEFAULT 0,
    commission_percent DECIMAL(5,2),
    dimensions JSONB,
    weight DECIMAL(8,3),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_sync TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(marketplace_account_id, marketplace_product_id)
);

-- Таблица истории цен товаров
CREATE TABLE product_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    price DECIMAL(12,2) NOT NULL,
    old_price DECIMAL(12,2),
    discount_price DECIMAL(12,2),
    commission_percent DECIMAL(5,2),
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица истории остатков товаров
CREATE TABLE product_stock_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    stock_quantity INTEGER NOT NULL,
    reserved_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица заказов
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketplace_account_id UUID REFERENCES marketplace_accounts(id) ON DELETE CASCADE,
    marketplace_order_id TEXT NOT NULL,
    marketplace TEXT NOT NULL CHECK (marketplace IN ('ozon', 'wildberries', 'yandex_market')),
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    commission DECIMAL(12,2) DEFAULT 0,
    profit DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'RUB',
    status TEXT NOT NULL CHECK (status IN ('awaiting_packaging', 'packaged', 'shipped', 'delivered', 'cancelled', 'returned')),
    items JSONB DEFAULT '[]',
    customer_info JSONB,
    delivery_info JSONB,
    order_date TIMESTAMPTZ NOT NULL,
    delivery_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(marketplace_account_id, marketplace_order_id)
);

-- Таблица продаж
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketplace_account_id UUID REFERENCES marketplace_accounts(id) ON DELETE CASCADE,
    marketplace_order_id TEXT NOT NULL,
    marketplace TEXT NOT NULL CHECK (marketplace IN ('ozon', 'wildberries', 'yandex_market')),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_sku TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_per_item DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    commission DECIMAL(12,2) DEFAULT 0,
    profit DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'RUB',
    order_date TIMESTAMPTZ NOT NULL,
    delivery_date TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('new', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned')),
    customer_region TEXT,
    delivery_service TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица ежедневных метрик продаж
CREATE TABLE daily_sales_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketplace_account_id UUID REFERENCES marketplace_accounts(id) ON DELETE CASCADE,
    marketplace TEXT NOT NULL CHECK (marketplace IN ('ozon', 'wildberries', 'yandex_market')),
    date DATE NOT NULL,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_items_sold INTEGER DEFAULT 0,
    total_commission DECIMAL(12,2) DEFAULT 0,
    total_profit DECIMAL(12,2) DEFAULT 0,
    average_order_value DECIMAL(12,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2),
    return_rate DECIMAL(5,2),
    currency TEXT DEFAULT 'RUB',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(marketplace_account_id, marketplace, date)
);

-- Таблица метрик товаров
CREATE TABLE product_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    orders INTEGER DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    profit DECIMAL(12,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    click_through_rate DECIMAL(5,2) DEFAULT 0,
    position_avg DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, date)
);

-- Таблица метрик категорий
CREATE TABLE category_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketplace_account_id UUID REFERENCES marketplace_accounts(id) ON DELETE CASCADE,
    marketplace TEXT NOT NULL CHECK (marketplace IN ('ozon', 'wildberries', 'yandex_market')),
    category_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    date DATE NOT NULL,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_products INTEGER DEFAULT 0,
    average_price DECIMAL(12,2) DEFAULT 0,
    market_share DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(marketplace_account_id, marketplace, category_id, date)
);

-- Таблица данных конкурентов
CREATE TABLE competitor_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    competitor_name TEXT NOT NULL,
    competitor_price DECIMAL(12,2) NOT NULL,
    competitor_rating DECIMAL(3,2),
    competitor_reviews_count INTEGER,
    position INTEGER,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица фоновых задач
CREATE TABLE background_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    marketplace_account_id UUID REFERENCES marketplace_accounts(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('sync_products', 'sync_orders', 'sync_sales', 'sync_analytics', 'update_prices', 'update_stocks', 'generate_report', 'competitor_analysis')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    data JSONB DEFAULT '{}',
    result JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица логов синхронизации
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketplace_account_id UUID REFERENCES marketplace_accounts(id) ON DELETE CASCADE,
    task_id UUID REFERENCES background_tasks(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('sync_products', 'sync_orders', 'sync_sales', 'sync_analytics', 'update_prices', 'update_stocks', 'generate_report', 'competitor_analysis')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    items_processed INTEGER DEFAULT 0,
    items_success INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    error_summary TEXT,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица кэша данных
CREATE TABLE data_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT UNIQUE NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица rate limiting
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketplace_account_id UUID REFERENCES marketplace_accounts(id) ON DELETE CASCADE,
    marketplace TEXT NOT NULL CHECK (marketplace IN ('ozon', 'wildberries', 'yandex_market')),
    endpoint TEXT NOT NULL,
    requests_count INTEGER DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL,
    window_duration_ms INTEGER NOT NULL,
    max_requests INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(marketplace_account_id, marketplace, endpoint, window_start)
);

-- Таблица webhook событий
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketplace_account_id UUID REFERENCES marketplace_accounts(id) ON DELETE CASCADE,
    marketplace TEXT NOT NULL CHECK (marketplace IN ('ozon', 'wildberries', 'yandex_market')),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица уведомлений
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('sync_completed', 'sync_failed', 'low_stock', 'price_changed', 'new_order', 'order_cancelled', 'competitor_price_change', 'system_error')),
    channel TEXT NOT NULL CHECK (channel IN ('email', 'telegram', 'push', 'in_app')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица настроек уведомлений
CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('sync_completed', 'sync_failed', 'low_stock', 'price_changed', 'new_order', 'order_cancelled', 'competitor_price_change', 'system_error')),
    enabled BOOLEAN DEFAULT true,
    channels JSONB DEFAULT '["in_app"]',
    conditions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, type)
);

-- Таблица правил автоматизации
CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    marketplace_account_id UUID REFERENCES marketplace_accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('schedule', 'low_stock', 'price_change', 'competitor_price', 'order_received', 'sync_completed')),
    trigger_conditions JSONB DEFAULT '{}',
    actions JSONB DEFAULT '[]',
    last_executed TIMESTAMPTZ,
    execution_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица выполнений автоматизации
CREATE TABLE automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES automation_rules(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
    trigger_data JSONB,
    actions_executed INTEGER DEFAULT 0,
    actions_failed INTEGER DEFAULT 0,
    error_message TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    duration_ms INTEGER DEFAULT 0
);

-- Таблица конфигурации синхронизации
CREATE TABLE sync_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketplace_account_id UUID REFERENCES marketplace_accounts(id) ON DELETE CASCADE,
    marketplace TEXT NOT NULL CHECK (marketplace IN ('ozon', 'wildberries', 'yandex_market')),
    sync_products BOOLEAN DEFAULT true,
    sync_orders BOOLEAN DEFAULT true,
    sync_analytics BOOLEAN DEFAULT true,
    sync_frequency_minutes INTEGER DEFAULT 60,
    batch_size INTEGER DEFAULT 100,
    auto_update_prices BOOLEAN DEFAULT false,
    auto_update_stocks BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(marketplace_account_id, marketplace)
);

-- Создание индексов для оптимизации запросов
CREATE INDEX idx_marketplace_accounts_user_id ON marketplace_accounts(user_id);
CREATE INDEX idx_marketplace_accounts_marketplace ON marketplace_accounts(marketplace);

CREATE INDEX idx_products_marketplace_account_id ON products(marketplace_account_id);
CREATE INDEX idx_products_marketplace ON products(marketplace);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_last_sync ON products(last_sync);

CREATE INDEX idx_product_price_history_product_id ON product_price_history(product_id);
CREATE INDEX idx_product_price_history_date ON product_price_history(date);

CREATE INDEX idx_product_stock_history_product_id ON product_stock_history(product_id);
CREATE INDEX idx_product_stock_history_date ON product_stock_history(date);

CREATE INDEX idx_orders_marketplace_account_id ON orders(marketplace_account_id);
CREATE INDEX idx_orders_marketplace_order_id ON orders(marketplace_order_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);

CREATE INDEX idx_sales_marketplace_account_id ON sales(marketplace_account_id);
CREATE INDEX idx_sales_product_id ON sales(product_id);
CREATE INDEX idx_sales_order_date ON sales(order_date);
CREATE INDEX idx_sales_status ON sales(status);

CREATE INDEX idx_daily_sales_metrics_marketplace_account_id ON daily_sales_metrics(marketplace_account_id);
CREATE INDEX idx_daily_sales_metrics_date ON daily_sales_metrics(date);
CREATE INDEX idx_daily_sales_metrics_marketplace ON daily_sales_metrics(marketplace);

CREATE INDEX idx_product_metrics_product_id ON product_metrics(product_id);
CREATE INDEX idx_product_metrics_date ON product_metrics(date);

CREATE INDEX idx_category_metrics_marketplace_account_id ON category_metrics(marketplace_account_id);
CREATE INDEX idx_category_metrics_date ON category_metrics(date);
CREATE INDEX idx_category_metrics_category_id ON category_metrics(category_id);

CREATE INDEX idx_competitor_data_product_id ON competitor_data(product_id);
CREATE INDEX idx_competitor_data_date ON competitor_data(date);

CREATE INDEX idx_background_tasks_user_id ON background_tasks(user_id);
CREATE INDEX idx_background_tasks_status ON background_tasks(status);
CREATE INDEX idx_background_tasks_type ON background_tasks(type);
CREATE INDEX idx_background_tasks_scheduled_at ON background_tasks(scheduled_at);
CREATE INDEX idx_background_tasks_next_run_at ON background_tasks(next_run_at);

CREATE INDEX idx_sync_logs_marketplace_account_id ON sync_logs(marketplace_account_id);
CREATE INDEX idx_sync_logs_type ON sync_logs(type);
CREATE INDEX idx_sync_logs_started_at ON sync_logs(started_at);

CREATE INDEX idx_data_cache_cache_key ON data_cache(cache_key);
CREATE INDEX idx_data_cache_expires_at ON data_cache(expires_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX idx_automation_rules_is_active ON automation_rules(is_active);

-- Создание функций для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Применение триггеров для автоматического обновления updated_at
CREATE TRIGGER update_marketplace_accounts_updated_at BEFORE UPDATE ON marketplace_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_background_tasks_updated_at BEFORE UPDATE ON background_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_cache_updated_at BEFORE UPDATE ON data_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON automation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sync_configurations_updated_at BEFORE UPDATE ON sync_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Настройка Row Level Security (RLS)
ALTER TABLE marketplace_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_configurations ENABLE ROW LEVEL SECURITY;

-- Политики RLS для marketplace_accounts
CREATE POLICY "Users can view own marketplace accounts" ON marketplace_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own marketplace accounts" ON marketplace_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own marketplace accounts" ON marketplace_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own marketplace accounts" ON marketplace_accounts FOR DELETE USING (auth.uid() = user_id);

-- Политики RLS для products
CREATE POLICY "Users can view products from own accounts" ON products FOR SELECT USING (
    marketplace_account_id IN (
        SELECT id FROM marketplace_accounts WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert products to own accounts" ON products FOR INSERT WITH CHECK (
    marketplace_account_id IN (
        SELECT id FROM marketplace_accounts WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Users can update products from own accounts" ON products FOR UPDATE USING (
    marketplace_account_id IN (
        SELECT id FROM marketplace_accounts WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete products from own accounts" ON products FOR DELETE USING (
    marketplace_account_id IN (
        SELECT id FROM marketplace_accounts WHERE user_id = auth.uid()
    )
);

-- Аналогичные политики для остальных таблиц
CREATE POLICY "Users can access own product price history" ON product_price_history FOR ALL USING (
    product_id IN (
        SELECT p.id FROM products p 
        JOIN marketplace_accounts ma ON p.marketplace_account_id = ma.id 
        WHERE ma.user_id = auth.uid()
    )
);

CREATE POLICY "Users can access own product stock history" ON product_stock_history FOR ALL USING (
    product_id IN (
        SELECT p.id FROM products p 
        JOIN marketplace_accounts ma ON p.marketplace_account_id = ma.id 
        WHERE ma.user_id = auth.uid()
    )
);

CREATE POLICY "Users can access own orders" ON orders FOR ALL USING (
    marketplace_account_id IN (
        SELECT id FROM marketplace_accounts WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can access own sales" ON sales FOR ALL USING (
    marketplace_account_id IN (
        SELECT id FROM marketplace_accounts WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can access own daily sales metrics" ON daily_sales_metrics FOR ALL USING (
    marketplace_account_id IN (
        SELECT id FROM marketplace_accounts WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can access own product metrics" ON product_metrics FOR ALL USING (
    product_id IN (
        SELECT p.id FROM products p 
        JOIN marketplace_accounts ma ON p.marketplace_account_id = ma.id 
        WHERE ma.user_id = auth.uid()
    )
);

CREATE POLICY "Users can access own category metrics" ON category_metrics FOR ALL USING (
    marketplace_account_id IN (
        SELECT id FROM marketplace_accounts WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can access own competitor data" ON competitor_data FOR ALL USING (
    product_id IN (
        SELECT p.id FROM products p 
        JOIN marketplace_accounts ma ON p.marketplace_account_id = ma.id 
        WHERE ma.user_id = auth.uid()
    )
);

CREATE POLICY "Users can access own background tasks" ON background_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own sync logs" ON sync_logs FOR ALL USING (
    marketplace_account_id IN (
        SELECT id FROM marketplace_accounts WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Users can access own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own notification settings" ON notification_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own automation rules" ON automation_rules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own automation executions" ON automation_executions FOR ALL USING (
    rule_id IN (
        SELECT id FROM automation_rules WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Users can access own sync configurations" ON sync_configurations FOR ALL USING (
    marketplace_account_id IN (
        SELECT id FROM marketplace_accounts WHERE user_id = auth.uid()
    )
);