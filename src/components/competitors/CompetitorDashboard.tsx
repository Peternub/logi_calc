'use client';

import { useState, useEffect } from 'react';
import { Competitor } from '@/types/competitor';

export default function CompetitorDashboard() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [activeTab, setActiveTab] = useState<'prices' | 'positions' | 'trends' | 'alerts'>('prices');
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка списка конкурентов
  useEffect(() => {
    const loadCompetitors = async () => {
      setIsLoading(true);
      // TODO: Загрузить список конкурентов через API
      setCompetitors([]);
      setIsLoading(false);
    };
    
    loadCompetitors();
  }, []);

  const handleAddCompetitor = () => {
    // TODO: Открыть модальное окно для добавления конкурента
    console.log('Add competitor');
  };

  const handleSyncPrices = async (competitorId: string) => {
    // TODO: Запустить синхронизацию цен
    console.log('Sync prices for', competitorId);
  };

  const handleSyncPositions = async (competitorId: string) => {
    // TODO: Запустить синхронизацию позиций
    console.log('Sync positions for', competitorId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Анализ конкурентов</h1>
        <button
          onClick={handleAddCompetitor}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Добавить конкурента
        </button>
      </div>

      {isLoading ? (
        <div>Загрузка...</div>
      ) : competitors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">У вас пока нет ни одного конкурента для мониторинга.</p>
          <button
            onClick={handleAddCompetitor}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Добавить первого конкурента
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {competitors.map((competitor) => (
              <li key={competitor.id} className="px-6 py-4 sm:px-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{competitor.name}</h3>
                    <p className="text-sm text-gray-500">{competitor.marketplace}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Товаров в мониторинге: {competitor.monitoredProducts.length}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSyncPrices(competitor.id)}
                      disabled={!competitor.priceMonitoringEnabled}
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                        competitor.priceMonitoringEnabled 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Синхр. цен
                    </button>
                    <button
                      onClick={() => handleSyncPositions(competitor.id)}
                      disabled={!competitor.positionMonitoringEnabled}
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                        competitor.positionMonitoringEnabled 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Синхр. позиций
                    </button>
                    <button
                      onClick={() => setSelectedCompetitor(competitor)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                      Подробнее
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal for detailed view */}
      {selectedCompetitor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {selectedCompetitor.name}
                </h3>
                <button
                  onClick={() => setSelectedCompetitor(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('prices')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'prices'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Цены
                  </button>
                  <button
                    onClick={() => setActiveTab('positions')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'positions'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Позиции
                  </button>
                  <button
                    onClick={() => setActiveTab('trends')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'trends'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Тренды
                  </button>
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'alerts'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Алерты
                  </button>
                </nav>
              </div>
              
              {/* Tab content */}
              <div className="mt-4">
                {activeTab === 'prices' && (
                  <div>
                    <h4 className="text-md font-medium mb-2">Мониторинг цен</h4>
                    <p>Данные о ценах конкурента и сравнение с вашими ценами.</p>
                    {/* Здесь будет график сравнения цен */}
                  </div>
                )}
                {activeTab === 'positions' && (
                  <div>
                    <h4 className="text-md font-medium mb-2">Позиции в поиске</h4>
                    <p>Данные о позициях конкурента в поисковой выдаче.</p>
                    {/* Здесь будет график позиций */}
                  </div>
                )}
                {activeTab === 'trends' && (
                  <div>
                    <h4 className="text-md font-medium mb-2">Тренды рынка</h4>
                    <p>Анализ рыночных трендов на основе данных о конкурентах.</p>
                    {/* Здесь будут данные о трендах */}
                  </div>
                )}
                {activeTab === 'alerts' && (
                  <div>
                    <h4 className="text-md font-medium mb-2">Настройка алертов</h4>
                    <p>Управление правилами уведомлений о изменениях у конкурентов.</p>
                    {/* Здесь будет управление алертами */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}