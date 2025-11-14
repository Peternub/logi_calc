'use client';

import { useState, useEffect } from 'react';
import { AutomationScenario } from '@/types/automation';

export default function AutomationDashboard() {
  const [scenarios, setScenarios] = useState<AutomationScenario[]>([]);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'rules' | 'scheduler' | 'safety'>('scenarios');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newScenario, setNewScenario] = useState({
    name: '',
    description: '',
    priority: 2
  });

  // Загрузка сценариев автопилота
  useEffect(() => {
    const loadScenarios = async () => {
      setIsLoading(true);
      // TODO: Загрузить сценарии автопилота через API
      setScenarios([]);
      setIsLoading(false);
    };
    
    loadScenarios();
  }, []);

  const handleCreateScenario = () => {
    setShowCreateForm(true);
  };

  const handleSaveScenario = () => {
    if (!newScenario.name.trim()) {
      alert('Пожалуйста, введите название сценария');
      return;
    }

    const scenario: AutomationScenario = {
      id: `scenario-${Date.now()}`,
      name: newScenario.name,
      description: newScenario.description || 'Автоматический сценарий',
      active: false,
      priority: newScenario.priority,
      conditions: [],
      actions: [],
      schedule: {
        type: 'daily'
      },
      userId: 'demo-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setScenarios([...scenarios, scenario]);
    setNewScenario({ name: '', description: '', priority: 2 });
    setShowCreateForm(false);
  };

  const handleCancelCreate = () => {
    setNewScenario({ name: '', description: '', priority: 2 });
    setShowCreateForm(false);
  };

  const handleEditScenario = (scenario: AutomationScenario) => {
    // TODO: Открыть форму редактирования сценария
    console.log('Edit scenario:', scenario.id);
  };

  const handleDeleteScenario = (id: string) => {
    if (confirm('Вы действительно хотите удалить этот сценарий?')) {
      // TODO: Удалить сценарий через API
      setScenarios(scenarios.filter(s => s.id !== id));
    }
  };

  const handleToggleScenario = (id: string, active: boolean) => {
    // TODO: Обновить статус сценария через API
    setScenarios(scenarios.map(s => 
      s.id === id ? { ...s, active } : s
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Настройки автоматизации</h1>
        <button
          onClick={handleCreateScenario}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Создать сценарий
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'scenarios'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Сценарии автопилота
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Правила и условия
          </button>
          <button
            onClick={() => setActiveTab('scheduler')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'scheduler'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Планировщик действий
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'safety'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Безопасные ограничения
          </button>
        </nav>
      </div>

      {isLoading ? (
        <div>Загрузка...</div>
      ) : scenarios.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">У вас пока нет ни одного сценария автоматизации.</p>
          <button
            onClick={handleCreateScenario}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Создать первый сценарий
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {scenarios.map((scenario) => (
              <li key={scenario.id} className="px-6 py-4 sm:px-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium">{scenario.name}</h3>
                      {scenario.active && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Активен
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{scenario.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Приоритет: {scenario.priority} | {scenario.schedule.type}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={scenario.active}
                        onChange={(e) => handleToggleScenario(scenario.id, e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm">Активен</span>
                    </label>
                    <button
                      onClick={() => handleEditScenario(scenario)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDeleteScenario(scenario.id)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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

      {/* Модальное окно создания сценария */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Создать новый сценарий</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название сценария
                </label>
                <input
                  type="text"
                  value={newScenario.name}
                  onChange={(e) => setNewScenario({...newScenario, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Например: Оптимизация цен на Ozon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={newScenario.description}
                  onChange={(e) => setNewScenario({...newScenario, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Краткое описание сценария..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Приоритет
                </label>
                <select
                  value={newScenario.priority}
                  onChange={(e) => setNewScenario({...newScenario, priority: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={1}>Низкий</option>
                  <option value={2}>Средний</option>
                  <option value={3}>Высокий</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex space-x-3">
              <button
                onClick={handleSaveScenario}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Создать
              </button>
              <button
                onClick={handleCancelCreate}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}