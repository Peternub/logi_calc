// Компонент для тестирования парсинга Wildberries
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'

interface WBProduct {
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

export function WBTestParser() {
  const [url, setUrl] = useState('https://www.wildberries.ru/catalog/parfyeriya-i-kosmetika/ukhod-za-litsom/tonizatory')
  const [category, setCategory] = useState('Парфюмерия и косметика/Уход за лицом/Тонизирующие средства')
  const [limit, setLimit] = useState(5)
  const [proxiesFile, setProxiesFile] = useState('') // Добавляем состояние для файла с прокси
  const [saveToDB, setSaveToDB] = useState(false) // Флаг для сохранения в БД
  const [accountId, setAccountId] = useState('') // ID аккаунта Wildberries
  const [products, setProducts] = useState<WBProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleParse = async () => {
    // Проверяем account_id только если нужно сохранять в БД
    if (saveToDB && !accountId) {
      setError('Пожалуйста, введите ID аккаунта Wildberries для сохранения в базу данных')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)
    setProducts([])
    
    try {
      // Вызываем API для запуска парсинга
      const response = await fetch('/api/marketplace-accounts/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: saveToDB ? accountId : undefined,
          url,
          category,
          limit,
          proxies_file: proxiesFile, // Передаем файл с прокси если указан
          save_to_db: saveToDB // Флаг для сохранения в БД
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при запуске парсинга')
      }

      // Показываем сообщение об успешном запуске
      setSuccessMessage(data.message || 'Парсинг успешно запущен')
      
      // Если в ответе есть продукты, отображаем их
      if (data.products) {
        setProducts(data.products)
      }
    } catch (err) {
      setError('Ошибка при запуске парсинга: ' + (err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Тест парсинга Wildberries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL категории</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.wildberries.ru/catalog/..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Парфюмерия и косметика/Уход за лицом"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="limit">Лимит товаров</Label>
              <Input
                id="limit"
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                min="1"
                max="1000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proxiesFile">Файл с прокси (опционально)</Label>
              <Input
                id="proxiesFile"
                value={proxiesFile}
                onChange={(e) => setProxiesFile(e.target.value)}
                placeholder="Путь к файлу с прокси (например, market_parser.py/proxies.json)"
              />
            </div>
            
            <div className="space-y-2 md:col-span-4 flex items-center space-x-2">
              <input
                id="saveToDB"
                type="checkbox"
                checked={saveToDB}
                onChange={(e) => setSaveToDB(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="saveToDB">Сохранить результаты в базу данных</Label>
            </div>
            
            {saveToDB && (
              <div className="space-y-2 md:col-span-4">
                <Label htmlFor="accountId">ID аккаунта Wildberries (требуется для сохранения)</Label>
                <Input
                  id="accountId"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="Введите ID аккаунта"
                />
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleParse} 
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? 'Парсинг запущен...' : 'Запустить парсинг'}
          </Button>
          
          {error && (
            <div className="text-red-500 p-3 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="text-green-500 p-3 bg-green-50 rounded-md">
              {successMessage}
            </div>
          )}
          
          <div className="text-sm text-muted-foreground mt-4">
            <p><strong>Важно:</strong> Wildberries активно защищается от автоматизированного парсинга.</p>
            <p>Если парсинг не работает, это может быть связано с блокировкой со стороны маркетплейса.</p>
            <p className="mt-2"><strong>Рекомендации:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Используйте файл с прокси для обхода блокировок</li>
              <li>Увеличьте паузы между запросами</li>
              <li>Избегайте частых запросов</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Результаты парсинга ({products.length} товаров)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Скидка</TableHead>
                    <TableHead>Рейтинг</TableHead>
                    <TableHead>Отзывы</TableHead>
                    <TableHead>Наличие</TableHead>
                    <TableHead>Продавец</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Бренд</TableHead>
                    <TableHead>Артикул</TableHead>
                    <TableHead>Ссылка</TableHead>
                    <TableHead>Изображение</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium max-w-xs truncate">{product.Название}</TableCell>
                      <TableCell>{product.Цена}</TableCell>
                      <TableCell>{product.Скидка}</TableCell>
                      <TableCell>{product.Рейтинг}</TableCell>
                      <TableCell>{product.Отзывы}</TableCell>
                      <TableCell>{product.Наличие}</TableCell>
                      <TableCell>{product.Продавец}</TableCell>
                      <TableCell>{product.Категория}</TableCell>
                      <TableCell>{product.Бренд}</TableCell>
                      <TableCell>{product.Артикул}</TableCell>
                      <TableCell>
                        <a 
                          href={product.Ссылка} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Открыть
                        </a>
                      </TableCell>
                      <TableCell>
                        {product.Изображение ? (
                          <img 
                            src={product.Изображение} 
                            alt={product.Название}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        ) : (
                          'Нет'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}