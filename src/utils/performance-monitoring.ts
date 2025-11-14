/**
 * Система мониторинга производительности в реальном времени
 * Отслеживание метрик производительности и генерация алертов
 */

// Метрики производительности в реальном времени
interface RealTimeMetrics {
  timestamp: number;
  pageLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  errorRate: number;
  activeUsers: number;
}

// Конфигурация мониторинга
interface MonitoringConfig {
  samplingInterval: number; // Интервал сбора метрик в миллисекундах
  alertThresholds: AlertThresholds;
  enableRealTimeAlerts: boolean;
  enableDataCollection: boolean;
  retentionPeriod: number; // Период хранения данных в часах
}

// Пороги для алертов
interface AlertThresholds {
  pageLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
}

// Алерт
interface Alert {
  id: string;
  type: 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  resolved: boolean;
}

// Монитор производительности
export class PerformanceMonitor {
  private config: MonitoringConfig;
  private metrics: RealTimeMetrics[];
  private alerts: Alert[];
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(config: MonitoringConfig) {
    this.config = config;
    this.metrics = [];
    this.alerts = [];
  }

  // Запуск мониторинга
  start(): void {
    if (this.isRunning) {
      console.log('⚠️ Мониторинг уже запущен');
      return;
    }

    console.log('🔍 Запуск мониторинга производительности...');
    this.isRunning = true;

    this.intervalId = setInterval(() => {
      this.collectMetrics();
    }, this.config.samplingInterval);

    console.log(`✅ Мониторинг запущен с интервалом ${this.config.samplingInterval}ms`);
  }

  // Остановка мониторинга
  stop(): void {
    if (!this.isRunning) {
      console.log('⚠️ Мониторинг уже остановлен');
      return;
    }

    console.log('🛑 Остановка мониторинга...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('✅ Мониторинг остановлен');
  }

  // Сбор метрик
  private collectMetrics(): void {
    if (!this.config.enableDataCollection) return;

    const metrics: RealTimeMetrics = {
      timestamp: Date.now(),
      pageLoadTime: this.measurePageLoadTime(),
      apiResponseTime: this.measureAPIResponseTime(),
      memoryUsage: this.measureMemoryUsage(),
      cpuUsage: this.measureCPUUsage(),
      networkLatency: this.measureNetworkLatency(),
      errorRate: this.calculateErrorRate(),
      activeUsers: this.countActiveUsers()
    };

    this.metrics.push(metrics);
    this.checkAlerts(metrics);
    this.cleanupOldMetrics();

    // Логирование в реальном времени (можно отключить для production)
    if (process.env.NODE_ENV === 'development') {
      this.logMetrics(metrics);
    }
  }

  // Измерение времени загрузки страницы
  private measurePageLoadTime(): number {
    // Симуляция измерения времени загрузки
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
    }
    
    // Симуляция для серверной среды
    return Math.random() * 2000 + 500; // 500-2500ms
  }

  // Измерение времени отклика API
  private measureAPIResponseTime(): number {
    // Симуляция измерения времени отклика API
    return Math.random() * 500 + 100; // 100-600ms
  }

  // Измерение использования памяти
  private measureMemoryUsage(): number {
    if (typeof window !== 'undefined' && (window.performance as any).memory) {
      const memory = (window.performance as any).memory;
      return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }
    
    // Симуляция для серверной среды
    return Math.random() * 40 + 20; // 20-60%
  }

  // Измерение использования CPU
  private measureCPUUsage(): number {
    // Симуляция измерения CPU (в реальности требует нативных API)
    return Math.random() * 30 + 10; // 10-40%
  }

  // Измерение сетевой латентности
  private measureNetworkLatency(): number {
    // Симуляция измерения латентности
    return Math.random() * 200 + 50; // 50-250ms
  }

  // Расчет частоты ошибок
  private calculateErrorRate(): number {
    // Симуляция расчета частоты ошибок
    return Math.random() * 3; // 0-3%
  }

  // Подсчет активных пользователей
  private countActiveUsers(): number {
    // Симуляция подсчета активных пользователей
    return Math.floor(Math.random() * 100 + 10); // 10-110 пользователей
  }

  // Проверка алертов
  private checkAlerts(metrics: RealTimeMetrics): void {
    if (!this.config.enableRealTimeAlerts) return;

    const thresholds = this.config.alertThresholds;

    // Проверка времени загрузки страницы
    if (metrics.pageLoadTime > thresholds.pageLoadTime) {
      this.createAlert('critical', 'pageLoadTime', metrics.pageLoadTime, thresholds.pageLoadTime);
    }

    // Проверка времени отклика API
    if (metrics.apiResponseTime > thresholds.apiResponseTime) {
      this.createAlert('warning', 'apiResponseTime', metrics.apiResponseTime, thresholds.apiResponseTime);
    }

    // Проверка использования памяти
    if (metrics.memoryUsage > thresholds.memoryUsage) {
      this.createAlert('warning', 'memoryUsage', metrics.memoryUsage, thresholds.memoryUsage);
    }

    // Проверка использования CPU
    if (metrics.cpuUsage > thresholds.cpuUsage) {
      this.createAlert('critical', 'cpuUsage', metrics.cpuUsage, thresholds.cpuUsage);
    }

    // Проверка частоты ошибок
    if (metrics.errorRate > thresholds.errorRate) {
      this.createAlert('critical', 'errorRate', metrics.errorRate, thresholds.errorRate);
    }
  }

  // Создание алерта
  private createAlert(type: 'warning' | 'critical', metric: string, value: number, threshold: number): void {
    const alert: Alert = {
      id: `${metric}-${Date.now()}`,
      type,
      metric,
      value,
      threshold,
      timestamp: Date.now(),
      resolved: false
    };

    this.alerts.push(alert);
    
    const emoji = type === 'critical' ? '🚨' : '⚠️';
    console.log(`${emoji} АЛЕРТ: ${metric} = ${value.toFixed(2)} (порог: ${threshold})`);
  }

  // Получение текущих метрик
  getCurrentMetrics(): RealTimeMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  // Получение исторических данных
  getHistoricalData(hours: number = 1): RealTimeMetrics[] {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    return this.metrics.filter(metric => metric.timestamp > cutoffTime);
  }

  // Получение активных алертов
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  // Разрешение алерта
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`✅ Алерт ${alertId} разрешен`);
      return true;
    }
    return false;
  }

  // Генерация отчета о производительности
  generatePerformanceReport(): any {
    const currentMetrics = this.getCurrentMetrics();
    const historicalData = this.getHistoricalData(24); // Последние 24 часа
    const activeAlerts = this.getActiveAlerts();

    console.log('\n📊 ОТЧЕТ О ПРОИЗВОДИТЕЛЬНОСТИ');
    console.log('=' .repeat(50));

    if (currentMetrics) {
      console.log('📈 Текущие метрики:');
      console.log(`  • Время загрузки страницы: ${currentMetrics.pageLoadTime.toFixed(0)}ms`);
      console.log(`  • Время отклика API: ${currentMetrics.apiResponseTime.toFixed(0)}ms`);
      console.log(`  • Использование памяти: ${currentMetrics.memoryUsage.toFixed(1)}%`);
      console.log(`  • Использование CPU: ${currentMetrics.cpuUsage.toFixed(1)}%`);
      console.log(`  • Сетевая латентность: ${currentMetrics.networkLatency.toFixed(0)}ms`);
      console.log(`  • Частота ошибок: ${currentMetrics.errorRate.toFixed(2)}%`);
      console.log(`  • Активные пользователи: ${currentMetrics.activeUsers}`);
    }

    console.log(`\n📊 Статистика за 24 часа:`);
    console.log(`  • Собрано метрик: ${historicalData.length}`);
    console.log(`  • Активных алертов: ${activeAlerts.length}`);

    if (activeAlerts.length > 0) {
      console.log('\n🚨 Активные алерты:');
      activeAlerts.forEach(alert => {
        const timeAgo = Math.floor((Date.now() - alert.timestamp) / 60000);
        console.log(`  • ${alert.type.toUpperCase()}: ${alert.metric} (${timeAgo} мин назад)`);
      });
    }

    return {
      current: currentMetrics,
      historical: historicalData,
      alerts: activeAlerts,
      config: this.config
    };
  }

  // Логирование метрик (для отладки)
  private logMetrics(metrics: RealTimeMetrics): void {
    const time = new Date(metrics.timestamp).toLocaleTimeString();
    console.log(`[${time}] Load: ${metrics.pageLoadTime.toFixed(0)}ms | API: ${metrics.apiResponseTime.toFixed(0)}ms | Mem: ${metrics.memoryUsage.toFixed(1)}%`);
  }

  // Очистка старых метрик
  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - (this.config.retentionPeriod * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoffTime);
    
    // Очистка разрешенных алертов старше 24 часов
    const alertCutoff = Date.now() - (24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(alert => 
      !alert.resolved || alert.timestamp > alertCutoff
    );
  }
}

// Запуск системы мониторинга
export function startPerformanceMonitoring() {
  console.log('🚀 Инициализация системы мониторинга производительности...\n');

  const config: MonitoringConfig = {
    samplingInterval: 5000, // 5 секунд
    alertThresholds: {
      pageLoadTime: 3000, // 3 секунды
      apiResponseTime: 1000, // 1 секунда
      memoryUsage: 80, // 80%
      cpuUsage: 70, // 70%
      errorRate: 5 // 5%
    },
    enableRealTimeAlerts: true,
    enableDataCollection: true,
    retentionPeriod: 72 // 72 часа
  };

  const monitor = new PerformanceMonitor(config);

  try {
    monitor.start();
    
    // Демонстрация работы в течение короткого времени
    setTimeout(() => {
      const report = monitor.generatePerformanceReport();
      console.log('\n🎉 Демонстрация мониторинга завершена!');
      
      // В реальном приложении мониторинг продолжает работать
      // monitor.stop();
    }, 10000); // 10 секунд демонстрации

    return monitor;

  } catch (error) {
    console.error('❌ Ошибка при запуске мониторинга:', error);
    return null;
  }
}

// Запуск в Node.js окружении
if (typeof window === 'undefined') {
  startPerformanceMonitoring();
}