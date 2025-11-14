'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAppStore } from '@/store/app'
import { 
  Settings, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react'

interface MarketplaceAccount {
  id: string
  name: string
  marketplace: 'ozon' | 'wildberries' | 'yandex_market'
  credentials: {
    clientId?: string
    apiKey?: string
    warehouseId?: string
  }
  is_active: boolean
  last_sync?: string
  connection_status?: 'connected' | 'error' | 'unknown'
}

export default function MarketplacesPage() {
  const [accounts, setAccounts] = useState<MarketplaceAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [testingConnection, setTestingConnection] = useState<string | null>(null)
  const [showCredentials, setShowCredentials] = useState<{ [key: string]: boolean }>({})
  const [isCreating, setIsCreating] = useState(false)
  
  const [newAccount, setNewAccount] = useState({
    name: '',
    marketplace: 'ozon' as 'ozon' | 'wildberries' | 'yandex_market',
    clientId: '',
    apiKey: '',
    warehouseId: ''
  })

  const { addNotification } = useAppStore()

  // Демо данные
  const mockAccounts: MarketplaceAccount[] = [
    {
      id: '1',
      name: 'Основной магазин Wildberries',
      marketplace: 'wildberries',
      credentials: {
        apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        warehouseId: '123456'
      },
      is_active: true,
      last_sync: '2024-01-15T10:30:00.000Z',
      connection_status: 'connected'
    },
    {
      id: '2',
      name: 'Ozon Seller Account',
      marketplace: 'ozon',
      credentials: {
        clientId: '12345',
        apiKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
      },
      is_active: false,
      last_sync: '2024-01-10T15:20:00.000Z',
      connection_status: 'error'
    }
  ]

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true)
        // В демо режиме используем mock данные
        await new Promise(resolve => setTimeout(resolve, 1000))
        setAccounts(mockAccounts)
      } catch (error) {
        console.error('Error fetching accounts:', error)
        addNotification({
          type: 'error',
          title: 'Ошибка',
          message: 'Не удалось загрузить аккаунты'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [addNotification])

  const handleTestConnection = async (accountId: string) => {
    try {
      setTestingConnection(accountId)
      
      // В демо режиме имитируем тест подключения
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Имитируем случайный результат
      const success = Math.random() > 0.3
      
      setAccounts(prev => prev.map(account => 
        account.id === accountId 
          ? { ...account, connection_status: success ? 'connected' : 'error' }
          : account
      ))

      addNotification({
        type: success ? 'success' : 'error',
        title: success ? 'Подключение успешно' : 'Ошибка подключения',
        message: success 
          ? 'Соединение с маркетплейсом установлено'
          : 'Проверьте данные для подключения'
      })
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось проверить подключение'
      })
    } finally {
      setTestingConnection(null)
    }
  }

  const handleCreateAccount = async () => {
    if (!newAccount.name || !newAccount.marketplace) {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Заполните обязательные поля'
      })
      return
    }

    try {
      // В демо режиме добавляем аккаунт локально
      const account: MarketplaceAccount = {
        id: Date.now().toString(),
        name: newAccount.name,
        marketplace: newAccount.marketplace,
        credentials: {
          clientId: newAccount.clientId || undefined,
          apiKey: newAccount.apiKey || undefined,
          warehouseId: newAccount.warehouseId || undefined
        },
        is_active: true,
        connection_status: 'unknown'
      }

      setAccounts(prev => [...prev, account])
      setIsCreating(false)
      setNewAccount({
        name: '',
        marketplace: 'ozon',
        clientId: '',
        apiKey: '',
        warehouseId: ''
      })

      addNotification({
        type: 'success',
        title: 'Успешно',
        message: 'Аккаунт добавлен'
      })

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось создать аккаунт'
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

  const getConnectionStatus = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Подключено</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Ошибка</Badge>
      default:
        return <Badge variant="secondary">Не проверено</Badge>
    }
  }

  const toggleCredentialsVisibility = (accountId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }))
  }

  const maskCredential = (value: string) => {
    return value.length > 8 ? value.slice(0, 4) + '...' + value.slice(-4) : '***'
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Заголовок */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Settings className="h-8 w-8 mr-2" />
              Маркетплейсы
            </h1>
            <p className="text-muted-foreground">
              Управление подключениями к маркетплейсам
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить аккаунт
          </Button>
        </div>

        {/* Форма создания аккаунта */}
        {isCreating && (
          <Card>
            <CardHeader>
              <CardTitle>Новый аккаунт маркетплейса</CardTitle>
              <CardDescription>
                Добавьте подключение к вашему аккаунту на маркетплейсе
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Название аккаунта *</Label>
                  <Input
                    id="name"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Например: Основной магазин"
                  />
                </div>
                
                <div>
                  <Label htmlFor="marketplace">Маркетплейс *</Label>
                  <select
                    id="marketplace"
                    value={newAccount.marketplace}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, marketplace: e.target.value as any }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="ozon">Ozon</option>
                    <option value="wildberries">Wildberries</option>
                    <option value="yandex_market">Яндекс.Маркет</option>
                  </select>
                </div>
              </div>

              {newAccount.marketplace === 'ozon' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      value={newAccount.clientId}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, clientId: e.target.value }))}
                      placeholder="12345"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={newAccount.apiKey}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="API ключ"
                    />
                  </div>
                </div>
              )}

              {newAccount.marketplace === 'wildberries' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={newAccount.apiKey}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="JWT токен"
                    />
                  </div>
                  <div>
                    <Label htmlFor="warehouseId">ID склада</Label>
                    <Input
                      id="warehouseId"
                      value={newAccount.warehouseId}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, warehouseId: e.target.value }))}
                      placeholder="123456"
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button onClick={handleCreateAccount}>
                  Создать аккаунт
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Список аккаунтов */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            [1, 2].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : accounts.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Нет подключенных аккаунтов</h3>
              <p className="text-gray-600 mb-4">
                Добавьте подключение к маркетплейсу для начала работы
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить первый аккаунт
              </Button>
            </div>
          ) : (
            accounts.map((account) => (
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getMarketplaceColor(account.marketplace)}>
                          {getMarketplaceName(account.marketplace)}
                        </Badge>
                        {getConnectionStatus(account.connection_status || 'unknown')}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {/* TODO: Удаление аккаунта */}}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Credentials */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Данные для подключения</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCredentialsVisibility(account.id)}
                      >
                        {showCredentials[account.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="text-xs space-y-1">
                      {account.credentials.clientId && (
                        <div>
                          <span className="text-gray-500">Client ID: </span>
                          <span className="font-mono">
                            {showCredentials[account.id] 
                              ? account.credentials.clientId 
                              : maskCredential(account.credentials.clientId)
                            }
                          </span>
                        </div>
                      )}
                      {account.credentials.apiKey && (
                        <div>
                          <span className="text-gray-500">API Key: </span>
                          <span className="font-mono">
                            {showCredentials[account.id] 
                              ? account.credentials.apiKey 
                              : maskCredential(account.credentials.apiKey)
                            }
                          </span>
                        </div>
                      )}
                      {account.credentials.warehouseId && (
                        <div>
                          <span className="text-gray-500">Склад: </span>
                          <span className="font-mono">{account.credentials.warehouseId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(account.id)}
                      disabled={testingConnection === account.id}
                    >
                      {testingConnection === account.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Проверить подключение
                    </Button>
                    
                    {account.connection_status === 'connected' && (
                      <Button size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Синхронизировать
                      </Button>
                    )}
                  </div>

                  {account.last_sync && (
                    <div className="text-xs text-gray-500">
                      Последняя синхронизация: {new Date(account.last_sync).toLocaleString('ru-RU')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}