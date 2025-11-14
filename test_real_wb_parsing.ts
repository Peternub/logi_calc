// Тестовый скрипт для проверки реального парсинга Wildberries
import { wildberriesParserService } from './src/lib/wildberries-parser'

async function testRealWBParse() {
  console.log('Тестирование реального парсинга Wildberries...')
  
  // Проверяем доступность парсера
  const isAvailable = await wildberriesParserService.isParserAvailable()
  console.log(`Парсер доступен: ${isAvailable}`)
  
  if (!isAvailable) {
    console.log('Python парсер не найден. Убедитесь, что файл market_parser.py/wb_full_parser.py.txt существует.')
    return
  }
  
  try {
    // Запускаем парсинг категории "Рив Гош"
    console.log('Запуск парсинга категории "Рив Гош"...')
    const result = await wildberriesParserService.parseAndSave({
      url: 'https://www.wildberries.ru/catalog/krasota-i-zdorove/uhod-za-polostyu-rta/zubnye-pasty', // Пример категории
      category: 'Красота и здоровье/Уход за полостью рта/Зубные пасты',
      limit: 20
    }, 'test-account-id') // Тестовый ID аккаунта
    
    console.log('Результат парсинга:')
    console.log(JSON.stringify(result, null, 2))
    
    if (result.success && result.products) {
      console.log(`\nСпарсено ${result.products.length} товаров:`)
      result.products.slice(0, 5).forEach((product, index) => {
        console.log(`${index + 1}. ${product.Название} - ${product.Цена}`)
      })
    }
  } catch (error) {
    console.error('Ошибка при тестировании парсинга:', error)
  }
}

testRealWBParse().catch(console.error)