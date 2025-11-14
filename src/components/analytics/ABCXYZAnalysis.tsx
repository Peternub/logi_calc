'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Grid3X3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Search,
  Download
} from 'lucide-react'

interface Product {
  id: string
  name: string
  revenue: number
  sales_volume: number
  coefficient_of_variation: number
  abc_category: 'A' | 'B' | 'C'
  xyz_category: 'X' | 'Y' | 'Z'
  marketplace: string
}

interface ABCXYZAnalysisProps {
  products: Product[]
}

export default function ABCXYZAnalysis({ products }: ABCXYZAnalysisProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'revenue' | 'volume' | 'variation'>('revenue')

  // Демо данные для анализа
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Беспроводные наушники AirPods Pro',
      revenue: 125000,
      sales_volume: 45,
      coefficient_of_variation: 0.15,
      abc_category: 'A',
      xyz_category: 'X',
      marketplace: 'wildberries'
    },
    {
      id: '2',
      name: 'Смартфон iPhone 15 Pro',
      revenue: 180000,
      sales_volume: 20,
      coefficient_of_variation: 0.25,
      abc_category: 'A',
      xyz_category: 'Y',
      marketplace: 'ozon'
    },
    {
      id: '3',
      name: 'Футболка хлопковая базовая',
      revenue: 15000,
      sales_volume: 150,
      coefficient_of_variation: 0.45,
      abc_category: 'B',
      xyz_category: 'Z',
      marketplace: 'yandex_market'
    },
    {
      id: '4',
      name: 'Кроссовки спортивные',
      revenue: 85000,
      sales_volume: 85,
      coefficient_of_variation: 0.20,
      abc_category: 'A',
      xyz_category: 'Y',
      marketplace: 'wildberries'
    },
    {
      id: '5',
      name: 'Рюкзак городской',
      revenue: 35000,
      sales_volume: 70,
      coefficient_of_variation: 0.35,
      abc_category: 'B',
      xyz_category: 'Y',
      marketplace: 'ozon'
    },
    {
      id: '6',
      name: 'Зарядка для телефона',
      revenue: 8000,
      sales_volume: 200,
      coefficient_of_variation: 0.55,
      abc_category: 'C',
      xyz_category: 'Z',
      marketplace: 'wildberries'
    }
  ]

  const [analysisData, setAnalysisData] = useState<Product[]>(mockProducts)

  // Фильтрация данных
  const filteredProducts = analysisData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || 
      product.abc_category === selectedCategory || 
      product.xyz_category === selectedCategory ||
      `${product.abc_category}${product.xyz_category}` === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Сортировка данных
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return b.revenue - a.revenue
      case 'volume':
        return b.sales_volume - a.sales_volume
      case 'variation':
        return a.coefficient_of_variation - b.coefficient_of_variation
      default:
        return 0
    }
  })

  // Получение цвета для категории ABC
  const getABCColor = (category: 'A' | 'B' | 'C') => {
    switch (category) {
      case 'A': return 'bg-green-100 text-green-800'
      case 'B': return 'bg-yellow-100 text-yellow-800'
      case 'C': return 'bg-red-100 text-red-800'
    }
  }

  // Получение цвета для категории XYZ
  const getXYZColor = (category: 'X' | 'Y' | 'Z') => {
    switch (category) {
      case 'X': return 'bg-blue-100 text-blue-800'
      case 'Y': return 'bg-purple-100 text-purple-800'
      case 'Z': return 'bg-orange-100 text-orange-800'
    }
  }

  // Получение иконки и описания для комбинированной категории
  const getCategoryInfo = (abc: string, xyz: string) => {
    const combination = `${abc}${xyz}`
    const descriptions: { [key: string]: { icon: any, title: string, description: string } } = {
      'AX': { icon: CheckCircle, title: 'Звезды', description: 'Высокий доход, стабильные продажи' },
      'AY': { icon: TrendingUp, title: 'Важные', description: 'Высокий доход, средняя стабильность' },
      'AZ': { icon: AlertTriangle, title: 'Проблемные', description: 'Высокий доход, нестабильные продажи' },
      'BX': { icon: CheckCircle, title: 'Стабильные', description: 'Средний доход, стабильные продажи' },
      'BY': { icon: TrendingUp, title: 'Перспективные', description: 'Средний доход, средняя стабильность' },
      'BZ': { icon: AlertTriangle, title: 'Сомнительные', description: 'Средний доход, нестабильные продажи' },
      'CX': { icon: CheckCircle, title: 'Незначительные', description: 'Низкий доход, стабильные продажи' },
      'CY': { icon: TrendingUp, title: 'Кандидаты', description: 'Низкий доход, средняя стабильность' },
      'CZ': { icon: AlertTriangle, title: 'Исключить', description: 'Низкий доход, нестабильные продажи' }
    }
    return descriptions[combination] || { icon: AlertTriangle, title: 'Неопределено', description: 'Требует анализа' }
  }

  // Статистика по категориям
  const categoryStats = {
    AX: filteredProducts.filter(p => p.abc_category === 'A' && p.xyz_category === 'X').length,
    AY: filteredProducts.filter(p => p.abc_category === 'A' && p.xyz_category === 'Y').length,
    AZ: filteredProducts.filter(p => p.abc_category === 'A' && p.xyz_category === 'Z').length,
    BX: filteredProducts.filter(p => p.abc_category === 'B' && p.xyz_category === 'X').length,
    BY: filteredProducts.filter(p => p.abc_category === 'B' && p.xyz_category === 'Y').length,
    BZ: filteredProducts.filter(p => p.abc_category === 'B' && p.xyz_category === 'Z').length,
    CX: filteredProducts.filter(p => p.abc_category === 'C' && p.xyz_category === 'X').length,
    CY: filteredProducts.filter(p => p.abc_category === 'C' && p.xyz_category === 'Y').length,
    CZ: filteredProducts.filter(p => p.abc_category === 'C' && p.xyz_category === 'Z').length,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Grid3X3 className="h-6 w-6 mr-2" />
            ABC/XYZ Анализ
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Классификация товаров по доходности и стабильности продаж
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск товаров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">Все категории</option>
            <option value="A">ABC: A (Высокий доход)</option>
            <option value="B">ABC: B (Средний доход)</option>
            <option value="C">ABC: C (Низкий доход)</option>
            <option value="X">XYZ: X (Стабильные)</option>
            <option value="Y">XYZ: Y (Средние)</option>
            <option value="Z">XYZ: Z (Нестабильные)</option>
          </select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Матрица ABC/XYZ */}
      <Card>
        <CardHeader>
          <CardTitle>Матрица ABC/XYZ</CardTitle>
          <CardDescription>
            Распределение товаров по категориям доходности и стабильности
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 text-sm">
            {/* Заголовки */}
            <div></div>
            <div className="text-center font-medium">X (Стабильные)</div>
            <div className="text-center font-medium">Y (Средние)</div>
            <div className="text-center font-medium">Z (Нестабильные)</div>
            
            {/* Строка A */}
            <div className="font-medium">A (Высокий доход)</div>
            {(['X', 'Y', 'Z'] as const).map(xyz => {
              const count = categoryStats[`A${xyz}` as keyof typeof categoryStats]
              const info = getCategoryInfo('A', xyz)
              return (
                <Card key={`A${xyz}`} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getABCColor('A')}>A{xyz}</Badge>
                    <info.icon className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-medium">{info.title}</div>
                  <div className="text-xs text-gray-500">{count} товаров</div>
                </Card>
              )
            })}
            
            {/* Строка B */}
            <div className="font-medium">B (Средний доход)</div>
            {(['X', 'Y', 'Z'] as const).map(xyz => {
              const count = categoryStats[`B${xyz}` as keyof typeof categoryStats]
              const info = getCategoryInfo('B', xyz)
              return (
                <Card key={`B${xyz}`} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getABCColor('B')}>B{xyz}</Badge>
                    <info.icon className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-medium">{info.title}</div>
                  <div className="text-xs text-gray-500">{count} товаров</div>
                </Card>
              )
            })}
            
            {/* Строка C */}
            <div className="font-medium">C (Низкий доход)</div>
            {(['X', 'Y', 'Z'] as const).map(xyz => {
              const count = categoryStats[`C${xyz}` as keyof typeof categoryStats]
              const info = getCategoryInfo('C', xyz)
              return (
                <Card key={`C${xyz}`} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getABCColor('C')}>C{xyz}</Badge>
                    <info.icon className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-medium">{info.title}</div>
                  <div className="text-xs text-gray-500">{count} товаров</div>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Список товаров */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Детализация товаров</CardTitle>
              <CardDescription>
                Полный список товаров с их категориями и метриками
              </CardDescription>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="revenue">По доходу</option>
              <option value="volume">По объему продаж</option>
              <option value="variation">По стабильности</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedProducts.map((product) => {
              const categoryInfo = getCategoryInfo(product.abc_category, product.xyz_category)
              return (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatCurrency(product.revenue)} • {product.sales_volume} продаж • CV: {(product.coefficient_of_variation * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getABCColor(product.abc_category)}>
                      {product.abc_category}
                    </Badge>
                    <Badge className={getXYZColor(product.xyz_category)}>
                      {product.xyz_category}
                    </Badge>
                    <div className="text-xs text-gray-500 w-20 text-right">
                      {categoryInfo.title}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {sortedProducts.length === 0 && (
            <div className="text-center py-8">
              <Grid3X3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Товары не найдены
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}