import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Типы для пользователя
interface User {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
}

// Типы для темы
type Theme = 'light' | 'dark' | 'system'

// Типы для уведомлений
interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

// Интерфейс состояния приложения
interface AppState {
  // Пользователь
  user: User | null
  isAuthenticated: boolean
  
  // Тема
  theme: Theme
  
  // UI состояние
  sidebarOpen: boolean
  loading: boolean
  
  // Уведомления
  notifications: Notification[]
  
  // Действия для пользователя
  setUser: (user: User | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  
  // Действия для темы
  setTheme: (theme: Theme) => void
  
  // Действия для UI
  setSidebarOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  
  // Действия для уведомлений
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

// Создание хранилища состояния приложения
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Начальные значения
      user: null,
      isAuthenticated: false,
      theme: 'system',
      sidebarOpen: true,
      loading: false,
      notifications: [],

      // Действия для пользователя
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      // Действия для темы
      setTheme: (theme) => set({ theme }),

      // Действия для UI
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setLoading: (loading) => set({ loading }),

      // Действия для уведомлений
      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newNotification = { ...notification, id }
        
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }))

        // Автоматическое удаление уведомления
        if (notification.duration !== 0) {
          setTimeout(() => {
            get().removeNotification(id)
          }, notification.duration || 5000)
        }
      },

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id)
        })),

      clearNotifications: () => set({ notifications: [] })
    }),
    {
      name: 'logicalc-app-state',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen
      })
    }
  )
)