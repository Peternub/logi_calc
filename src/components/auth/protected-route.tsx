"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = '/auth/login' }: ProtectedRouteProps) {
  // ВРЕМЕННО: отключаем проверку аутентификации для отладки
  const BYPASS_AUTH = true
  
  if (BYPASS_AUTH) {
    console.log('🔓 Аутентификация отключена для отладки')
    return <>{children}</>
  }
  
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('Проверка аутентификации:', { user: !!user, loading })
    
    if (!loading && !user) {
      console.log('Перенаправление на страницу входа')
      router.push(`${redirectTo}?redirectTo=${encodeURIComponent(window.location.pathname)}`)
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}