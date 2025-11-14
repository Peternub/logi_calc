'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Download, 
  Edit, 
  Trash2, 
  CheckSquare, 
  Square,
  Play,
  Pause,
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface BulkOperationsProps {
  selectedProducts: string[]
  onSelectionChange: (productIds: string[]) => void
  allProducts: any[]
}

export default function BulkOperations({ 
  selectedProducts, 
  onSelectionChange, 
  allProducts 
}: BulkOperationsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [bulkEditData, setBulkEditData] = useState({
    priceIncrease: 0,
    priceDecrease: 0,
    newStatus: '',
    stockAdjustment: 0
  })

  const selectedCount = selectedProducts.length
  const allSelected = selectedProducts.length === allProducts.length && allProducts.length > 0

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(allProducts.map(p => p.id))
    }
  }

  const handleBulkPriceUpdate = async (type: 'increase' | 'decrease') => {
    if (selectedCount === 0) return

    setIsProcessing(true)
    
    try {
      const value = type === 'increase' ? bulkEditData.priceIncrease : bulkEditData.priceDecrease
      
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log(`${type === 'increase' ? 'Увеличение' : 'Уменьшение'} цен на ${value}% для ${selectedCount} товаров`)
      
      // В реальном приложении здесь был бы API запрос
      // await fetch('/api/products/bulk-update', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     productIds: selectedProducts,
      //     action: 'price_update',
      //     data: { type, percentage: value }
      //   })
      // })

      // Сброс выбора после операции
      onSelectionChange([])
      
    } catch (error) {
      console.error('Ошибка массового обновления цен:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkStatusUpdate = async (status: 'active' | 'inactive') => {
    if (selectedCount === 0) return

    setIsProcessing(true)
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log(`Изменение статуса на "${status}" для ${selectedCount} товаров`)
      
      onSelectionChange([])
      
    } catch (error) {
      console.error('Ошибка массового обновления статуса:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedCount === 0) return
    
    const confirmed = window.confirm(`Вы уверены, что хотите удалить ${selectedCount} товар(ов)?`)
    if (!confirmed) return

    setIsProcessing(true)
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log(`Удаление ${selectedCount} товаров`)
      
      onSelectionChange([])
      
    } catch (error) {
      console.error('Ошибка массового удаления:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = () => {
    if (selectedCount === 0) {
      console.log('Экспорт всех товаров')
    } else {
      console.log(`Экспорт ${selectedCount} выбранных товаров`)
    }
    
    // Имитация скачивания файла
    const element = document.createElement('a')
    const file = new Blob(['Название,SKU,Цена,Остаток\n"Товар 1","SKU001",1000,10'], { type: 'text/csv' })
    element.href = URL.createObjectURL(file)
    element.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('Импорт файла:', file.name)
    
    // В реальном приложении здесь была бы обработка CSV/Excel файла
    // const formData = new FormData()
    // formData.append('file', file)
    // await fetch('/api/products/import', {
    //   method: 'POST',
    //   body: formData
    // })
  }

  return (
    <div className="space-y-6">
      {/* Заголовок с выбором */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CheckSquare className="h-5 w-5" />
                <span>Массовые операции</span>
              </CardTitle>
              <CardDescription>
                Выберите товары для выполнения операций над несколькими товарами сразу
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant={selectedCount > 0 ? "default" : "secondary"}>
                Выбрано: {selectedCount}
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center space-x-2"
              >
                {allSelected ? <Square className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                <span>{allSelected ? 'Снять выделение' : 'Выбрать все'}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Операции с ценами */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Массовое изменение цен</span>
          </CardTitle>
          <CardDescription>
            Увеличьте или уменьшите цены выбранных товаров на указанный процент
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Увеличение цен */}
            <div className="space-y-3">
              <Label htmlFor="priceIncrease">Увеличить цены на %</Label>
              <div className="flex space-x-2">
                <Input
                  id="priceIncrease"
                  type="number"
                  min="0"
                  max="100"
                  value={bulkEditData.priceIncrease}
                  onChange={(e) => setBulkEditData(prev => ({
                    ...prev,
                    priceIncrease: Number(e.target.value)
                  }))}
                  placeholder="0"
                  disabled={isProcessing}
                />
                <Button
                  onClick={() => handleBulkPriceUpdate('increase')}
                  disabled={selectedCount === 0 || bulkEditData.priceIncrease <= 0 || isProcessing}
                  className="whitespace-nowrap"
                >
                  {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Применить
                </Button>
              </div>
            </div>

            {/* Уменьшение цен */}
            <div className="space-y-3">
              <Label htmlFor="priceDecrease">Уменьшить цены на %</Label>
              <div className="flex space-x-2">
                <Input
                  id="priceDecrease"
                  type="number"
                  min="0"
                  max="100"
                  value={bulkEditData.priceDecrease}
                  onChange={(e) => setBulkEditData(prev => ({
                    ...prev,
                    priceDecrease: Number(e.target.value)
                  }))}
                  placeholder="0"
                  disabled={isProcessing}
                />
                <Button
                  onClick={() => handleBulkPriceUpdate('decrease')}
                  disabled={selectedCount === 0 || bulkEditData.priceDecrease <= 0 || isProcessing}
                  className="whitespace-nowrap"
                >
                  {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Применить
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Операции со статусом */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>Управление статусом</span>
          </CardTitle>
          <CardDescription>
            Активируйте или деактивируйте выбранные товары
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              onClick={() => handleBulkStatusUpdate('active')}
              disabled={selectedCount === 0 || isProcessing}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Активировать ({selectedCount})</span>
            </Button>
            
            <Button
              onClick={() => handleBulkStatusUpdate('inactive')}
              disabled={selectedCount === 0 || isProcessing}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Pause className="h-4 w-4 text-yellow-600" />
              <span>Деактивировать ({selectedCount})</span>
            </Button>
            
            <Button
              onClick={handleBulkDelete}
              disabled={selectedCount === 0 || isProcessing}
              variant="outline"
              className="flex items-center space-x-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              <span>Удалить ({selectedCount})</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Импорт/Экспорт */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Импорт и экспорт</span>
          </CardTitle>
          <CardDescription>
            Загрузите товары из файла или выгрузите данные
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Экспорт */}
            <div className="space-y-3">
              <Label>Экспорт товаров</Label>
              <div className="space-y-2">
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="w-full flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>
                    {selectedCount > 0 
                      ? `Экспортировать выбранные (${selectedCount})` 
                      : 'Экспортировать все товары'
                    }
                  </span>
                </Button>
                <p className="text-xs text-gray-500">
                  Файл будет сохранен в формате CSV
                </p>
              </div>
            </div>

            {/* Импорт */}
            <div className="space-y-3">
              <Label htmlFor="importFile">Импорт товаров</Label>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    id="importFile"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <Button
                    onClick={() => document.getElementById('importFile')?.click()}
                    variant="outline"
                    className="w-full flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Выбрать файл для импорта</span>
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Поддерживаются форматы: CSV, Excel (.xlsx, .xls)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Информация о выбранных товарах */}
      {selectedCount > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Выбрано товаров: {selectedCount}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                  Все операции будут применены к выбранным товарам. 
                  Убедитесь, что выбрали правильные товары перед выполнением операций.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}