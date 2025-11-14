// Types are now defined directly in this file

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
    from: string;
    to: string;
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

// Сервис работы с отчетами
export class ReportService {
  // Получение списка отчетов пользователя
  static async getReports(userId: string): Promise<Report[]> {
    // TODO: Реализовать получение списка отчетов из базы данных
    return [];
  }

  // Получение конкретного отчета
  static async getReport(id: string, userId: string): Promise<Report | null> {
    // TODO: Реализовать получение конкретного отчета из базы данных
    return null;
  }

  // Создание нового отчета
  static async createReport(reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report> {
    // TODO: Реализовать создание нового отчета в базе данных
    throw new Error('Not implemented');
  }

  // Обновление отчета
  static async updateReport(id: string, reportData: Partial<Report>, userId: string): Promise<Report> {
    // TODO: Реализовать обновление отчета в базе данных
    throw new Error('Not implemented');
  }

  // Удаление отчета
  static async deleteReport(id: string, userId: string): Promise<void> {
    // TODO: Реализовать удаление отчета из базы данных
    throw new Error('Not implemented');
  }

  // Генерация содержимого отчета
  static async generateReport(id: string, userId: string): Promise<GeneratedReport> {
    // TODO: Реализовать генерацию содержимого отчета на основе его конфигурации
    throw new Error('Not implemented');
  }

  // Экспорт отчета в указанный формат
  static async exportReport(id: string, format: ExportFormat, userId: string): Promise<ArrayBuffer> {
    // TODO: Реализовать экспорт отчета в указанный формат
    throw new Error('Not implemented');
  }
}