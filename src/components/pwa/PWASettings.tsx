'use client';

import { usePWA } from '@/hooks/usePWA';

export default function PWASettings() {
  const {
    isInstallable,
    isInstalled,
    isServiceWorkerReady,
    isPushSupported,
    isSubscribed,
    installPWA,
    subscribeToPush,
    unsubscribeFromPush
  } = usePWA();

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      alert('Приложение успешно установлено!');
    } else {
      alert('Не удалось установить приложение');
    }
  };

  const handlePushSubscription = async () => {
    if (isSubscribed) {
      const success = await unsubscribeFromPush();
      if (success) {
        alert('Подписка на уведомления отключена');
      }
    } else {
      const success = await subscribeToPush();
      if (success) {
        alert('Подписка на уведомления активирована');
      } else {
        alert('Не удалось подписаться на уведомления');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">PWA функции</h3>
        
        {/* Service Worker статус */}
        <div className="mb-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Service Worker</h4>
              <p className="text-sm text-gray-500">
                Обеспечивает кэширование и офлайн-работу
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${
              isServiceWorkerReady 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isServiceWorkerReady ? 'Активен' : 'Неактивен'}
            </div>
          </div>
        </div>

        {/* Установка приложения */}
        <div className="mb-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Установка приложения</h4>
              <p className="text-sm text-gray-500">
                Установите приложение на устройство для быстрого доступа
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isInstalled ? (
                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Установлено
                </span>
              ) : isInstallable ? (
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Установить
                </button>
              ) : (
                <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                  Недоступно
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Push уведомления */}
        <div className="mb-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Push уведомления</h4>
              <p className="text-sm text-gray-500">
                Получайте уведомления даже когда приложение закрыто
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {!isPushSupported ? (
                <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                  Не поддерживается
                </span>
              ) : (
                <button
                  onClick={handlePushSubscription}
                  className={`px-4 py-2 rounded-md ${
                    isSubscribed
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isSubscribed ? 'Отключить' : 'Включить'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Кэширование */}
        <div className="mb-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Кэширование</h4>
              <p className="text-sm text-gray-500">
                Сохранение данных для быстрого доступа и офлайн-работы
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if ('caches' in window) {
                    caches.keys().then(names => {
                      names.forEach(name => {
                        caches.delete(name);
                      });
                    });
                    alert('Кэш очищен');
                  }
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Очистить кэш
              </button>
            </div>
          </div>
        </div>

        {/* Информация о возможностях */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Возможности PWA</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Работа в офлайн-режиме</li>
            <li>• Установка как нативное приложение</li>
            <li>• Push уведомления</li>
            <li>• Быстрая загрузка страниц</li>
            <li>• Автоматическое обновление</li>
          </ul>
        </div>
      </div>
    </div>
  );
}