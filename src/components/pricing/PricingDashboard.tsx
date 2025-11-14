'use client';

import { useState, useEffect } from 'react';
import { PricingRule } from '@/types/pricing';

export default function PricingDashboard() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'profitability' | 'logs'>('rules');
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка правил ценообразования
  useEffect(() => {
    const loadRules = async () => {
      setIsLoading(true);
      // TODO: Загрузить правила ценообразования через API
      setRules([]);
      setIsLoading(false);
    };
    
    loadRules();
  }, []);

  const handleCreateRule = () => {
    // TODO: Открыть форму для создания нового правила
    console.log('Create new pricing rule');
  };

  const handleEditRule = (rule: PricingRule) => {
    setSelectedRule(rule);
    // TODO: Открыть форму редактирования правила
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('Вы действительно хотите удалить это правило?')) {
      // TODO: Удалить правило через API
      setRules(rules.filter(r => r.id !== id));
    }
  };

  const handleApplyRules = async () => {
    // TODO: Применить все правила ценообразования
    console.log('Applying all pricing rules');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Автоматическое управление ценами</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleApplyRules}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Применить правила
          </button>
          <button
            onClick={handleCreateRule}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Создать правило
          </button>
        </div>
      </div>

      {isLoading ? (
        <div>Загрузка...</div>
      ) : rules.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">У вас пока нет ни одного правила автоматического ценообразования.</p>
          <button
            onClick={handleCreateRule}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Создать первое правило
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {rules.map((rule) => (
              <li key={rule.id} className="px-6 py-4 sm:px-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{rule.name}</h3>
                    <p className="text-sm text-gray-500">{rule.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Приоритет: {rule.priority} | {rule.active ? 'Активно' : 'Неактивно'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditRule(rule)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
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

      {/* Tabs for different views */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Правила
          </button>
          <button
            onClick={() => setActiveTab('profitability')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profitability'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Рентабельность
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Логи изменений
          </button>
        </nav>
      </div>
      
      <div className="mt-4">
        {activeTab === 'rules' && (
          <div>
            <h4 className="text-md font-medium mb-2">Управление правилами</h4>
            <p>Настройте правила автоматического изменения цен на ваши товары.</p>
            {/* Здесь будет управление правилами */}
          </div>
        )}
        {activeTab === 'profitability' && (
          <div>
            <h4 className="text-md font-medium mb-2">Мониторинг рентабельности</h4>
            <p>Данные о маржинальности и рентабельности ваших товаров.</p>
            {/* Здесь будут данные о рентабельности */}
          </div>
        )}
        {activeTab === 'logs' && (
          <div>
            <h4 className="text-md font-medium mb-2">Логи изменений цен</h4>
            <p>История всех изменений цен, как автоматических, так и ручных.</p>
            {/* Здесь будет история изменений цен */}
          </div>
        )}
      </div>
    </div>
  );
}