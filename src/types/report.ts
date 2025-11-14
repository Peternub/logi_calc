// Типы для системы отчетов

// Интерфейс отчета
export interface Report {
  id: string;
  name: string;
  description: string;
  config: ReportConfig;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// Конфигурация отчета
export interface ReportConfig {
  // Основные настройки
  title: string;
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  customDateRange?: {
    from?: string;
    to?: string;
  };
  
  // Включаемые данные
  includeSales: boolean;
  includeProducts: boolean;
  includeFinance: boolean;
  includeMarketing: boolean;
  
  // Настройки визуализации
  chartTypes: ('bar' | 'line' | 'pie' | 'table')[];
  theme: 'light' | 'dark';
  
  // Фильтры
  filters: {
    marketplaceIds?: string[];
    categoryIds?: string[];
    brandIds?: string[];
    priceRange?: {
      min?: number;
      max?: number;
    };
  };
}

// Поддерживаемые форматы экспорта
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

// Результат генерации отчета
export interface GeneratedReport {
  data: any;
  metadata: {
    generatedAt: string;
    reportId: string;
    format?: ExportFormat;
  };
}