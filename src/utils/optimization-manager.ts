/**
 * Главный модуль оптимизации LogiCalc
 * Объединяет все системы оптимизации и мониторинга
 */

import { runOptimization } from './optimization';
import { setupCDN } from './cdn-setup';
import { startPerformanceMonitoring } from './performance-monitoring';

// Результаты полной оптимизации
interface OptimizationResults {
  resourceOptimization: any;
  cdnSetup: any;
  performanceMonitoring: any;
  overallScore: number;
  recommendations: string[];
  timestamp: string;
}

// Конфигурация для полной оптимизации
interface FullOptimizationConfig {
  enableResourceOptimization: boolean;
  enableCDN: boolean;
  enablePerformanceMonitoring: boolean;
  enableAutomaticOptimization: boolean;
}

// Менеджер полной оптимизации
export class OptimizationManager {
  private config: FullOptimizationConfig;
  private results: Partial<OptimizationResults> = {};

  constructor(config: FullOptimizationConfig) {
    this.config = config;
  }

  // Запуск полной оптимизации
  async runFullOptimization(): Promise<OptimizationResults> {
    console.log('🚀 ЗАПУСК ПОЛНОЙ ОПТИМИЗАЦИИ LOGICALC');
    console.log('=' .repeat(60));
    console.log(`🕒 Время начала: ${new Date().toLocaleString()}\n`);

    const startTime = performance.now();

    try {
      // 1. Оптимизация ресурсов
      if (this.config.enableResourceOptimization) {
        console.log('1️⃣ ОПТИМИЗАЦИЯ РЕСУРСОВ');
        console.log('-' .repeat(40));
        this.results.resourceOptimization = await runOptimization();
        console.log('✅ Оптимизация ресурсов завершена\n');
      }

      // 2. Настройка CDN
      if (this.config.enableCDN) {
        console.log('2️⃣ НАСТРОЙКА CDN');
        console.log('-' .repeat(40));
        this.results.cdnSetup = await setupCDN();
        console.log('✅ Настройка CDN завершена\n');
      }

      // 3. Запуск мониторинга производительности
      if (this.config.enablePerformanceMonitoring) {
        console.log('3️⃣ СИСТЕМА МОНИТОРИНГА');
        console.log('-' .repeat(40));
        this.results.performanceMonitoring = startPerformanceMonitoring();
        console.log('✅ Мониторинг производительности запущен\n');
      }

      // 4. Генерация итогового отчета
      const endTime = performance.now();
      const duration = endTime - startTime;

      const finalResults = this.generateFinalReport(duration);
      
      console.log('🎉 ПОЛНАЯ ОПТИМИЗАЦИЯ ЗАВЕРШЕНА УСПЕШНО!');
      console.log(`⏱️ Общее время выполнения: ${(duration / 1000).toFixed(2)} секунд`);

      return finalResults;

    } catch (error) {
      console.error('❌ Ошибка при выполнении оптимизации:', error);
      throw error;
    }
  }

  // Генерация итогового отчета
  private generateFinalReport(duration: number): OptimizationResults {
    console.log('📊 ИТОГОВЫЙ ОТЧЕТ ОПТИМИЗАЦИИ');
    console.log('=' .repeat(60));

    // Расчет общей оценки производительности
    const overallScore = this.calculateOverallScore();
    console.log(`🏆 Общая оценка производительности: ${overallScore}/100`);

    // Генерация рекомендаций
    const recommendations = this.generateRecommendations();

    // Статус каждого компонента
    console.log('\n📋 СТАТУС КОМПОНЕНТОВ:');
    console.log('-' .repeat(40));
    console.log(`Оптимизация ресурсов: ${this.results.resourceOptimization ? '✅ ВЫПОЛНЕНА' : '❌ ПРОПУЩЕНА'}`);
    console.log(`Настройка CDN: ${this.results.cdnSetup ? '✅ ВЫПОЛНЕНА' : '❌ ПРОПУЩЕНА'}`);
    console.log(`Мониторинг: ${this.results.performanceMonitoring ? '✅ АКТИВЕН' : '❌ ОТКЛЮЧЕН'}`);

    // Метрики производительности
    if (this.results.resourceOptimization) {
      console.log('\n📈 МЕТРИКИ ОПТИМИЗАЦИИ РЕСУРСОВ:');
      const metrics = this.results.resourceOptimization.metrics;
      if (metrics) {
        console.log(`  • Размер бандла: ${metrics.bundleSize.toFixed(0)} KB`);
        console.log(`  • Время загрузки: ${metrics.loadTime.toFixed(0)} ms`);
        console.log(`  • First Contentful Paint: ${metrics.firstContentfulPaint.toFixed(0)} ms`);
      }
    }

    if (this.results.cdnSetup) {
      console.log('\n🌐 МЕТРИКИ CDN:');
      const cdnMetrics = this.results.cdnSetup.metrics;
      if (cdnMetrics) {
        console.log(`  • Hit Ratio: ${cdnMetrics.hitRatio.toFixed(1)}%`);
        console.log(`  • Время отклика: ${cdnMetrics.averageResponseTime.toFixed(0)} ms`);
        console.log(`  • Экономия трафика: ${cdnMetrics.bandwidthSaved.toFixed(1)}%`);
      }
    }

    // Рекомендации
    if (recommendations.length > 0) {
      console.log('\n💡 РЕКОМЕНДАЦИИ ПО ДАЛЬНЕЙШЕМУ УЛУЧШЕНИЮ:');
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    } else {
      console.log('\n✨ Приложение работает с оптимальной производительностью!');
    }

    // Следующие шаги
    console.log('\n🎯 СЛЕДУЮЩИЕ ШАГИ:');
    console.log('1. Проводить регулярный мониторинг производительности');
    console.log('2. Анализировать метрики пользователей в production');
    console.log('3. Обновлять конфигурацию оптимизации при необходимости');
    console.log('4. Тестировать производительность после каждого обновления');

    const finalResults: OptimizationResults = {
      resourceOptimization: this.results.resourceOptimization,
      cdnSetup: this.results.cdnSetup,
      performanceMonitoring: this.results.performanceMonitoring,
      overallScore,
      recommendations,
      timestamp: new Date().toISOString()
    };

    console.log('\n' + '=' .repeat(60));
    return finalResults;
  }

  // Расчет общей оценки производительности
  private calculateOverallScore(): number {
    let totalScore = 0;
    let components = 0;

    if (this.results.resourceOptimization) {
      totalScore += this.results.resourceOptimization.score || 80;
      components++;
    }

    if (this.results.cdnSetup) {
      totalScore += this.results.cdnSetup.efficiency || 85;
      components++;
    }

    if (this.results.performanceMonitoring) {
      totalScore += 90; // Базовая оценка за активный мониторинг
      components++;
    }

    return components > 0 ? Math.round(totalScore / components) : 0;
  }

  // Генерация общих рекомендаций
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Рекомендации на основе результатов оптимизации ресурсов
    if (this.results.resourceOptimization?.recommendations) {
      recommendations.push(...this.results.resourceOptimization.recommendations);
    }

    // Рекомендации на основе настройки CDN
    if (this.results.cdnSetup?.recommendations) {
      recommendations.push(...this.results.cdnSetup.recommendations);
    }

    // Общие рекомендации
    if (!this.config.enablePerformanceMonitoring) {
      recommendations.push('Включить систему мониторинга производительности для постоянного контроля');
    }

    if (!this.config.enableCDN) {
      recommendations.push('Настроить CDN для ускорения доставки контента пользователям');
    }

    if (!this.config.enableResourceOptimization) {
      recommendations.push('Включить оптимизацию ресурсов для уменьшения размера бандла');
    }

    // Удаление дубликатов
    return [...new Set(recommendations)];
  }

  // Получение текущего статуса оптимизации
  getOptimizationStatus(): any {
    return {
      config: this.config,
      results: this.results,
      timestamp: new Date().toISOString()
    };
  }
}

// Быстрый запуск оптимизации с настройками по умолчанию
export async function quickOptimization() {
  console.log('⚡ Быстрая оптимизация LogiCalc...\n');

  const config: FullOptimizationConfig = {
    enableResourceOptimization: true,
    enableCDN: true,
    enablePerformanceMonitoring: true,
    enableAutomaticOptimization: true
  };

  const manager = new OptimizationManager(config);
  return await manager.runFullOptimization();
}

// Кастомная оптимизация с выбором компонентов
export async function customOptimization(config: FullOptimizationConfig) {
  console.log('🔧 Кастомная оптимизация LogiCalc...\n');
  
  const manager = new OptimizationManager(config);
  return await manager.runFullOptimization();
}

// Экспорт типов для использования в других модулях
export type { OptimizationResults, FullOptimizationConfig };

// Запуск в Node.js окружении
if (typeof window === 'undefined' && require.main === module) {
  const optimizationType = process.argv[2] || 'quick';
  
  if (optimizationType === 'quick') {
    quickOptimization();
  } else if (optimizationType === 'custom') {
    // Пример кастомной конфигурации
    const customConfig: FullOptimizationConfig = {
      enableResourceOptimization: true,
      enableCDN: false, // Отключаем CDN
      enablePerformanceMonitoring: true,
      enableAutomaticOptimization: false
    };
    customOptimization(customConfig);
  }
}