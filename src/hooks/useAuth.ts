"use client"

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app'
import type { User } from '@supabase/supabase-js'

// Демо-режим без реального Supabase
const DEMO_MODE = true

// Демо пользователь
const DEMO_USER: User = {
  id: 'demo-user-id',
  email: 'demo@logicalc.ru',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  aud: 'authenticated',
  role: 'authenticated',
  user_metadata: {
    full_name: 'Демо Пользователь',
    avatar_url: null
  },
  app_metadata: {},
  phone: undefined,
  confirmation_sent_at: undefined,
  confirmed_at: '2024-01-01T00:00:00.000Z',
  email_confirmed_at: '2024-01-01T00:00:00.000Z',
  phone_confirmed_at: undefined,
  last_sign_in_at: '2024-01-01T00:00:00.000Z',
  recovery_sent_at: undefined
}

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const { setUser: setStoreUser, setAuthenticated } = useAppStore()

  // Проверяем, что компонент смонтирован на клиенте
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Ожидаем монтирования компонента на клиенте
    if (!mounted) return
    
    // В демо-режиме проверяем локальное хранилище для сохранения сессии
    if (DEMO_MODE) {
      try {
        const savedUser = localStorage.getItem('demo-user')
        const isAuthenticated = localStorage.getItem('demo-authenticated') === 'true'
        
        console.log('Проверка сохраненной сессии:', { savedUser: !!savedUser, isAuthenticated })
        
        if (savedUser && isAuthenticated) {
          const parsedUser = JSON.parse(savedUser)
          console.log('Восстановление пользователя:', parsedUser.email)
          setUser(parsedUser)
          setStoreUser({
            id: parsedUser.id,
            email: parsedUser.email,
            fullName: parsedUser.user_metadata?.full_name || 'Пользователь',
            avatarUrl: parsedUser.user_metadata?.avatar_url || null
          })
          setAuthenticated(true)
        }
      } catch (error) {
        console.error('Ошибка загрузки сохраненной сессии:', error)
        // Очищаем поврежденные данные
        localStorage.removeItem('demo-user')
        localStorage.removeItem('demo-authenticated')
      }
      
      setLoading(false)
      return
    }

    // Здесь был бы код для работы с реальным Supabase
    // const getUser = async () => { ... }
    setLoading(false)
  }, [mounted, setStoreUser, setAuthenticated])

  // Функция входа (демо)
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Проверяем демо-учетные данные
    if ((email === 'demo@logicalc.ru' && password === 'demo123') || 
        (email.includes('@') && password.length >= 6)) {
      
      const demoUser = {
        ...DEMO_USER,
        email: email
      }
      
      setUser(demoUser)
      setStoreUser({
        id: demoUser.id,
        email: demoUser.email,
        fullName: demoUser.user_metadata?.full_name || 'Пользователь',
        avatarUrl: demoUser.user_metadata?.avatar_url || null
      })
      setAuthenticated(true)
      
      // Сохраняем сессию в localStorage для демо-режима
      localStorage.setItem('demo-user', JSON.stringify(demoUser))
      localStorage.setItem('demo-authenticated', 'true')
      
      setLoading(false)
      
      return { data: { user: demoUser, session: null }, error: null }
    } else {
      setLoading(false)
      return { 
        data: { user: null, session: null }, 
        error: { message: 'Неверный email или пароль' } 
      }
    }
  }

  // Функция регистрации (демо)
  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true)
    
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // В демо-режиме всегда успешная регистрация
    const demoUser = {
      ...DEMO_USER,
      email: email,
      user_metadata: {
        full_name: fullName || 'Новый пользователь',
        avatar_url: null
      }
    }
    
    setUser(demoUser)
    setStoreUser({
      id: demoUser.id,
      email: demoUser.email,
      fullName: demoUser.user_metadata?.full_name || 'Пользователь',
      avatarUrl: demoUser.user_metadata?.avatar_url || null
    })
    setAuthenticated(true)
    
    // Сохраняем сессию в localStorage для демо-режима
    localStorage.setItem('demo-user', JSON.stringify(demoUser))
    localStorage.setItem('demo-authenticated', 'true')
    
    setLoading(false)
    
    return { data: { user: demoUser, session: null }, error: null }
  }

  // Функция выхода (демо)
  const signOut = async () => {
    setUser(null)
    setStoreUser(null)
    setAuthenticated(false)
    
    // Очищаем localStorage в демо-режиме
    localStorage.removeItem('demo-user')
    localStorage.removeItem('demo-authenticated')
    
    return { error: null }
  }

  // Функция сброса пароля (демо)
  const resetPassword = async (email: string) => {
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return { 
      data: { message: 'Письмо с инструкциями отправлено на указанный email' }, 
      error: null 
    }
  }

  // Функция обновления пароля (демо)
  const updatePassword = async (password: string) => {
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return { data: { message: 'Пароль успешно обновлен' }, error: null }
  }

  // Функция обновления профиля (демо)
  const updateProfile = async (updates: {
    full_name?: string
    avatar_url?: string
  }) => {
    if (user) {
      const updatedUser = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          ...updates
        }
      }
      
      setUser(updatedUser)
      setStoreUser({
        id: updatedUser.id,
        email: updatedUser.email || '',
        fullName: updatedUser.user_metadata?.full_name || null,
        avatarUrl: updatedUser.user_metadata?.avatar_url || null
      })
    }
    
    return { data: { user }, error: null }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile
  }
}