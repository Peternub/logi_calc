// Страница тестирования парсинга Wildberries
'use client'

import { WBTestParser } from '@/components/wildberries/WBTestParser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function WBTestPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Тест парсинга Wildberries</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            На этой странице вы можете протестировать парсинг данных с Wildberries. 
            Введите URL категории, название категории и лимит товаров, затем нажмите "Запустить парсинг".
          </p>
          
          <WBTestParser />
        </CardContent>
      </Card>
    </div>
  )
}