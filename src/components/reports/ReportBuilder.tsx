'use client';

import { useState } from 'react';
import { ReportConfig } from '@/types/report';

interface ReportBuilderProps {
  initialConfig?: ReportConfig;
  onSave: (config: ReportConfig) => void;
}

export default function ReportBuilder({ initialConfig, onSave }: ReportBuilderProps) {
  const [config, setConfig] = useState<ReportConfig>(
    initialConfig || {
      title: 'Новый отчет',
      dateRange: 'month',
      includeSales: true,
      includeProducts: false,
      includeFinance: false,
      includeMarketing: false,
      chartTypes: ['bar'],
      theme: 'light',
      filters: {}
    }
  );

  const handleSave = () => {
    onSave(config);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Основные настройки</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">Название отчета</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({...config, title: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium">Период времени</label>
            <select
              value={config.dateRange}
              onChange={(e) => setConfig({...config, dateRange: e.target.value as any})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="today">Сегодня</option>
              <option value="week">Последняя неделя</option>
              <option value="month">Последний месяц</option>
              <option value="quarter">Последний квартал</option>
              <option value="year">Последний год</option>
              <option value="custom">Выбрать период</option>
            </select>
          </div>
          
          {config.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Дата начала</label>
                <input
                  type="date"
                  value={config.customDateRange?.from || ''}
                  onChange={(e) => setConfig({...config, customDateRange: {...config.customDateRange, from: e.target.value}})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Дата окончания</label>
                <input
                  type="date"
                  value={config.customDateRange?.to || ''}
                  onChange={(e) => setConfig({...config, customDateRange: {...config.customDateRange, to: e.target.value}})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Включаемые данные</h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.includeSales}
              onChange={(e) => setConfig({...config, includeSales: e.target.checked})}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2">Продажи</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.includeProducts}
              onChange={(e) => setConfig({...config, includeProducts: e.target.checked})}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2">Товары</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.includeFinance}
              onChange={(e) => setConfig({...config, includeFinance: e.target.checked})}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2">Финансы</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.includeMarketing}
              onChange={(e) => setConfig({...config, includeMarketing: e.target.checked})}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2">Маркетинг</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Настройки визуализации</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">Типы графиков</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['bar', 'line', 'pie', 'table'] as const).map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.chartTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig({...config, chartTypes: [...config.chartTypes, type]});
                      } else {
                        setConfig({...config, chartTypes: config.chartTypes.filter(t => t !== type)});
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium">Тема</label>
            <select
              value={config.theme}
              onChange={(e) => setConfig({...config, theme: e.target.value as any})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="light">Светлая</option>
              <option value="dark">Темная</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Сохранить отчет
        </button>
      </div>
    </div>
  );
}