"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAppStore } from '@/store/app'
import ProductForm from '@/components/products/ProductForm'
import BulkOperations from '@/components/products/BulkOperations'
import ProductCategories from '@/components/products/ProductCategories'
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Settings,
  Download,
  Upload,
  CheckSquare,
  Square
} from 'lucide-react'

interface Product {
  id: string
  marketplace_product_id: string
  name: string
  sku: string | null
  price: number
  stock: number
  category: string | null
  status: 'active' | 'inactive' | 'deleted'
  created_at: string
  updated_at: string
  marketplace_accounts: {
    marketplace: string
    account_name: string
  }
}

interface ProductsResponse {
  data: Product[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [meta, setMeta] = useState<ProductsResponse['meta'] | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [showBulkOperations, setShowBulkOperations] = useState(false)
  const [showCategories, setShowCategories] = useState(false)

  const { addNotification } = useAppStore()

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true)
      
      // В демо режиме используем mock данные
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockProducts: Product[] = [
        {
          id: '1',
          marketplace_product_id: 'WB-123456789',
          name: 'Беспроводные наушники AirPods Pro',
          sku: 'WB-123456789',
          price: 24990,
          stock: 15,
          category: 'Электроника / Наушники',
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-15T10:30:00.000Z',
          marketplace_accounts: {
            marketplace: 'wildberries',
            account_name: 'Основной магазин'
          }
        },
        {
          id: '2',
          marketplace_product_id: 'OZON-987654321',
          name: 'Смартфон iPhone 15 Pro',
          sku: 'OZON-987654321',
          price: 89990,
          stock: 8,
          category: 'Электроника / Смартфоны',
          status: 'active',
          created_at: '2024-01-02T00:00:00.000Z',
          updated_at: '2024-01-16T14:20:00.000Z',
          marketplace_accounts: {
            marketplace: 'ozon',
            account_name: 'Ozon Seller'
          }
        },
        {
          id: '3',
          marketplace_product_id: 'YM-555888999',
          name: 'Футболка хлопковая базовая',
          sku: 'YM-555888999',
          price: 1590,
          stock: 45,
          category: 'Одежда / Мужская одежда',
          status: 'active',
          created_at: '2024-01-03T00:00:00.000Z',
          updated_at: '2024-01-17T09:15:00.000Z',
          marketplace_accounts: {
            marketplace: 'yandex_market',
            account_name: 'Яндекс Партнер'
          }
        }
      ]
      
      // Применяем фильтры
      let filteredProducts = mockProducts
      
      if (search) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku?.toLowerCase().includes(search.toLowerCase())
        )
      }
      
      if (selectedStatus) {
        filteredProducts = filteredProducts.filter(p => p.status === selectedStatus)
      }
      
      if (selectedMarketplace) {
        filteredProducts = filteredProducts.filter(p => 
          p.marketplace_accounts.marketplace === selectedMarketplace
        )
      }
      
      setProducts(filteredProducts)
      setMeta({
        total: filteredProducts.length,
        page: page,
        limit: 20,
        totalPages: Math.ceil(filteredProducts.length / 20),
        hasNext: false,
        hasPrev: false
      })
      setCurrentPage(page)
    } catch (error) {
      console.error('Products error:', error)
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось загрузить товары'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

  const handleMarketplaceFilter = (marketplace: string) => {
    setSelectedMarketplace(marketplace)
    setCurrentPage(1)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Активный', variant: 'default' as const },
      inactive: { label: 'Неактивный', variant: 'secondary' as const },
      deleted: { label: 'Удален', variant: 'destructive' as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getMarketplaceBadge = (marketplace: string) => {
    const marketplaceConfig = {
      ozon: { label: 'Ozon', color: 'bg-blue-100 text-blue-800' },
      wildberries: { label: 'Wildberries', color: 'bg-purple-100 text-purple-800' },
      yandex_market: { label: 'Яндекс.Маркет', color: 'bg-yellow-100 text-yellow-800' }
    }
    
    const config = marketplaceConfig[marketplace as keyof typeof marketplaceConfig]
    if (!config) return <Badge variant="outline">{marketplace}</Badge>
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Обработчики для работы с выбором товаров
  const handleSelectProduct = (productId: string, selected: boolean) => {
    if (selected) {
      setSelectedProducts(prev => [...prev, productId])
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId))
    }
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p.id))
    }
  }

  const handleProductSave = (productData: any) => {
    console.log('Сохранение товара:', productData)
    setShowProductForm(false)
    setEditingProduct(null)
    fetchProducts(currentPage)
  }

  const handleProductEdit = (productId: string) => {
    setEditingProduct(productId)
    setShowProductForm(true)
  }

  const handleProductDelete = async (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить товар "${product.name}"?`
    )

    if (confirmed) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        addNotification({
          type: 'success',
          title: 'Успешно',
          message: 'Товар удален'
        })
        fetchProducts(currentPage)
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Ошибка',
          message: 'Не удалось удалить товар'
        })
      }
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [search, selectedStatus, selectedMarketplace, selectedCategory])

  useEffect(() => {
    if (currentPage > 1) {
      fetchProducts(currentPage)
    }
  }, [currentPage])

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Package className="h-8 w-8 mr-2" />
              Товары
            </h1>
            <p className="text-muted-foreground">
              Управление товарами на маркетплейсах
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => fetchProducts(currentPage)} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить
            </Button>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => setShowCategories(!showCategories)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Категории
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowBulkOperations(!showBulkOperations)}
                disabled={selectedProducts.length === 0}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Операции ({selectedProducts.length})
              </Button>
              <Button onClick={() => setShowProductForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить товар
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Фильтры и поиск</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию или SKU..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={selectedStatus}
                onChange={(e) => handleStatusFilter(e.target.value)}
              >
                <option value="">Все статусы</option>
                <option value="active">Активные</option>
                <option value="inactive">Неактивные</option>
                <option value="deleted">Удаленные</option>
              </select>

              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={selectedMarketplace}
                onChange={(e) => handleMarketplaceFilter(e.target.value)}
              >
                <option value="">Все маркетплейсы</option>
                <option value="ozon">Ozon</option>
                <option value="wildberries">Wildberries</option>
                <option value="yandex_market">Яндекс.Маркет</option>
              </select>

              <Button variant="outline" onClick={() => {
                setSearch('')
                setSelectedStatus('')
                setSelectedMarketplace('')
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Сбросить
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Список товаров</CardTitle>
                <CardDescription>
                  {meta ? `Показано ${products.length} из ${meta.total} товаров` : 'Загрузка...'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Товары не найдены</h3>
                <p className="text-muted-foreground mb-4">
                  {search || selectedStatus || selectedMarketplace
                    ? 'Попробуйте изменить фильтры поиска'
                    : 'Добавьте первый товар для начала работы'
                  }
                </p>
                <Button onClick={() => setShowProductForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить товар
                </Button>
              </div>
            ) : (
              <>
                {/* Products Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-3 text-left">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSelectAll}
                                className="h-6 w-6 p-0"
                              >
                                {selectedProducts.length === products.length && products.length > 0 ? (
                                  <CheckSquare className="h-4 w-4" />
                                ) : (
                                  <Square className="h-4 w-4" />
                                )}
                              </Button>
                              <span>Товар</span>
                            </div>
                          </th>
                          <th className="p-3 text-left">SKU</th>
                          <th className="p-3 text-left">Маркетплейс</th>
                          <th className="p-3 text-right">Цена</th>
                          <th className="p-3 text-right">Остаток</th>
                          <th className="p-3 text-center">Статус</th>
                          <th className="p-3 text-center">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product, index) => {
                          const isSelected = selectedProducts.includes(product.id)
                          return (
                          <tr key={product.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                            <td className="p-3">
                              <div className="flex items-center space-x-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSelectProduct(product.id, !isSelected)}
                                  className="h-6 w-6 p-0"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="h-4 w-4" />
                                  ) : (
                                    <Square className="h-4 w-4" />
                                  )}
                                </Button>
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    ID: {product.marketplace_product_id}
                                  </div>
                                  {product.category && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {product.category}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {product.sku || '—'}
                              </code>
                            </td>
                            <td className="p-3">
                              <div className="space-y-1">
                                {getMarketplaceBadge(product.marketplace_accounts.marketplace)}
                                <div className="text-xs text-muted-foreground">
                                  {product.marketplace_accounts.account_name}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-right font-medium">
                              {formatPrice(product.price)}
                            </td>
                            <td className="p-3 text-right">
                              <span className={product.stock === 0 ? 'text-red-600' : ''}>
                                {product.stock}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {getStatusBadge(product.status)}
                            </td>
                            <td className="p-3">
                              <div className="flex justify-center space-x-1">
                                <Link href={`/dashboard/products/${product.id}`}>
                                  <Button size="sm" variant="ghost" title="Посмотреть">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  title="Редактировать"
                                  onClick={() => handleProductEdit(product.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  title="Удалить"
                                  onClick={() => handleProductDelete(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Страница {meta.page} из {meta.totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={!meta.hasPrev}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Назад
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!meta.hasNext}
                      >
                        Вперед
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Категории товаров */}
        {showCategories && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ProductCategories 
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                mode="management"
              />
            </div>
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    Выберите категорию слева для фильтрации товаров или управления категориями.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Массовые операции */}
        {showBulkOperations && selectedProducts.length > 0 && (
          <BulkOperations 
            selectedProducts={selectedProducts}
            onSelectionChange={setSelectedProducts}
            allProducts={products}
          />
        )}
      </div>

      {/* Модальное окно формы товара */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <ProductForm
                productId={editingProduct || undefined}
                mode={editingProduct ? 'edit' : 'create'}
                onSave={handleProductSave}
                onCancel={() => {
                  setShowProductForm(false)
                  setEditingProduct(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}