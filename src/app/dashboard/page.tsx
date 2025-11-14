"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAppStore } from '@/store/app'
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Users,
  RefreshCw,
  BarChart3,
  Plus,
  Settings,
  Link as LinkIcon
} from 'lucide-react'

interface DashboardStats {
  totalSales: {
    value: number
    growth: number
    formatted: string
  }
  totalOrders: {
    value: number
    growth: number
    formatted: string
  }
  totalProfit: {
    value: number
    formatted: string
  }
  productsCount: {
    value: number
    formatted: string
  }
  accountsCount: {
    value: number
    formatted: string
  }
}

interface ChartData {
  period: string
  data: Array<{
    date: string
    formattedDate: string
    sales: number
    orders: number
    profit: number
    formattedSales: string
    formattedProfit: string
  }>
  summary: {
    totalSales: number
    totalOrders: number
    totalProfit: number
    averageDailySales: number
    averageDailyOrders: number
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  
  const { addNotification } = useAppStore()
  const router = useRouter()

  // Обработчики для быстрых действий
  const handleAddProduct = () => {
    router.push('/products')
  }

  const handleConnectMarketplace = () => {
    router.push('/marketplaces')
  }

  const handleSetupAutomation = () => {
    router.push('/automation')
  }

  const fetchStats = async () => {
    try {
      console.log('Загрузка статистики дашборда...')
      const response = await fetch('/api/dashboard/stats-simple')
      console.log('Статус ответа API статистики:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Ошибка API статистики:', errorText)
        throw new Error(`API Ошибка: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Данные статистики получены:', data)
      setStats(data)
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error)
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: `Не удалось загрузить статистику: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      })
    }
  }

  const fetchChartData = async (period: string) => {
    try {
      console.log('Fetching chart data for period:', period)
      const response = await fetch(`/api/dashboard/chart-simple?period=${period}`)
      console.log('Chart API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Chart API error response:', errorText)
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Chart data received:', data)
      setChartData(data)
    } catch (error) {
      console.error('Chart data error:', error)
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: `Не удалось загрузить данные графика: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  const loadData = async () => {
    setLoading(true)
    await Promise.all([
      fetchStats(),
      fetchChartData(selectedPeriod)
    ])
    setLoading(false)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
    addNotification({
      type: 'success',
      title: 'Обновлено',
      message: 'Данные успешно обновлены'
    })
  }

  const handlePeriodChange = async (period: string) => {
    setSelectedPeriod(period)
    await fetchChartData(period)
  }

  useEffect(() => {
    loadData()
  }, [])

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0
    const Icon = isPositive ? TrendingUp : TrendingDown
    const color = isPositive ? 'text-green-600' : 'text-red-600'
    
    return (
      <div className={`flex items-center ${color}`}>
        <Icon className="h-4 w-4 mr-1" />
        <span className="text-xs">
          {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Загрузка дашборда...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Дашборд</h1>
            <p className="text-muted-foreground">
              Обзор вашей деятельности на маркетплейсах
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общие продажи</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalSales.formatted || '0 ₽'}
              </div>
              {stats && formatGrowth(stats.totalSales.growth)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Количество заказов</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalOrders.formatted || '0'}
              </div>
              {stats && formatGrowth(stats.totalOrders.growth)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Чистая прибыль</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalProfit.formatted || '0 ₽'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные товары</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.productsCount.formatted || '0'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Динамика продаж
                </CardTitle>
                <CardDescription>
                  График продаж за выбранный период
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                {['7d', '30d', '90d'].map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePeriodChange(period)}
                  >
                    {period === '7d' ? '7 дней' : period === '30d' ? '30 дней' : '90 дней'}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {chartData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Всего продаж</p>
                    <p className="font-semibold">
                      {new Intl.NumberFormat('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                        minimumFractionDigits: 0
                      }).format(chartData.summary.totalSales)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Всего заказов</p>
                    <p className="font-semibold">{chartData.summary.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Средняя прибыль в день</p>
                    <p className="font-semibold">
                      {new Intl.NumberFormat('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                        minimumFractionDigits: 0
                      }).format(chartData.summary.averageDailySales)}
                    </p>
                  </div>
                </div>
                
                {/* Простая таблица данных (временная замена графика) */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-left">Дата</th>
                          <th className="p-2 text-right">Продажи</th>
                          <th className="p-2 text-right">Заказы</th>
                          <th className="p-2 text-right">Прибыль</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.data.map((day, index) => (
                          <tr key={day.date} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                            <td className="p-2">{day.formattedDate}</td>
                            <td className="p-2 text-right">{day.formattedSales}</td>
                            <td className="p-2 text-right">{day.orders}</td>
                            <td className="p-2 text-right">{day.formattedProfit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Нет данных для отображения</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Аккаунты маркетплейсов</CardTitle>
              <CardDescription>
                Подключенные аккаунты маркетплейсов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {stats?.accountsCount.formatted || '0'}
                </span>
                <span className="text-sm text-muted-foreground">активных</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
              <CardDescription>
                Часто используемые функции
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleAddProduct}
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить товар
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleConnectMarketplace}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Подключить маркетплейс
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleSetupAutomation}
              >
                <Settings className="h-4 w-4 mr-2" />
                Настроить автоматизацию
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}