// Сервис для работы с Python парсером Wildberries
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as xlsx from 'xlsx' // Для чтения Excel файлов
import { createServerSupabaseClient } from '@/lib/supabase'

const execPromise = promisify(exec)

interface WBProductData {
  Название: string
  Цена: string
  Скидка: string
  Рейтинг: string
  Отзывы: string
  Наличие: string
  Продавец: string
  Категория: string
  Бренд: string
  Артикул: string
  Ссылка: string
  Изображение: string
}

interface ParseOptions {
  url: string
  category?: string
  limit?: number
  proxiesFile?: string // Добавляем поддержку файла с прокси
}

export class WildberriesParserService {
  private pythonScriptPath: string
  private resultsDirectory: string
  private proxiesFilePath: string // Путь к файлу с прокси

  constructor() {
    this.pythonScriptPath = path.join(process.cwd(), 'market_parser.py', 'wb_full_parser.py.txt')
    this.resultsDirectory = path.join(process.cwd(), 'tmp')
    this.proxiesFilePath = path.join(process.cwd(), 'market_parser.py', 'proxies.json') // Путь к файлу прокси по умолчанию
  }

  // Проверка наличия Python скрипта
  async isParserAvailable(): Promise<boolean> {
    try {
      await fs.access(this.pythonScriptPath)
      return true
    } catch {
      return false
    }
  }

  // Запуск парсинга Wildberries
  async parseCategory(options: ParseOptions): Promise<{ success: boolean; message: string; resultFile: string }> {
    try {
      // Проверяем наличие Python скрипта
      if (!(await this.isParserAvailable())) {
        throw new Error('Python скрипт парсера Wildberries не найден')
      }

      // Создаем директорию для результатов если её нет
      try {
        await fs.access(this.resultsDirectory)
      } catch {
        await fs.mkdir(this.resultsDirectory, { recursive: true })
      }

      // Проверяем наличие файла с прокси если указан
      let proxiesFile = ''
      if (options.proxiesFile) {
        try {
          await fs.access(options.proxiesFile)
          proxiesFile = options.proxiesFile
        } catch {
          console.warn('Файл с прокси не найден, продолжаем без прокси')
        }
      } else {
        // Проверяем файл прокси по умолчанию
        try {
          await fs.access(this.proxiesFilePath)
          proxiesFile = this.proxiesFilePath
        } catch {
          console.log('Файл с прокси по умолчанию не найден')
        }
      }

      // Формируем команду для запуска Python скрипта
      const command = [
        'python',
        `"${this.pythonScriptPath}"`,
        `--url "${options.url}"`,
        options.category ? `--category "${options.category}"` : '',
        options.limit ? `--limit ${options.limit}` : '',
        proxiesFile ? `--proxies-file "${proxiesFile}"` : ''
      ].filter(Boolean).join(' ')

      console.log(`Запуск парсинга Wildberries: ${command}`)

      // Запускаем Python скрипт с автоматическим подтверждением
      const { stdout, stderr } = await execPromise(`echo y | ${command}`, {
        cwd: process.cwd(),
        timeout: 300000 // 5 минут таймаут
      })

      if (stderr) {
        console.error('Ошибка при выполнении Python скрипта:', stderr)
        // Проверяем, содержит ли ошибка информацию о блокировке
        if (stderr.includes('498') || stderr.includes('blocked') || stderr.includes('captcha')) {
          throw new Error('Wildberries заблокировал запрос как подозрительный')
        }
      }

      console.log('Результаты парсинга:', stdout)
      
      // Проверяем, были ли ошибки в stdout
      if (stdout.includes('HTTP 498') || stdout.includes('blocked') || stdout.includes('captcha')) {
        throw new Error('Wildberries заблокировал запрос как подозрительный')
      }
      
      // Возвращаем путь к файлу с результатами
      const resultFile = path.join(process.cwd(), 'result.xlsx')
      return {
        success: true,
        message: 'Парсинг завершен успешно',
        resultFile
      }

    } catch (error: any) {
      console.error('Ошибка при парсинге Wildberries:', error)
      
      // Проверяем, является ли ошибка блокировкой от Wildberries
      if (error.message.includes('498') || error.message.includes('blocked') || error.message.includes('captcha')) {
        throw new Error('Wildberries заблокировал запрос как подозрительный. Это нормальное поведение маркетплейса.')
      }
      
      throw new Error(`Не удалось выполнить парсинг: ${error.message}`)
    }
  }

  // Чтение результатов парсинга из Excel файла
  async readParsedData(filePath: string): Promise<{ success: boolean; message: string; products: WBProductData[] }> {
    try {
      // Проверяем наличие файла с результатами
      try {
        await fs.access(filePath)
      } catch {
        throw new Error('Файл с результатами парсинга не найден')
      }

      // Читаем Excel файл
      const workbook = xlsx.readFile(filePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      // Преобразуем данные в JSON
      const jsonData: any[] = xlsx.utils.sheet_to_json(worksheet)
      
      // Преобразуем данные в нужный формат
      const products: WBProductData[] = jsonData.map(row => ({
        Название: row['Название'] || '',
        Цена: row['Цена'] || '',
        Скидка: row['Скидка'] || '',
        Рейтинг: row['Рейтинг'] || '',
        Отзывы: row['Отзывы'] || '',
        Наличие: row['Наличие'] || '',
        Продавец: row['Продавец'] || '',
        Категория: row['Категория'] || '',
        Бренд: row['Бренд'] || '',
        Артикул: row['Артикул'] || '',
        Ссылка: row['Ссылка'] || '',
        Изображение: row['Изображение'] || ''
      }))
      
      return {
        success: true,
        message: `Успешно прочитано ${products.length} товаров`,
        products
      }
    } catch (error: any) {
      console.error('Ошибка при чтении данных парсинга:', error)
      return {
        success: false,
        message: `Не удалось прочитать данные: ${error.message}`,
        products: []
      }
    }
  }

  // Чтение результатов парсинга и сохранение в БД
  async saveParsedData(filePath: string, accountId: string): Promise<{ success: boolean; message: string; parsedCount: number }> {
    try {
      // Проверяем наличие файла с результатами
      try {
        await fs.access(filePath)
      } catch {
        throw new Error('Файл с результатами парсинга не найден')
      }

      // Читаем данные из Excel файла
      const readResult = await this.readParsedData(filePath)
      
      if (!readResult.success) {
        throw new Error(readResult.message)
      }

      // Сохраняем данные в БД
      const supabase = await createServerSupabaseClient()
      
      let savedCount = 0
      for (const product of readResult.products) {
        try {
          // Проверяем, существует ли товар
          const { data: existingProduct } = await supabase
            .from('products')
            .select('id')
            .eq('marketplace_account_id', accountId)
            .eq('marketplace_product_id', product.Артикул)
            .single()

          if (existingProduct) {
            // Обновляем существующий товар
            await supabase
              .from('products')
              .update({
                name: product.Название,
                price: parseFloat(product.Цена.replace(/[^\d.,]/g, '')) || 0,
                stock_quantity: 0, // TODO: Получить реальное количество из остатков
                available_quantity: 0, // TODO: Получить реальное количество из остатков
                category_name: product.Категория,
                brand: product.Бренд,
                is_active: product.Наличие.includes('в наличии') ? true : false,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingProduct.id)
          } else {
            // Создаем новый товар
            await supabase
              .from('products')
              .insert({
                marketplace_account_id: accountId,
                marketplace_product_id: product.Артикул,
                marketplace: 'wildberries',
                name: product.Название,
                sku: product.Артикул,
                price: parseFloat(product.Цена.replace(/[^\d.,]/g, '')) || 0,
                stock_quantity: 0, // TODO: Получить реальное количество из остатков
                available_quantity: 0, // TODO: Получить реальное количество из остатков
                category_name: product.Категория,
                brand: product.Бренд,
                currency: 'RUB',
                is_active: product.Наличие.includes('в наличии') ? true : false,
                last_sync: new Date().toISOString()
              })
          }
          
          savedCount++
        } catch (productError) {
          console.error(`Ошибка сохранения товара ${product.Артикул}:`, productError)
          // Продолжаем с другими товарами
        }
      }
      
      return {
        success: true,
        message: `Успешно сохранено ${savedCount} товаров`,
        parsedCount: savedCount
      }
    } catch (error: any) {
      console.error('Ошибка при сохранении данных парсинга:', error)
      return {
        success: false,
        message: `Не удалось сохранить данные: ${error.message}`,
        parsedCount: 0
      }
    }
  }

  // Комплексный метод для парсинга и сохранения данных
  async parseAndSave(options: ParseOptions, accountId: string): Promise<{ success: boolean; message: string; parsedCount: number; products?: WBProductData[] }> {
    try {
      // Запускаем парсинг
      const parseResult = await this.parseCategory(options)
      
      if (!parseResult.success) {
        return {
          success: false,
          message: parseResult.message,
          parsedCount: 0
        }
      }
      
      // Читаем данные из файла результатов
      const readResult = await this.readParsedData(parseResult.resultFile)
      
      if (!readResult.success) {
        return {
          success: false,
          message: readResult.message,
          parsedCount: 0
        }
      }
      
      // Сохраняем данные в БД
      const saveResult = await this.saveParsedData(parseResult.resultFile, accountId)
      
      return {
        success: saveResult.success,
        message: saveResult.message,
        parsedCount: saveResult.parsedCount,
        products: readResult.products
      }
    } catch (error: any) {
      console.error('Ошибка при парсинге и сохранении данных:', error)
      
      // Проверяем, является ли ошибка блокировкой от Wildberries
      if (error.message.includes('498') || error.message.includes('blocked') || error.message.includes('captcha')) {
        return {
          success: false,
          message: 'Wildberries заблокировал запрос как подозрительный. Это нормальное поведение маркетплейса. Попробуйте позже или используйте другой подход.',
          parsedCount: 0
        }
      }
      
      return {
        success: false,
        message: `Ошибка: ${error.message}`,
        parsedCount: 0
      }
    }
  }
}

export const wildberriesParserService = new WildberriesParserService()