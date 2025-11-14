'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react'

interface ChartData {
  date: string
  revenue: number
  orders: number
  products: number
  marketplace?: string
}

interface MarketplaceData {
  name: string
  value: number
  percentage: number
  color: string
}

interface SalesVisualizationProps {
  data: ChartData[]
  period: '7d' | '30d' | '90d'
}

export default function SalesVisualization({ data, period }: SalesVisualizationProps) {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area')

  // Данные для диаграммы по маркетплейсам
  const marketplaceData: MarketplaceData[] = [
    { name: 'Wildberries', value: 59.8, percentage: 59.8, color: '#8b5cf6' },
    { name: 'Ozon', value: 25.1, percentage: 25.1, color: '#3b82f6' },
    { name: 'Яндекс.Маркет', value: 15.1, percentage: 15.1, color: '#f59e0b' }
  ]

  // Форматирование данных для графиков
  const chartData = data.map((item, index) => ({
    date: new Date(item.date).toLocaleDateString('ru-RU', { 
      month: 'short', 
      day: 'numeric' 
    }),
    revenue: item.revenue,
    orders: item.orders,
    products: item.products,
    day: index + 1
  }))

  // Форматирование валюты
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Компонент тултипа для графиков
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'revenue' && `Доход: ${formatCurrency(entry.value)}`}
              {entry.dataKey === 'orders' && `Заказы: ${entry.value}`}
              {entry.dataKey === 'products' && `Товары: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Тултип для пирог-диаграммы
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p>{`${data.percentage.toFixed(1)}%`}</p>
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="Доход (₽)"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="orders" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Заказы"
            />
          </LineChart>
        )
        
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stackId="1"
              stroke="#8b5cf6" 
              fill="#8b5cf6"
              fillOpacity={0.6}
              name="Доход (₽)"
            />
          </AreaChart>
        )
        
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="revenue" 
              fill="#8b5cf6" 
              name="Доход (₽)"
            />
            <Bar 
              yAxisId="right"
              dataKey="orders" 
              fill="#3b82f6" 
              name="Заказы"
            />
          </BarChart>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Основной график продаж */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Динамика продаж</span>
              </CardTitle>
              <CardDescription>
                График доходов и заказов за выбранный период
              </CardDescription>
            </div>
            
            {/* Переключатель типа графика */}
            <div className="flex rounded-lg border">
              {([
                { type: 'area', icon: Activity, label: 'Область' },
                { type: 'line', icon: TrendingUp, label: 'Линия' },
                { type: 'bar', icon: BarChart3, label: 'Столбцы' }
              ] as const).map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant={chartType === type ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType(type)}
                  className="rounded-none first:rounded-l-lg last:rounded-r-lg"
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Распределение по маркетплейсам */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5" />
              <span>Продажи по маркетплейсам</span>
            </CardTitle>
            <CardDescription>
              Распределение доходов по площадкам
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={marketplaceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {marketplaceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Легенда */}
            <div className="space-y-2 mt-4">
              {marketplaceData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <Badge variant="secondary">
                    {item.percentage.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Тепловая карта по дням недели */}
        <Card>
          <CardHeader>
            <CardTitle>Активность по дням</CardTitle>
            <CardDescription>
              Анализ продаж по дням недели
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => {
                const intensity = Math.random() * 0.8 + 0.2 // От 0.2 до 1.0
                return (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500 mb-1">{day}</div>
                    <div 
                      className="h-16 rounded border flex items-center justify-center text-xs font-medium"
                      style={{
                        backgroundColor: `rgba(139, 92, 246, ${intensity})`,
                        color: intensity > 0.5 ? 'white' : 'black'
                      }}
                    >
                      {Math.round(intensity * 100)}%
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <span>Меньше</span>
              <div className="flex space-x-1">
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity, index) => (
                  <div 
                    key={index}
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: `rgba(139, 92, 246, ${opacity})` }}
                  />
                ))}
              </div>
              <span>Больше</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Трендовый анализ */}
      <Card>
        <CardHeader>
          <CardTitle>Анализ трендов</CardTitle>
          <CardDescription>
            Ключевые показатели и их изменения
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">↗ +12.5%</div>
              <div className="text-sm text-gray-500">Рост доходов</div>
              <div className="text-xs text-gray-400 mt-1">vs предыдущий период</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">📈 +8.2%</div>
              <div className="text-sm text-gray-500">Рост заказов</div>
              <div className="text-xs text-gray-400 mt-1">vs предыдущий период</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">🎯 2,730₽</div>
              <div className="text-sm text-gray-500">Средний чек</div>
              <div className="text-xs text-gray-400 mt-1">+150₽ к среднему</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}