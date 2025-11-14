'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  FolderTree, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  ChevronRight,
  ChevronDown,
  Package
} from 'lucide-react'

interface Category {
  id: string
  name: string
  parent_id: string | null
  level: number
  product_count: number
  children?: Category[]
}

interface ProductCategoriesProps {
  selectedCategory?: string
  onCategorySelect?: (categoryId: string) => void
  mode?: 'selector' | 'management'
}

export default function ProductCategories({ 
  selectedCategory, 
  onCategorySelect, 
  mode = 'management' 
}: ProductCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isCreating, setIsCreating] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)

  // Демо данные категорий
  const mockCategories: Category[] = [
    {
      id: '1',
      name: 'Электроника',
      parent_id: null,
      level: 0,
      product_count: 45,
      children: [
        {
          id: '2',
          name: 'Наушники',
          parent_id: '1',
          level: 1,
          product_count: 15,
          children: [
            {
              id: '3',
              name: 'Беспроводные наушники',
              parent_id: '2',
              level: 2,
              product_count: 8
            },
            {
              id: '4',
              name: 'Проводные наушники',
              parent_id: '2',
              level: 2,
              product_count: 7
            }
          ]
        },
        {
          id: '5',
          name: 'Смартфоны',
          parent_id: '1',
          level: 1,
          product_count: 25
        },
        {
          id: '6',
          name: 'Аксессуары',
          parent_id: '1',
          level: 1,
          product_count: 5
        }
      ]
    },
    {
      id: '7',
      name: 'Одежда',
      parent_id: null,
      level: 0,
      product_count: 78,
      children: [
        {
          id: '8',
          name: 'Мужская одежда',
          parent_id: '7',
          level: 1,
          product_count: 35
        },
        {
          id: '9',
          name: 'Женская одежда',
          parent_id: '7',
          level: 1,
          product_count: 43
        }
      ]
    },
    {
      id: '10',
      name: 'Дом и сад',
      parent_id: null,
      level: 0,
      product_count: 23
    }
  ]

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        // В демо режиме используем mock данные
        await new Promise(resolve => setTimeout(resolve, 1000))
        setCategories(mockCategories)
        
        // Разворачиваем первый уровень по умолчанию
        const firstLevelIds = mockCategories.map(cat => cat.id)
        setExpandedCategories(new Set(firstLevelIds))
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleCategoryClick = (categoryId: string) => {
    if (mode === 'selector' && onCategorySelect) {
      onCategorySelect(categoryId)
    }
  }

  const renderCategory = (category: Category, depth = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category.id)
    const isSelected = selectedCategory === category.id
    const paddingLeft = depth * 20 + 12

    return (
      <div key={category.id}>
        <div 
          className={`flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
            isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => handleCategoryClick(category.id)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 mr-1"
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(category.id)
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {!hasChildren && (
            <div className="w-7 mr-1" />
          )}

          <FolderTree className="h-4 w-4 mr-2 text-blue-600" />
          
          <span className="flex-1 text-sm font-medium">{category.name}</span>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {category.product_count}
            </Badge>
            
            {mode === 'management' && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingCategory(category.id)
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteCategory(category.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {category.children!.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const handleDeleteCategory = async (categoryId: string) => {
    const category = findCategoryById(categoryId)
    if (!category) return

    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить категорию "${category.name}"?${
        category.product_count > 0 
          ? ` В этой категории ${category.product_count} товар(ов).`
          : ''
      }`
    )

    if (confirmed) {
      try {
        // В демо режиме просто имитируем удаление
        await new Promise(resolve => setTimeout(resolve, 500))
        console.log(`Удаление категории: ${categoryId}`)
        
        // Обновляем список категорий
        const updatedCategories = removeCategoryFromTree(categories, categoryId)
        setCategories(updatedCategories)
      } catch (error) {
        console.error('Error deleting category:', error)
      }
    }
  }

  const findCategoryById = (id: string): Category | null => {
    const search = (cats: Category[]): Category | null => {
      for (const cat of cats) {
        if (cat.id === id) return cat
        if (cat.children) {
          const found = search(cat.children)
          if (found) return found
        }
      }
      return null
    }
    return search(categories)
  }

  const removeCategoryFromTree = (cats: Category[], idToRemove: string): Category[] => {
    return cats
      .filter(cat => cat.id !== idToRemove)
      .map(cat => ({
        ...cat,
        children: cat.children ? removeCategoryFromTree(cat.children, idToRemove) : undefined
      }))
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <FolderTree className="h-5 w-5" />
              <span>Категории товаров</span>
            </CardTitle>
            <CardDescription>
              {mode === 'management' 
                ? 'Управление категориями товаров'
                : 'Выберите категорию'
              }
            </CardDescription>
          </div>
          
          {mode === 'management' && (
            <Button 
              size="sm"
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Добавить</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Поиск */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Поиск по категориям..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Список категорий */}
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Категории не найдены' : 'Нет категорий'}
              </p>
            </div>
          ) : (
            filteredCategories.map(category => renderCategory(category))
          )}
        </div>

        {/* Форма создания категории */}
        {isCreating && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
            <h4 className="font-medium mb-3">Новая категория</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="newCategoryName">Название категории</Label>
                <Input
                  id="newCategoryName"
                  placeholder="Введите название..."
                />
              </div>
              
              <div>
                <Label htmlFor="parentCategory">Родительская категория</Label>
                <select
                  id="parentCategory"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">Корневая категория</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-2">
                <Button size="sm">Сохранить</Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsCreating(false)}
                >
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}