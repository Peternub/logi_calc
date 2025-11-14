'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import SalesAnalytics from '@/components/analytics/SalesAnalytics'
import ABCXYZAnalysis from '@/components/analytics/ABCXYZAnalysis'
import { Button } from '@/components/ui/button'
import { BarChart3, Grid3X3, TrendingUp } from 'lucide-react'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'sales' | 'abc-xyz'>('sales')

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <BarChart3 className="h-8 w-8 mr-2" />
            Аналитика
          </h1>
          <p className="text-muted-foreground">
            Подробная аналитика продаж и доходов с маркетплейсов
          </p>
        </div>
        
        {/* Вкладки */}
        <div className="flex space-x-1 mb-6 border-b">
          <Button
            variant={activeTab === 'sales' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('sales')}
            className="flex items-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Продажи</span>
          </Button>
          <Button
            variant={activeTab === 'abc-xyz' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('abc-xyz')}
            className="flex items-center space-x-2"
          >
            <Grid3X3 className="h-4 w-4" />
            <span>ABC/XYZ Анализ</span>
          </Button>
        </div>
        
        {/* Контент вкладок */}
        {activeTab === 'sales' && <SalesAnalytics />}
        {activeTab === 'abc-xyz' && <ABCXYZAnalysis products={[]} />}
      </div>
    </ProtectedRoute>
  )
}