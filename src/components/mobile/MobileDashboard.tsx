'use client';

import { useState, useEffect } from 'react';
import { MobileSettings } from '@/types/mobile';
import PWASettings from '@/components/pwa/PWASettings';

export default function MobileDashboard() {
  const [settings, setSettings] = useState<MobileSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'interface' | 'touch' | 'performance' | 'offline' | 'pwa'>('interface');
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка настроек мобильного интерфейса
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      // TODO: Загрузить настройки через API
      setSettings(null);
      setIsLoading(false);
    };
    
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    // TODO: Сохранить настройки через API
    console.log('Save mobile settings');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Мобильная оптимизация</h1>
        <button
          onClick={handleSaveSettings}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Сохранить настройки
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('interface')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'interface'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Интерфейс
          </button>
          <button
            onClick={() => setActiveTab('touch')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'touch'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Touch-элементы
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'performance'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Производительность
          </button>
          <button
            onClick={() => setActiveTab('offline')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'offline'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Оффлайн-режим
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pwa'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            PWA функции
          </button>
        </nav>
      </div>

      {isLoading ? (
        <div>Загрузка...</div>
      ) : (
        <div className="mt-4">
          {activeTab === 'interface' && (
            <div className="space-y-4">
              <h4 className="text-md font-medium mb-2">Настройки интерфейса</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Тема</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option value="auto">Автоматическая</option>
                    <option value="light">Светлая</option>
                    <option value="dark">Темная</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Размер шрифта</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option value="small">Маленький</option>
                    <option value="normal">Обычный</option>
                    <option value="large">Большой</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2">Адаптировать для сенсорных экранов</span>
                </label>
              </div>
            </div>
          )}
          {activeTab === 'touch' && (
            <div className="space-y-4">
              <h4 className="text-md font-medium mb-2">Touch-friendly элементы</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Размер кнопок</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option value="small">Маленький</option>
                    <option value="normal">Обычный</option>
                    <option value="large">Большой</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Зоны касания</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option value="normal">Обычные</option>
                    <option value="extended">Расширенные</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2">Поддержка жестов</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2">Навигация свайпами</span>
                </label>
              </div>
            </div>
          )}
          {activeTab === 'performance' && (
            <div className="space-y-4">
              <h4 className="text-md font-medium mb-2">Оптимизация производительности</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Сжатие изображений</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option value="low">Низкое</option>
                    <option value="medium">Среднее</option>
                    <option value="high">Высокое</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Стратегия предзагрузки</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option value="disabled">Отключена</option>
                    <option value="conservative">Консервативная</option>
                    <option value="aggressive">Агрессивная</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2">Ленивая загрузка</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2">Режим экономии трафика</span>
                </label>
              </div>
            </div>
          )}
          {activeTab === 'offline' && (
            <div className="space-y-4">
              <h4 className="text-md font-medium mb-2">Оффлайн-функциональность</h4>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2">Включить оффлайн-режим</span>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Стратегия кэширования</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option value="essential">Только необходимое</option>
                    <option value="full">Полное кэширование</option>
                    <option value="custom">Настраиваемое</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Лимит данных</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option value="5MB">5 МБ</option>
                    <option value="10MB">10 МБ</option>
                    <option value="25MB">25 МБ</option>
                    <option value="50MB">50 МБ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2">Синхронизация при восстановлении соединения</span>
                </label>
              </div>
            </div>
          )}
          {activeTab === 'pwa' && (
            <PWASettings />
          )}
        </div>
      )}
    </div>
  );
}