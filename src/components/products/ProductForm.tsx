'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  X, 
  Upload, 
  Package,
  DollarSign,
  Tag,
  Info,
  Image as ImageIcon,
  ArrowLeft
} from 'lucide-react'
import { useAppStore } from '@/store/app'

interface ProductFormProps {
  productId?: string
  onSave?: (product: any) => void
  onCancel?: () => void
  mode?: 'create' | 'edit'
}

interface MarketplaceAccount {
  id: string
  name: string
  marketplace: string
}

export default function ProductForm({ 
  productId, 
  onSave, 
  onCancel, 
  mode = 'create' 
}: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [marketplaceAccounts, setMarketplaceAccounts] = useState<MarketplaceAccount[]>([])
  const { addNotification } = useAppStore()

  const [formData, setFormData] = useState({
    marketplace_account_id: '',
    marketplace_product_id: '',
    name: '',
    sku: '',
    barcode: '',
    category_id: '',
    category_name: '',
    brand: '',
    description: '',
    price: 0,
    old_price: 0,
    stock_quantity: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    weight: 0,
    images: [] as string[]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Загружаем аккаунты маркетплейсов
  useEffect(() => {
    const fetchMarketplaceAccounts = async () => {
      try {
        // В демо режиме используем mock данные
        const mockAccounts: MarketplaceAccount[] = [
          { id: '1', name: 'Основной магазин', marketplace: 'wildberries' },
          { id: '2', name: 'Ozon Seller', marketplace: 'ozon' },
          { id: '3', name: 'Яндекс Партнер', marketplace: 'yandex_market' }
        ]
        setMarketplaceAccounts(mockAccounts)
      } catch (error) {
        console.error('Error fetching marketplace accounts:', error)
      }
    }

    fetchMarketplaceAccounts()
  }, [])

  // Загружаем данные товара для редактирования
  useEffect(() => {
    if (mode === 'edit' && productId) {
      const fetchProduct = async () => {
        try {
          setLoading(true)
          // В демо режиме используем mock данные
          const mockProduct = {
            id: productId,
            marketplace_account_id: '1',
            marketplace_product_id: 'WB-123456789',
            name: 'Беспроводные наушники AirPods Pro',
            sku: 'WB-123456789',
            barcode: '1234567890123',
            category_id: 'electronics',
            category_name: 'Электроника / Наушники',
            brand: 'Apple',
            description: 'Беспроводные наушники с активным шумоподавлением и прозрачным режимом.',
            price: 24990,
            old_price: 29990,
            stock_quantity: 15,
            dimensions: {
              length: 10,
              width: 8,
              height: 3
            },
            weight: 0.2,
            images: []
          }
          setFormData(mockProduct)
        } catch (error) {
          console.error('Error fetching product:', error)
          addNotification({
            type: 'error',
            title: 'Ошибка',
            message: 'Не удалось загрузить данные товара'
          })
        } finally {
          setLoading(false)
        }
      }

      fetchProduct()
    }
  }, [mode, productId, addNotification])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.marketplace_account_id) {
      newErrors.marketplace_account_id = 'Выберите аккаунт маркетплейса'
    }
    if (!formData.marketplace_product_id) {
      newErrors.marketplace_product_id = 'Введите ID товара на маркетплейсе'
    }
    if (!formData.name) {
      newErrors.name = 'Введите название товара'
    }
    if (!formData.sku) {
      newErrors.sku = 'Введите SKU товара'
    }
    if (!formData.category_name) {
      newErrors.category_name = 'Введите категорию товара'
    }
    if (formData.price <= 0) {
      newErrors.price = 'Цена должна быть больше 0'
    }
    if (formData.stock_quantity < 0) {
      newErrors.stock_quantity = 'Количество не может быть отрицательным'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)

      // В демо режиме имитируем API запрос
      await new Promise(resolve => setTimeout(resolve, 1500))

      const productData = {
        ...formData,
        id: mode === 'edit' ? productId : `product_${Date.now()}`
      }

      onSave?.(productData)

      addNotification({
        type: 'success',
        title: 'Успешно',
        message: mode === 'create' 
          ? 'Товар успешно создан'
          : 'Товар успешно обновлен'
      })

    } catch (error) {
      console.error('Error saving product:', error)
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось сохранить товар'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Убираем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
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

  if (loading && mode === 'edit') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {mode === 'create' ? 'Добавить товар' : 'Редактировать товар'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'create' 
              ? 'Заполните информацию о новом товаре'
              : 'Изменить данные товара'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Сохранение...' : 'Сохранить'}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Отмена</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Базовые данные */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Основная информация</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Аккаунт маркетплейса */}
              <div>
                <Label htmlFor="marketplace_account_id">
                  Аккаунт маркетплейса *
                </Label>
                <select
                  id="marketplace_account_id"
                  value={formData.marketplace_account_id}
                  onChange={(e) => handleInputChange('marketplace_account_id', e.target.value)}
                  className={`mt-1 w-full rounded-md border px-3 py-2 ${
                    errors.marketplace_account_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={mode === 'edit'}
                >
                  <option value="">Выберите аккаунт</option>
                  {marketplaceAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({getMarketplaceName(account.marketplace)})
                    </option>
                  ))}
                </select>
                {errors.marketplace_account_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.marketplace_account_id}</p>
                )}
              </div>

              {/* ID товара на маркетплейсе */}
              <div>
                <Label htmlFor="marketplace_product_id">
                  ID товара на маркетплейсе *
                </Label>
                <Input
                  id="marketplace_product_id"
                  value={formData.marketplace_product_id}
                  onChange={(e) => handleInputChange('marketplace_product_id', e.target.value)}
                  placeholder="Например: 123456789"
                  className={errors.marketplace_product_id ? 'border-red-500' : ''}
                  disabled={mode === 'edit'}
                />
                {errors.marketplace_product_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.marketplace_product_id}</p>
                )}
              </div>

              {/* Название товара */}
              <div>
                <Label htmlFor="name">Название товара *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Введите название товара"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* SKU и штрихкод */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="Артикул товара"
                    className={errors.sku ? 'border-red-500' : ''}
                  />
                  {errors.sku && (
                    <p className="text-red-500 text-sm mt-1">{errors.sku}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="barcode">Штрихкод</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    placeholder="1234567890123"
                  />
                </div>
              </div>

              {/* Категория и бренд */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category_name">Категория *</Label>
                  <Input
                    id="category_name"
                    value={formData.category_name}
                    onChange={(e) => handleInputChange('category_name', e.target.value)}
                    placeholder="Например: Электроника / Наушники"
                    className={errors.category_name ? 'border-red-500' : ''}
                  />
                  {errors.category_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.category_name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="brand">Бренд</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Название бренда"
                  />
                </div>
              </div>

              {/* Описание */}
              <div>
                <Label htmlFor="description">Описание товара</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Подробное описание товара..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Цены */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Цены</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Цена продажи * (₽)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    placeholder="0.00"
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="old_price">Старая цена (₽)</Label>
                  <Input
                    id="old_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.old_price}
                    onChange={(e) => handleInputChange('old_price', Number(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Дополнительная информация */}
        <div className="space-y-6">
          {/* Остатки */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="h-5 w-5" />
                <span>Остатки</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="stock_quantity">Количество на складе *</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => handleInputChange('stock_quantity', Number(e.target.value))}
                  placeholder="0"
                  className={errors.stock_quantity ? 'border-red-500' : ''}
                />
                {errors.stock_quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.stock_quantity}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Габариты и вес */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Габариты и вес</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Размеры (см)</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.dimensions.length}
                    onChange={(e) => handleInputChange('dimensions', {
                      ...formData.dimensions,
                      length: Number(e.target.value)
                    })}
                    placeholder="Длина"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.dimensions.width}
                    onChange={(e) => handleInputChange('dimensions', {
                      ...formData.dimensions,
                      width: Number(e.target.value)
                    })}
                    placeholder="Ширина"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.dimensions.height}
                    onChange={(e) => handleInputChange('dimensions', {
                      ...formData.dimensions,
                      height: Number(e.target.value)
                    })}
                    placeholder="Высота"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="weight">Вес (кг)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.001"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                  placeholder="0.000"
                />
              </div>
            </CardContent>
          </Card>

          {/* Изображения */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span>Изображения</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Перетащите изображения сюда</p>
                <p className="text-sm text-gray-500 mt-1">или нажмите для выбора файлов</p>
                <Button type="button" variant="outline" className="mt-4">
                  Выбрать файлы
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}