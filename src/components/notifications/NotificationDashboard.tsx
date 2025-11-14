'use client';

import { useState, useEffect } from 'react';
import { Notification } from '@/types/notification';

export default function NotificationDashboard() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'triggers' | 'channels'>('list');
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка уведомлений
  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      // TODO: Загрузить уведомления через API
      setNotifications([]);
      setIsLoading(false);
    };
    
    loadNotifications();
  }, []);

  const handleMarkAsRead = (id: string) => {
    // TODO: Пометить уведомление как прочитанное
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleDeleteNotification = (id: string) => {
    if (confirm('Вы действительно хотите удалить это уведомление?')) {
      // TODO: Удалить уведомление через API
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  const handleClearAll = () => {
    if (confirm('Вы действительно хотите удалить все уведомления?')) {
      // TODO: Удалить все уведомления через API
      setNotifications([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Уведомления</h1>
        <button
          onClick={handleClearAll}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          Очистить все
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Уведомления
          </button>
          <button
            onClick={() => setActiveTab('triggers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'triggers'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Триггеры
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'channels'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Каналы
          </button>
        </nav>
      </div>

      {isLoading ? (
        <div>Загрузка...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">У вас пока нет новых уведомлений.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li key={notification.id} className={`px-6 py-4 sm:px-8 ${!notification.read ? 'bg-blue-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium">{notification.title}</h3>
                      {!notification.read && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Новое
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                      >
                        Прочитано
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        {activeTab === 'list' && (
          <div>
            <h4 className="text-md font-medium mb-2">Список уведомлений</h4>
            <p>Просмотр и управление вашими уведомлениями.</p>
          </div>
        )}
        {activeTab === 'triggers' && (
          <div>
            <h4 className="text-md font-medium mb-2">Настройка триггеров</h4>
            <p>Настройте условия, при которых будут отправляться уведомления.</p>
            {/* Здесь будет управление триггерами */}
          </div>
        )}
        {activeTab === 'channels' && (
          <div>
            <h4 className="text-md font-medium mb-2">Каналы доставки</h4>
            <p>Управление каналами доставки уведомлений: email, Telegram, push.</p>
            {/* Здесь будет управление каналами */}
          </div>
        )}
      </div>
    </div>
  );
}