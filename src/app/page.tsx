import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { BarChart3, TrendingUp, Users, ShoppingCart, Activity, Shield } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LogiCalc</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Description */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                Аналитика маркетплейсов
                <span className="text-blue-600"> с ИИ</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Управляйте продажами на Ozon, Wildberries и Яндекс.Маркет из единого интерфейса. 
                Автоматизируйте ценообразование и получайте insights с помощью ИИ.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Аналитика продаж</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Отслеживайте выручку, заказы и прибыль в реальном времени</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Activity className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Автоматизация</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Автоматическое управление ценами и уведомления</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ShoppingCart className="h-6 w-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Мульти-платформа</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Ozon, Wildberries, Яндекс.Маркет в одном месте</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-red-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">ИИ помощник</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Умные рекомендации и анализ конкурентов</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Forms */}
          <div className="space-y-6">
            {/* Login Card */}
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Вход в систему</CardTitle>
                <CardDescription>
                  Войдите в свой аккаунт для доступа к аналитике
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="ваш@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-3">
                  <Link href="/auth/login" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Войти
                    </Button>
                  </Link>
                  <Link href="/auth/forgot-password" className="block text-center">
                    <Button variant="ghost" className="w-full text-sm">
                      Забыли пароль?
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Register Card */}
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Нет аккаунта?</CardTitle>
                <CardDescription>
                  Создайте аккаунт и начните анализировать продажи
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/auth/register" className="w-full">
                  <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                    Создать аккаунт
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Demo Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600">1000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Активных продавцов</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-green-600">50M+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Обработанных заказов</div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 LogiCalc. Сервис аналитики маркетплейсов.</p>
        </div>
      </footer>
    </div>
  )
}
