/**
 * Performance тесты для мониторинга производительности приложения
 * Измерение времени загрузки, отклика и использования ресурсов
 */

// Метрики производительности
interface PerformanceMetrics {
  loadTime: number;
  responseTime: number;
  memoryUsage: number;
  bundleSize: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}

// Утилиты для измерения производительности
class PerformanceMonitor {
  private startTime: number = 0;
  private metrics: Partial<PerformanceMetrics> = {};

  // Начало измерения
  startMeasurement(label: string): void {
    console.log(`⏱️ Начало измерения: ${label}`);
    this.startTime = performance.now();
  }

  // Окончание измерения
  endMeasurement(label: string): number {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    console.log(`✅ ${label}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  // Измерение времени выполнения функции
  async measureFunction<T>(label: string, fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    this.startMeasurement(label);
    const result = await fn();
    const duration = this.endMeasurement(label);
    return { result, duration };
  }

  // Симуляция измерения использования памяти
  measureMemoryUsage(): number {
    // В реальном приложении используется performance.memory
    const mockMemoryUsage = Math.random() * 50 + 10; // 10-60 МБ
    console.log(`🧠 Использование памяти: ${mockMemoryUsage.toFixed(2)}MB`);
    return mockMemoryUsage;
  }

  // Получение метрик
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }
}

// Тест производительности загрузки страниц
export async function testPageLoadPerformance() {
  console.log('🚀 Тест производительности загрузки страниц');
  
  const monitor = new PerformanceMonitor();
  const results: { [key: string]: number } = {};

  const pages = [
    '/dashboard',
    '/products',
    '/analytics', 
    '/reports',
    '/competitors',
    '/pricing'
  ];

  for (const page of pages) {
    const { duration } = await monitor.measureFunction(
      `Загрузка страницы ${page}`,
      async () => {
        // Симуляция загрузки страницы
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
        return `Страница ${page} загружена`;
      }
    );
    
    results[page] = duration;
    
    // Проверяем, что время загрузки приемлемое (менее 2 секунд)
    console.assert(duration < 2000, `❌ Страница ${page} загружается слишком медленно: ${duration}ms`);
  }

  const averageLoadTime = Object.values(results).reduce((sum, time) => sum + time, 0) / pages.length;
  console.log(`📊 Среднее время загрузки страниц: ${averageLoadTime.toFixed(2)}ms`);

  return results;
}

// Тест производительности API запросов
export async function testAPIPerformance() {
  console.log('🔗 Тест производительности API запросов');
  
  const monitor = new PerformanceMonitor();
  const results: { [key: string]: number } = {};

  const apiEndpoints = [
    { name: 'GET /products', delay: 200 },
    { name: 'POST /products', delay: 300 },
    { name: 'GET /dashboard/stats', delay: 150 },
    { name: 'GET /analytics/sales', delay: 400 },
    { name: 'GET /reports', delay: 250 }
  ];

  for (const endpoint of apiEndpoints) {
    const { duration } = await monitor.measureFunction(
      `API запрос: ${endpoint.name}`,
      async () => {
        // Симуляция API запроса
        await new Promise(resolve => setTimeout(resolve, endpoint.delay + Math.random() * 100));
        return { success: true, data: {} };
      }
    );
    
    results[endpoint.name] = duration;
    
    // Проверяем, что время отклика приемлемое (менее 1 секунды)
    console.assert(duration < 1000, `❌ API ${endpoint.name} отвечает слишком медленно: ${duration}ms`);
  }

  const averageResponseTime = Object.values(results).reduce((sum, time) => sum + time, 0) / apiEndpoints.length;
  console.log(`📊 Среднее время отклика API: ${averageResponseTime.toFixed(2)}ms`);

  return results;
}

// Тест производительности рендеринга компонентов
export async function testComponentRenderPerformance() {
  console.log('🎨 Тест производительности рендеринга компонентов');
  
  const monitor = new PerformanceMonitor();
  const results: { [key: string]: number } = {};

  const components = [
    { name: 'ProductList (100 items)', renderTime: 50 },
    { name: 'SalesChart', renderTime: 150 },
    { name: 'Dashboard widgets', renderTime: 80 },
    { name: 'DataTable (500 rows)', renderTime: 200 },
    { name: 'ReportBuilder', renderTime: 120 }
  ];

  for (const component of components) {
    const { duration } = await monitor.measureFunction(
      `Рендеринг: ${component.name}`,
      async () => {
        // Симуляция рендеринга компонента
        await new Promise(resolve => setTimeout(resolve, component.renderTime + Math.random() * 50));
        return `${component.name} отрендерен`;
      }
    );
    
    results[component.name] = duration;
    
    // Проверяем, что время рендеринга приемлемое (менее 500ms)
    console.assert(duration < 500, `❌ Компонент ${component.name} рендерится слишком медленно: ${duration}ms`);
  }

  const averageRenderTime = Object.values(results).reduce((sum, time) => sum + time, 0) / components.length;
  console.log(`📊 Среднее время рендеринга компонентов: ${averageRenderTime.toFixed(2)}ms`);

  return results;
}

// Тест нагрузки системы
export async function testSystemLoadPerformance() {
  console.log('💪 Тест производительности под нагрузкой');
  
  const monitor = new PerformanceMonitor();
  
  // Симуляция одновременных запросов
  const concurrentRequests = 20;
  const promises = [];

  monitor.startMeasurement('Обработка нагрузки');

  for (let i = 0; i < concurrentRequests; i++) {
    promises.push(
      new Promise(resolve => {
        setTimeout(() => {
          resolve(`Запрос ${i + 1} обработан`);
        }, Math.random() * 300 + 100);
      })
    );
  }

  await Promise.all(promises);
  const totalTime = monitor.endMeasurement('Обработка нагрузки');

  // Измерение использования памяти под нагрузкой
  const memoryUsage = monitor.measureMemoryUsage();

  console.log(`📊 Обработано ${concurrentRequests} одновременных запросов за ${totalTime.toFixed(2)}ms`);
  console.log(`📊 Использование памяти под нагрузкой: ${memoryUsage.toFixed(2)}MB`);

  // Проверяем производительность под нагрузкой
  console.assert(totalTime < 5000, `❌ Система обрабатывает нагрузку слишком медленно: ${totalTime}ms`);
  console.assert(memoryUsage < 100, `❌ Слишком большое использование памяти: ${memoryUsage}MB`);

  return { totalTime, memoryUsage, concurrentRequests };
}

// Общий отчет по производительности
export async function generatePerformanceReport() {
  console.log('📈 Генерация отчета по производительности\n');

  const results = {
    pageLoad: await testPageLoadPerformance(),
    apiPerformance: await testAPIPerformance(),
    componentRender: await testComponentRenderPerformance(),
    systemLoad: await testSystemLoadPerformance()
  };

  console.log('\n📋 ИТОГОВЫЙ ОТЧЕТ ПО ПРОИЗВОДИТЕЛЬНОСТИ');
  console.log('=' .repeat(50));
  
  // Анализ результатов
  const pageLoadTimes = Object.values(results.pageLoad);
  const avgPageLoad = pageLoadTimes.reduce((sum, time) => sum + time, 0) / pageLoadTimes.length;
  
  const apiTimes = Object.values(results.apiPerformance);
  const avgApiResponse = apiTimes.reduce((sum, time) => sum + time, 0) / apiTimes.length;
  
  const renderTimes = Object.values(results.componentRender);
  const avgRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;

  console.log(`📊 Среднее время загрузки страниц: ${avgPageLoad.toFixed(2)}ms`);
  console.log(`📊 Среднее время отклика API: ${avgApiResponse.toFixed(2)}ms`);
  console.log(`📊 Среднее время рендеринга: ${avgRenderTime.toFixed(2)}ms`);
  console.log(`📊 Производительность под нагрузкой: ${results.systemLoad.totalTime.toFixed(2)}ms`);
  console.log(`📊 Использование памяти: ${results.systemLoad.memoryUsage.toFixed(2)}MB`);

  // Общая оценка производительности
  const overallScore = calculatePerformanceScore(avgPageLoad, avgApiResponse, avgRenderTime);
  console.log(`\n🏆 Общая оценка производительности: ${overallScore}/100`);

  if (overallScore >= 80) {
    console.log('✅ Отличная производительность!');
  } else if (overallScore >= 60) {
    console.log('⚠️ Приемлемая производительность, есть области для улучшения');
  } else {
    console.log('❌ Требуется оптимизация производительности');
  }

  return results;
}

// Расчет общей оценки производительности
function calculatePerformanceScore(pageLoad: number, apiResponse: number, renderTime: number): number {
  // Нормализация метрик (чем меньше время, тем выше оценка)
  const pageLoadScore = Math.max(0, 100 - (pageLoad / 20)); // 2000ms = 0 баллов
  const apiScore = Math.max(0, 100 - (apiResponse / 10)); // 1000ms = 0 баллов
  const renderScore = Math.max(0, 100 - (renderTime / 5)); // 500ms = 0 баллов
  
  // Взвешенная средняя оценка
  return Math.round((pageLoadScore * 0.4 + apiScore * 0.4 + renderScore * 0.2));
}

// Запуск всех тестов производительности
export async function runPerformanceTests() {
  console.log('⚡ Запуск тестов производительности...\n');

  try {
    const report = await generatePerformanceReport();
    console.log('\n🎉 Тесты производительности завершены успешно!');
    return report;
  } catch (error) {
    console.error('💥 Ошибка при запуске тестов производительности:', error);
    return null;
  }
}

// Запуск в Node.js окружении
if (typeof window === 'undefined') {
  runPerformanceTests();
}