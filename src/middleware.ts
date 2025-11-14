import { createMiddlewareClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Защищенные маршруты, требующие аутентификации
const protectedRoutes = [
  '/dashboard',
  '/products',
  '/analytics', 
  '/automation',
  '/settings',
  '/api/marketplace',
  '/api/products',
  '/api/analytics'
]

// Публичные маршруты (доступны без аутентификации)
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/api/auth'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Проверяем, требует ли маршрут аутентификации
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Для публичных маршрутов пропускаем проверку
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  try {
    // Создаем Supabase клиент для middleware
    const { supabase, response } = createMiddlewareClient(request)
    
    // Получаем данные о пользователе
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // Если пользователь не аутентифицирован, перенаправляем на логин
    if (error || !user) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Для API маршрутов проверяем валидность сессии
    if (pathname.startsWith('/api/')) {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }
    
    // Пользователь аутентифицирован, продолжаем
    return response
    
  } catch (error) {
    console.error('Middleware error:', error)
    
    // В случае ошибки перенаправляем на логин
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }
}

// Конфигурация matcher для определения на каких маршрутах запускать middleware
export const config = {
  matcher: [
    /*
     * Применяем middleware ко всем маршрутам кроме:
     * - _next/static (статические файлы)
     * - _next/image (оптимизация изображений)
     * - favicon.ico (иконка сайта)
     * - файлов с расширениями (.png, .jpg, .jpeg, .gif, .svg, .ico, .css, .js)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js)$).*)',
  ],
}