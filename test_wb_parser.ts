// Тестовый скрипт для проверки работы парсера Wildberries
import { wildberriesParserService } from './src/lib/wildberries-parser'

async function testWBParser() {
  console.log('Тестирование парсера Wildberries...')
  
  // Проверяем доступность парсера
  const isAvailable = await wildberriesParserService.isParserAvailable()
  console.log(`Парсер доступен: ${isAvailable}`)
  
  if (!isAvailable) {
    console.log('Python парсер не найден. Убедитесь, что файл market_parser.py/wb_full_parser.py.txt существует.')
    return
  }
  
  console.log('Парсер готов к использованию. Для тестирования запустите:')
  console.log('POST /api/marketplace-accounts/parse')
  console.log('с параметрами: { account_id, url, category, limit }')
}

testWBParser().catch(console.error)