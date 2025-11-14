/**
 * Главный файл для запуска всех тестов
 * Объединяет unit, integration, e2e и performance тесты
 */

import { runTests } from './test-utils';
import { runAllTests as runIntegrationTests } from './integration-tests';
import { runE2ETests } from './e2e-tests';
import { runPerformanceTests } from './performance-tests';

// Интерфейс результатов тестирования
interface TestResults {
  unit: boolean;
  integration: boolean;
  e2e: boolean;
  performance: any;
  overall: boolean;
  startTime: string;
  endTime: string;
  duration: number;
}

// Запуск всех типов тестов
export async function runAllTestSuites(): Promise<TestResults> {
  const startTime = new Date().toISOString();
  const performanceStart = performance.now();
  
  console.log('🧪 ЗАПУСК ПОЛНОГО НАБОРА ТЕСТОВ');
  console.log('=' .repeat(60));
  console.log(`🕒 Время начала: ${new Date(startTime).toLocaleString()}\n`);

  const results: Partial<TestResults> = {
    startTime
  };

  try {
    // 1. Unit тесты
    console.log('1️⃣ UNIT ТЕСТЫ');
    console.log('-' .repeat(30));
    runTests(); // Синхронная функция
    results.unit = true;
    console.log('✅ Unit тесты завершены\n');

  } catch (error) {
    console.error('❌ Ошибка в unit тестах:', error);
    results.unit = false;
  }

  try {
    // 2. Integration тесты
    console.log('2️⃣ INTEGRATION ТЕСТЫ');
    console.log('-' .repeat(30));
    results.integration = await runIntegrationTests();
    console.log('✅ Integration тесты завершены\n');

  } catch (error) {
    console.error('❌ Ошибка в integration тестах:', error);
    results.integration = false;
  }

  try {
    // 3. E2E тесты
    console.log('3️⃣ END-TO-END ТЕСТЫ');
    console.log('-' .repeat(30));
    results.e2e = await runE2ETests();
    console.log('✅ E2E тесты завершены\n');

  } catch (error) {
    console.error('❌ Ошибка в E2E тестах:', error);
    results.e2e = false;
  }

  try {
    // 4. Performance тесты
    console.log('4️⃣ PERFORMANCE ТЕСТЫ');
    console.log('-' .repeat(30));
    results.performance = await runPerformanceTests();
    console.log('✅ Performance тесты завершены\n');

  } catch (error) {
    console.error('❌ Ошибка в performance тестах:', error);
    results.performance = null;
  }

  // Подсчет общих результатов
  const performanceEnd = performance.now();
  const duration = performanceEnd - performanceStart;
  
  results.endTime = new Date().toISOString();
  results.duration = duration;
  results.overall = Boolean(
    results.unit && 
    results.integration && 
    results.e2e && 
    results.performance
  );

  // Итоговый отчет
  generateFinalReport(results as TestResults);

  return results as TestResults;
}

// Генерация итогового отчета
function generateFinalReport(results: TestResults): void {
  console.log('📊 ИТОГОВЫЙ ОТЧЕТ ТЕСТИРОВАНИЯ');
  console.log('=' .repeat(60));
  
  console.log(`🕒 Время начала: ${new Date(results.startTime).toLocaleString()}`);
  console.log(`🕒 Время окончания: ${new Date(results.endTime).toLocaleString()}`);
  console.log(`⏱️ Общее время выполнения: ${(results.duration / 1000).toFixed(2)} секунд\n`);

  // Статистика по типам тестов
  console.log('📋 РЕЗУЛЬТАТЫ ПО ТИПАМ ТЕСТОВ:');
  console.log('-' .repeat(40));
  console.log(`Unit тесты:        ${results.unit ? '✅ ПРОЙДЕНЫ' : '❌ ПРОВАЛЕНЫ'}`);
  console.log(`Integration тесты: ${results.integration ? '✅ ПРОЙДЕНЫ' : '❌ ПРОВАЛЕНЫ'}`);
  console.log(`E2E тесты:         ${results.e2e ? '✅ ПРОЙДЕНЫ' : '❌ ПРОВАЛЕНЫ'}`);
  console.log(`Performance тесты: ${results.performance ? '✅ ПРОЙДЕНЫ' : '❌ ПРОВАЛЕНЫ'}\n`);

  // Общий результат
  if (results.overall) {
    console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
    console.log('✨ Приложение готово к развертыванию');
  } else {
    console.log('⚠️ НЕКОТОРЫЕ ТЕСТЫ ПРОВАЛИЛИСЬ');
    console.log('🔧 Требуется исправление ошибок перед развертыванием');
    
    // Рекомендации
    console.log('\n💡 РЕКОМЕНДАЦИИ:');
    if (!results.unit) console.log('• Исправить ошибки в unit тестах');
    if (!results.integration) console.log('• Проверить API интеграции');
    if (!results.e2e) console.log('• Исправить критические пользовательские сценарии');
    if (!results.performance) console.log('• Оптимизировать производительность');
  }

  console.log('\n' + '=' .repeat(60));
}

// Функция для быстрого запуска конкретного типа тестов
export async function runTestSuite(type: 'unit' | 'integration' | 'e2e' | 'performance' | 'all') {
  console.log(`🚀 Запуск ${type} тестов...\n`);

  switch (type) {
    case 'unit':
      runTests();
      break;
      
    case 'integration':
      await runIntegrationTests();
      break;
      
    case 'e2e':
      await runE2ETests();
      break;
      
    case 'performance':
      await runPerformanceTests();
      break;
      
    case 'all':
    default:
      await runAllTestSuites();
      break;
  }
}

// Функция для CI/CD пайплайна
export async function runCITests(): Promise<boolean> {
  console.log('🔄 Запуск тестов для CI/CD пайплайна\n');
  
  const results = await runAllTestSuites();
  
  // Возвращаем булевый результат для CI/CD
  if (results.overall) {
    console.log('\n✅ CI/CD: Все тесты пройдены, можно продолжить развертывание');
    process.exit(0);
  } else {
    console.log('\n❌ CI/CD: Тесты провалились, развертывание остановлено');
    process.exit(1);
  }
}

// Запуск тестов при запуске файла напрямую
if (require.main === module) {
  const testType = process.argv[2] as 'unit' | 'integration' | 'e2e' | 'performance' | 'all' | 'ci';
  
  if (testType === 'ci') {
    runCITests();
  } else {
    runTestSuite(testType || 'all');
  }
}