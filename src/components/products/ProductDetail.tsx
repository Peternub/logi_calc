'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Eye,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  ExternalLink 
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ProductDetailProps {
  productId: string
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Демо данные товара
  const [product, setProduct] = useState({
    id: productId,
    name: 'Беспроводные наушники AirPods Pro',
    sku: 'WB-123456789',
    barcode: '1234567890123',
    marketplace: 'wildberries',
    category: 'Электроника / Наушники',
    brand: 'Apple',
    description: 'Беспроводные наушники с активным шумоподавлением и прозрачным режимом. Высококачественный звук и удобная посадка.',
    price: 24990,
    oldPrice: 29990,
    stock: 15,
    reserved: 3,
    available: 12,
    isActive: true,
    rating: 4.8,
    reviewsCount: 1247,
    commission: 12.5,
    images: [
      '/api/placeholder/400/400',
      '/api/placeholder/400/400',
      '/api/placeholder/400/400'
    ],
    dimensions: {
      length: 10,
      width: 8,
      height: 3
    },
    weight: 0.2,
    lastSync: '2024-01-15T10:30:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z'
  })

  const [editForm, setEditForm] = useState({
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice,
    stock: product.stock,
    description: product.description,
    isActive: product.isActive
  })

  const handleEdit = () => {
    setIsEditing(true)
    setEditForm({
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      stock: product.stock,
      description: product.description,
      isActive: product.isActive
    })
  }

  const handleSave = async () => {
    setLoading(true)
    
    // Имитация API запроса
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Обновляем данные
    setProduct(prev => ({
      ...prev,
      ...editForm
    }))
    
    setIsEditing(false)
    setLoading(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      stock: product.stock,
      description: product.description,
      isActive: product.isActive
    })
  }

  const getMarketplaceName = (marketplace: string) => {
    const names = {
      ozon: 'Ozon',
      wildberries: 'Wildberries',
      yandex_market: 'Яндекс.Маркет'
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price)
  }

  const profit = product.price * (1 - product.commission / 100)
  const margin = (profit / product.price) * 100

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Карточка товара
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              SKU: {product.sku}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button onClick={handleEdit} className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Редактировать</span>
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Сохранение...' : 'Сохранить'}</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Отмена</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка - Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Основные данные */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Основная информация</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Название товара */}
              <div>
                <Label htmlFor="name">Название товара</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({...prev, name: e.target.value}))}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-lg font-medium">{product.name}</p>
                )}
              </div>

              {/* Описание */}
              <div>
                <Label htmlFor="description">Описание</Label>
                {isEditing ? (
                  <textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({...prev, description: e.target.value}))}
                    className="mt-1 w-full p-2 border rounded-md min-h-[100px]"
                  />
                ) : (
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{product.description}</p>
                )}
              </div>

              {/* Дополнительные данные */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm text-gray-500">Категория</Label>
                  <p className="font-medium">{product.category}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Бренд</Label>
                  <p className="font-medium">{product.brand}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Штрихкод</Label>
                  <p className="font-medium font-mono text-sm">{product.barcode}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Вес</Label>
                  <p className="font-medium">{product.weight} кг</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Цены и финансы */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Цены и прибыль</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Цены */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="price">Цена продажи</Label>
                    {isEditing ? (
                      <Input
                        id="price"
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm(prev => ({...prev, price: Number(e.target.value)}))}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-2xl font-bold text-green-600">
                        {formatPrice(product.price)}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="oldPrice">Старая цена</Label>
                    {isEditing ? (
                      <Input
                        id="oldPrice"
                        type="number"
                        value={editForm.oldPrice}
                        onChange={(e) => setEditForm(prev => ({...prev, oldPrice: Number(e.target.value)}))}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-lg text-gray-500 line-through">
                        {formatPrice(product.oldPrice)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Прибыль */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500">Комиссия маркетплейса</Label>
                    <p className="text-lg font-medium text-red-600">{product.commission}%</p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-500">Прибыль с товара</Label>
                    <p className="text-lg font-bold text-green-600">{formatPrice(profit)}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-500">Маржинальность</Label>
                    <p className="text-lg font-medium">{margin.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Остатки */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Остатки товара</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{product.stock}</div>
                  <div className="text-sm text-blue-600">Всего на складе</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{product.reserved}</div>
                  <div className="text-sm text-yellow-600">В резерве</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{product.available}</div>
                  <div className="text-sm text-green-600">Доступно</div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-4">
                  <Label htmlFor="stock">Изменить остатки</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm(prev => ({...prev, stock: Number(e.target.value)}))}
                    className="mt-1"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Правая колонка - Дополнительная информация */}
        <div className="space-y-6">
          {/* Статус и маркетплейс */}
          <Card>
            <CardHeader>
              <CardTitle>Статус товара</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Маркетплейс</span>
                <Badge className={getMarketplaceColor(product.marketplace)}>
                  {getMarketplaceName(product.marketplace)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span>Статус</span>
                {isEditing ? (
                  <select
                    value={editForm.isActive.toString()}
                    onChange={(e) => setEditForm(prev => ({...prev, isActive: e.target.value === 'true'}))}
                    className="border rounded px-2 py-1"
                  >
                    <option value="true">Активен</option>
                    <option value="false">Неактивен</option>
                  </select>
                ) : (
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? (
                      <><CheckCircle className="h-3 w-3 mr-1" />Активен</>
                    ) : (
                      <><AlertTriangle className="h-3 w-3 mr-1" />Неактивен</>
                    )}
                  </Badge>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Рейтинг</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-bold">{product.rating}</span>
                    <span className="text-yellow-500">★</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Отзывы</span>
                  <span className="font-medium">{product.reviewsCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Изображения */}
          <Card>
            <CardHeader>
              <CardTitle>Изображения товара</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {product.images.map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Аналитика */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Быстрая аналитика</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Просмотры за 7 дней</span>
                <span className="font-bold">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Продаж за 7 дней</span>
                <span className="font-bold">42</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Конверсия</span>
                <span className="font-bold">3.4%</span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                <Eye className="h-4 w-4 mr-2" />
                Подробная аналитика
              </Button>
            </CardContent>
          </Card>

          {/* Действия */}
          <Card>
            <CardHeader>
              <CardTitle>Действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                Открыть на маркетплейсе
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                История изменений цен
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                История остатков
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}