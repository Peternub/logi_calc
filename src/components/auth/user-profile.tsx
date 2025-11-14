"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { useAppStore } from '@/store/app'
import { Loader2, User } from 'lucide-react'

export function UserProfile() {
  const { user, updateProfile, signOut } = useAuth()
  const { addNotification } = useAppStore()
  
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')
  const [loading, setLoading] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await updateProfile({
      full_name: fullName
    })

    if (error) {
      addNotification({
        type: 'error',
        title: 'Ошибка обновления',
        message: error.message
      })
    } else {
      addNotification({
        type: 'success',
        title: 'Профиль обновлен',
        message: 'Ваши данные успешно сохранены'
      })
    }

    setLoading(false)
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      addNotification({
        type: 'error',
        title: 'Ошибка выхода',
        message: error.message
      })
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Профиль пользователя</span>
          </CardTitle>
          <CardDescription>
            Управление вашими личными данными
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email нельзя изменить
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Полное имя</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Введите ваше имя"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>ID пользователя</Label>
              <Input
                value={user.id}
                disabled
                className="bg-muted font-mono text-xs"
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Сохранить изменения
              </Button>
              
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleSignOut}
              >
                Выйти из аккаунта
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Информация об аккаунте</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Дата создания:</span>
            <span className="text-muted-foreground">
              {new Date(user.created_at).toLocaleDateString('ru-RU')}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Последнее обновление:</span>
            <span className="text-muted-foreground">
              {new Date(user.updated_at || user.created_at).toLocaleDateString('ru-RU')}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Email подтвержден:</span>
            <span className={user.email_confirmed_at ? 'text-green-600' : 'text-yellow-600'}>
              {user.email_confirmed_at ? 'Да' : 'Нет'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}