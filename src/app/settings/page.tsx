'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings as SettingsIcon, 
  User,
  Bell,
  Shield,
  Globe,
  Palette,
  Download,
  Trash2
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'appearance' | 'data'>('profile');
  const [userInfo, setUserInfo] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    timezone: 'Europe/Moscow'
  });

  const tabs = [
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'notifications', label: 'Уведомления', icon: Bell },
    { id: 'privacy', label: 'Приватность', icon: Shield },
    { id: 'appearance', label: 'Внешний вид', icon: Palette },
    { id: 'data', label: 'Данные', icon: Download },
  ];

  const handleSaveProfile = () => {
    // TODO: Сохранить профиль пользователя
    console.log('Saving profile:', userInfo);
  };

  const handleDeleteAccount = () => {
    if (confirm('Вы действительно хотите удалить аккаунт? Это действие нельзя отменить.')) {
      // TODO: Удалить аккаунт пользователя
      console.log('Deleting account');
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center space-x-3 mb-8">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Настройки аккаунта</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Боковое меню */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Контент */}
          <div className="lg:col-span-3">
            {/* Профиль */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Информация профиля</CardTitle>
                  <CardDescription>
                    Управляйте информацией вашего аккаунта и настройками профиля
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Полное имя</Label>
                      <Input
                        id="fullName"
                        value={userInfo.fullName}
                        onChange={(e) => setUserInfo({...userInfo, fullName: e.target.value})}
                        placeholder="Введите ваше имя"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userInfo.email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Телефон</Label>
                      <Input
                        id="phone"
                        value={userInfo.phone}
                        onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Компания</Label>
                      <Input
                        id="company"
                        value={userInfo.company}
                        onChange={(e) => setUserInfo({...userInfo, company: e.target.value})}
                        placeholder="Название компании"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone">Часовой пояс</Label>
                    <select 
                      id="timezone"
                      value={userInfo.timezone}
                      onChange={(e) => setUserInfo({...userInfo, timezone: e.target.value})}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="Europe/Moscow">Москва (UTC+3)</option>
                      <option value="Europe/Samara">Самара (UTC+4)</option>
                      <option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</option>
                      <option value="Asia/Novosibirsk">Новосибирск (UTC+7)</option>
                      <option value="Asia/Vladivostok">Владивосток (UTC+10)</option>
                    </select>
                  </div>

                  <div className="flex justify-between">
                    <Button onClick={handleSaveProfile}>
                      Сохранить изменения
                    </Button>
                    <Button variant="outline">
                      Изменить пароль
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Уведомления */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Настройки уведомлений</CardTitle>
                  <CardDescription>
                    Выберите, какие уведомления вы хотите получать
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email уведомления</h4>
                        <p className="text-sm text-muted-foreground">Получать уведомления на email</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Изменения цен</h4>
                        <p className="text-sm text-muted-foreground">Уведомления о значительных изменениях цен</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Новые заказы</h4>
                        <p className="text-sm text-muted-foreground">Уведомления о новых заказах</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Еженедельные отчеты</h4>
                        <p className="text-sm text-muted-foreground">Получать сводку за неделю</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                  <Button>Сохранить настройки</Button>
                </CardContent>
              </Card>
            )}

            {/* Внешний вид */}
            {activeTab === 'appearance' && (
              <Card>
                <CardHeader>
                  <CardTitle>Внешний вид</CardTitle>
                  <CardDescription>
                    Настройте внешний вид приложения под себя
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Тема оформления</h4>
                      <p className="text-sm text-muted-foreground">Выберите светлую или темную тему</p>
                    </div>
                    <ThemeToggle />
                  </div>
                  <div>
                    <Label>Размер шрифта</Label>
                    <select defaultValue="normal" className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background">
                      <option value="small">Мелкий</option>
                      <option value="normal">Обычный</option>
                      <option value="large">Крупный</option>
                    </select>
                  </div>
                  <Button>Применить настройки</Button>
                </CardContent>
              </Card>
            )}

            {/* Приватность */}
            {activeTab === 'privacy' && (
              <Card>
                <CardHeader>
                  <CardTitle>Приватность и безопасность</CardTitle>
                  <CardDescription>
                    Управление конфиденциальностью ваших данных
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Двухфакторная аутентификация</h4>
                        <p className="text-sm text-muted-foreground">Дополнительная защита аккаунта</p>
                      </div>
                      <Button variant="outline" size="sm">Настроить</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">История входов</h4>
                        <p className="text-sm text-muted-foreground">Просмотр последних входов в систему</p>
                      </div>
                      <Button variant="outline" size="sm">Просмотреть</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Аналитика использования</h4>
                        <p className="text-sm text-muted-foreground">Разрешить сбор анонимной статистики</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Данные */}
            {activeTab === 'data' && (
              <Card>
                <CardHeader>
                  <CardTitle>Управление данными</CardTitle>
                  <CardDescription>
                    Экспорт, импорт и удаление ваших данных
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Экспорт данных</h4>
                        <p className="text-sm text-muted-foreground">Скачать все ваши данные</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Экспорт
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Очистить кэш</h4>
                        <p className="text-sm text-muted-foreground">Удалить временные файлы</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Очистить
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-800">Опасная зона</h4>
                      <p className="text-sm text-red-600 mb-3">
                        Удаление аккаунта приведет к полной потере всех данных
                      </p>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleDeleteAccount}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить аккаунт
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}