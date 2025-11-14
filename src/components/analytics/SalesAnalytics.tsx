'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import SalesVisualization from './SalesVisualization'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  ShoppingCart,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'

interface SalesData {
  date: string
  revenue: number
  orders: number
  products_sold: number
  marketplace: 'ozon' | 'wildberries' | 'yandex_market'
}

interface SalesMetrics {
  total_revenue: number
  total_orders: number
  total_products: number
  revenue_change: number
  orders_change: number
  average_order_value: number
}

export default function SalesAnalytics() {
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('all')

  // Демо данные для аналитики
  const mockSalesData: SalesData[] = [
    // Последние 30 дней
    { date: '2024-01-01', revenue: 125000, orders: 45, products_sold: 87, marketplace: 'wildberries' },
    { date: '2024-01-02', revenue: 89000, orders: 32, products_sold: 56, marketplace: 'ozon' },
    { date: '2024-01-03', revenue: 156000, orders: 58, products_sold: 102, marketplace: 'wildberries' },
    { date: '2024-01-04', revenue: 97000, orders: 35, products_sold: 67, marketplace: 'yandex_market' },
    { date: '2024-01-05', revenue: 134000, orders: 48, products_sold: 89, marketplace: 'wildberries' },
    { date: '2024-01-06', revenue: 78000, orders: 28, products_sold: 45, marketplace: 'ozon' },
    { date: '2024-01-07', revenue: 167000, orders: 62, products_sold: 115, marketplace: 'wildberries' },
    { date: '2024-01-08', revenue: 112000, orders: 41, products_sold: 78, marketplace: 'yandex_market' },
    { date: '2024-01-09', revenue: 145000, orders: 52, products_sold: 94, marketplace: 'wildberries' },
    { date: '2024-01-10', revenue: 92000, orders: 33, products_sold: 59, marketplace: 'ozon' },
    { date: '2024-01-11', revenue: 178000, orders: 65, products_sold: 125, marketplace: 'wildberries' },
    { date: '2024-01-12', revenue: 98000, orders: 36, products_sold: 68, marketplace: 'yandex_market' },
    { date: '2024-01-13', revenue: 156000, orders: 56, products_sold: 105, marketplace: 'wildberries' },
    { date: '2024-01-14', revenue: 87000, orders: 31, products_sold: 54, marketplace: 'ozon' },
    { date: '2024-01-15', revenue: 189000, orders: 68, products_sold: 134, marketplace: 'wildberries' }
  ]

  const fetchSalesData = async () => {
    try {
      setLoading(true)
      // В демо режиме используем mock данные
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      let filteredData = mockSalesData
      
      // Фильтр по маркетплейсу
      if (selectedMarketplace !== 'all') {
        filteredData = filteredData.filter(item => item.marketplace === selectedMarketplace)
      }
      
      // Фильтр по периоду
      const daysBack = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90
      filteredData = filteredData.slice(-daysBack)
      
      setSalesData(filteredData)
      
      // Рассчитываем метрики
      const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0)
      const totalOrders = filteredData.reduce((sum, item) => sum + item.orders, 0)
      const totalProducts = filteredData.reduce((sum, item) => sum + item.products_sold, 0)
      
      // Сравнение с предыдущим периодом (имитация)
      const revenueChange = Math.random() * 20 - 10 // от -10% до +10%
      const ordersChange = Math.random() * 15 - 7.5 // от -7.5% до +7.5%
      
      setMetrics({
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        total_products: totalProducts,
        revenue_change: revenueChange,
        orders_change: ordersChange,
        average_order_value: totalRevenue / totalOrders || 0
      })
      
    } catch (error) {
      console.error('Error fetching sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSalesData()
  }, [selectedPeriod, selectedMarketplace])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num)
  }

  const getMarketplaceName = (marketplace: string) => {
    const names = {
      ozon: 'Ozon',
      wildberries: 'Wildberries',
      yandex_market: 'Яндекс.Маркет',
      all: 'Все маркетплейсы'
    }
    return names[marketplace as keyof typeof names] || marketplace
  }

  const getMarketplaceColor = (marketplace: string) => {
    const colors = {
      ozon: 'bg-blue-100 text-blue-800',
      wildberries: 'bg-purple-100 text-purple-800',
      yandex_market: 'bg-yellow-100 text-yellow-800'
    }
    return colors[marketplace as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPeriodName = (period: string) => {
    const names = {
      '7d': 'Последние 7 дней',
      '30d': 'Последние 30 дней',
      '90d': 'Последние 90 дней'
    }
    return names[period as keyof typeof names] || period
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Аналитика продаж</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Анализ продаж и доходов с маркетплейсов
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Фильтр по периоду */}
          <div className="flex rounded-lg border">
            {(['7d', '30d', '90d'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="rounded-none first:rounded-l-lg last:rounded-r-lg"
              >
                {getPeriodName(period)}
              </Button>
            ))}
          </div>
          
          {/* Фильтр по маркетплейсу */}
          <select
            value={selectedMarketplace}
            onChange={(e) => setSelectedMarketplace(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">Все маркетплейсы</option>
            <option value="wildberries">Wildberries</option>
            <option value="ozon">Ozon</option>
            <option value="yandex_market">Яндекс.Маркет</option>
          </select>
          
          <Button variant="outline" size="sm" onClick={fetchSalesData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Основные метрики */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Общий доход */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Общий доход
                  </p>
                  <p className="text-2xl font-bold">
                    {metrics ? formatCurrency(metrics.total_revenue) : '0 ₽'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              {metrics && (
                <div className="flex items-center mt-4">
                  {metrics.revenue_change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${metrics.revenue_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.revenue_change >= 0 ? '+' : ''}{metrics.revenue_change.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">к предыдущему периоду</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Количество заказов */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Заказы
                  </p>
                  <p className="text-2xl font-bold">
                    {metrics ? formatNumber(metrics.total_orders) : '0'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              {metrics && (
                <div className="flex items-center mt-4">
                  {metrics.orders_change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${metrics.orders_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.orders_change >= 0 ? '+' : ''}{metrics.orders_change.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">к предыдущему периоду</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Товары продано */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Товары продано
                  </p>
                  <p className="text-2xl font-bold">
                    {metrics ? formatNumber(metrics.total_products) : '0'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span className="text-sm text-gray-500">
                  {metrics && metrics.total_orders > 0 
                    ? `${(metrics.total_products / metrics.total_orders).toFixed(1)} товара на заказ`
                    : 'Нет данных'
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Средний чек */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Средний чек
                  </p>
                  <p className="text-2xl font-bold">
                    {metrics ? formatCurrency(metrics.average_order_value) : '0 ₽'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span className="text-sm text-gray-500">
                  За {getPeriodName(selectedPeriod).toLowerCase()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Графики и визуализация */}
      <SalesVisualization 
        data={salesData.map(item => ({
          date: item.date,
          revenue: item.revenue,
          orders: item.orders,
          products: item.products_sold,
          marketplace: item.marketplace
        }))} 
        period={selectedPeriod} 
      />

      {/* Разбивка по маркетплейсам */}
      <Card>
        <CardHeader>
          <CardTitle>Продажи по маркетплейсам</CardTitle>
          <CardDescription>
            Детализация продаж по каждому маркетплейсу
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['wildberries', 'ozon', 'yandex_market'].map((marketplace) => {
              const marketplaceData = salesData.filter(item => item.marketplace === marketplace)
              const revenue = marketplaceData.reduce((sum, item) => sum + item.revenue, 0)
              const orders = marketplaceData.reduce((sum, item) => sum + item.orders, 0)
              const percentage = metrics ? (revenue / metrics.total_revenue * 100) : 0
              
              return (
                <div key={marketplace} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className={getMarketplaceColor(marketplace)}>
                      {getMarketplaceName(marketplace)}
                    </Badge>
                    <div>
                      <p className="font-medium">{formatCurrency(revenue)}</p>
                      <p className="text-sm text-gray-500">{orders} заказов</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{percentage.toFixed(1)}%</p>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}