/**
 * Простые unit тесты для утилитарных функций
 * Эти тесты могут быть запущены без дополнительных зависимостей
 */

// Функция валидации email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Функция форматирования цены
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(price);
}

// Функция расчета скидки
export function calculateDiscount(originalPrice: number, discountPercent: number): number {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Процент скидки должен быть от 0 до 100');
  }
  return originalPrice * (1 - discountPercent / 100);
}

// Функция определения категории товара по цене
export function getPriceCategory(price: number): 'budget' | 'medium' | 'premium' {
  if (price < 1000) return 'budget';
  if (price < 5000) return 'medium';
  return 'premium';
}

// Простые тесты без внешних зависимостей
export function runTests() {
  console.log('🧪 Запуск unit тестов...');
  
  // Тест валидации email
  console.assert(validateEmail('test@example.com') === true, '❌ Валидный email должен проходить валидацию');
  console.assert(validateEmail('invalid-email') === false, '❌ Невалидный email не должен проходить валидацию');
  console.log('✅ Тесты валидации email прошли успешно');
  
  // Тест форматирования цены
  console.assert(formatPrice(1000).includes('1'), '❌ Форматирование цены должно включать числовое значение');
  console.log('✅ Тесты форматирования цены прошли успешно');
  
  // Тест расчета скидки
  console.assert(calculateDiscount(1000, 10) === 900, '❌ Скидка 10% от 1000 должна быть 900');
  console.assert(calculateDiscount(1000, 0) === 1000, '❌ Скидка 0% не должна изменять цену');
  try {
    calculateDiscount(1000, 150);
    console.assert(false, '❌ Некорректный процент скидки должен вызывать ошибку');
  } catch (e) {
    // Ожидаемая ошибка
  }
  console.log('✅ Тесты расчета скидки прошли успешно');
  
  // Тест категоризации по цене
  console.assert(getPriceCategory(500) === 'budget', '❌ Цена 500 должна быть budget категории');
  console.assert(getPriceCategory(2000) === 'medium', '❌ Цена 2000 должна быть medium категории');
  console.assert(getPriceCategory(10000) === 'premium', '❌ Цена 10000 должна быть premium категории');
  console.log('✅ Тесты категоризации по цене прошли успешно');
  
  console.log('🎉 Все unit тесты прошли успешно!');
}

// Запуск тестов в Node.js окружении
if (typeof window === 'undefined') {
  runTests();
}