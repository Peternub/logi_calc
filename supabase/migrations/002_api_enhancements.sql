-- Дополнения к схеме для поддержки реального API
-- Файл: supabase/migrations/002_api_enhancements.sql

-- Обновляем таблицу marketplace_accounts для хранения зашифрованных credentials
ALTER TABLE public.marketplace_accounts 
ADD COLUMN credentials JSONB NOT NULL DEFAULT '{}',
ADD COLUMN last_sync TIMESTAMP WITH TIME ZONE,
ADD COLUMN sync_status TEXT CHECK (sync_status IN ('idle', 'syncing', 'error', 'success')) DEFAULT 'idle',
ADD COLUMN api_rate_limit INTEGER DEFAULT 1000,
ADD COLUMN api_requests_used INTEGER DEFAULT 0,
ADD COLUMN api_reset_time TIMESTAMP WITH TIME ZONE;

-- Удаляем старые колонки (если есть)
-- ALTER TABLE public.marketplace_accounts DROP COLUMN IF EXISTS api_key;
-- ALTER TABLE public.marketplace_accounts DROP COLUMN IF EXISTS client_id;

-- Обновляем таблицу products для более детальной информации
ALTER TABLE public.products 
ADD COLUMN old_price DECIMAL(10,2),
ADD COLUMN currency TEXT DEFAULT 'RUB',
ADD COLUMN available_quantity INTEGER DEFAULT 0,
ADD COLUMN reserved_quantity INTEGER DEFAULT 0,
ADD COLUMN barcode TEXT,
ADD COLUMN category_id TEXT,
ADD COLUMN brand TEXT,
ADD COLUMN description TEXT,
ADD COLUMN images JSONB DEFAULT '[]',
ADD COLUMN dimensions JSONB DEFAULT '{}',
ADD COLUMN weight DECIMAL(8,3),
ADD COLUMN commission_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN is_active BOOLEAN DEFAULT true,
ADD COLUMN is_archived BOOLEAN DEFAULT false,
ADD COLUMN last_sync TIMESTAMP WITH TIME ZONE,
ADD COLUMN marketplace_data JSONB DEFAULT '{}'; -- Для хранения специфичных данных маркетплейса

-- Создаем таблицу для логирования API запросов
CREATE TABLE public.api_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  marketplace_account_id UUID REFERENCES public.marketplace_accounts(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  request_data JSONB,
  response_data JSONB,
  response_status INTEGER,
  execution_time INTEGER, -- в миллисекундах
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Создаем таблицу для фоновых задач
CREATE TABLE public.background_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  job_type TEXT CHECK (job_type IN ('sync_products', 'sync_analytics', 'update_prices', 'export_data')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  parameters JSONB DEFAULT '{}',
  result JSONB,
  error_message TEXT,
  progress INTEGER DEFAULT 0, -- процент выполнения
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Создаем таблицу для хранения настроек пользователя
CREATE TABLE public.user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_interval INTEGER DEFAULT 60, -- в минутах
  notification_preferences JSONB DEFAULT '{"email": true, "push": false}',
  timezone TEXT DEFAULT 'Europe/Moscow',
  currency TEXT DEFAULT 'RUB',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Создаем таблицу для уведомлений
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('sync_completed', 'sync_error', 'low_stock', 'price_change', 'system')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Индексы для новых таблиц
CREATE INDEX idx_api_logs_user_id ON public.api_logs(user_id);
CREATE INDEX idx_api_logs_marketplace_account_id ON public.api_logs(marketplace_account_id);
CREATE INDEX idx_api_logs_created_at ON public.api_logs(created_at);

CREATE INDEX idx_background_jobs_user_id ON public.background_jobs(user_id);
CREATE INDEX idx_background_jobs_status ON public.background_jobs(status);
CREATE INDEX idx_background_jobs_job_type ON public.background_jobs(job_type);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- Триггеры для updated_at
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Политики RLS для новых таблиц
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API logs" ON public.api_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage API logs" ON public.api_logs
  FOR ALL USING (true); -- Система может записывать логи

CREATE POLICY "Users can manage own background jobs" ON public.background_jobs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- Функция для очистки старых API логов (автоматическая очистка раз в неделю)
CREATE OR REPLACE FUNCTION cleanup_old_api_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.api_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;