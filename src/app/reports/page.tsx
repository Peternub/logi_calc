'use client';

import { useState, useEffect } from 'react';
import ReportBuilder from '@/components/reports/ReportBuilder';
import { Report } from '@/types/report';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка списка отчетов
  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      // TODO: Загрузить список отчетов через API
      setReports([]);
      setIsLoading(false);
    };
    
    loadReports();
  }, []);

  const handleCreateReport = () => {
    setSelectedReport(null);
    setIsBuilderOpen(true);
  };

  const handleEditReport = (report: Report) => {
    setSelectedReport(report);
    setIsBuilderOpen(true);
  };

  const handleDeleteReport = async (id: string) => {
    if (confirm('Вы действительно хотите удалить этот отчет?')) {
      // TODO: Удалить отчет через API
      setReports(reports.filter(r => r.id !== id));
    }
  };

  const handleSaveReport = async (config: any) => {
    // TODO: Сохранить отчет через API
    setIsBuilderOpen(false);
    // Перезагрузить список отчетов
  };

  const handleGenerateReport = async (id: string) => {
    // TODO: Сгенерировать отчет через API
    window.open(`/api/reports/${id}/generate`, '_blank');
  };

  const handleExportReport = async (id: string, format: 'pdf' | 'excel' | 'csv' | 'json') => {
    // TODO: Экспортировать отчет через API
    window.open(`/api/reports/${id}/export?format=${format}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Отчеты</h1>
        <button
          onClick={handleCreateReport}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Создать отчет
        </button>
      </div>

      {isLoading ? (
        <div>Загрузка...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">У вас пока нет ни одного отчета.</p>
          <button
            onClick={handleCreateReport}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Создать первый отчет
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {reports.map((report) => (
              <li key={report.id} className="px-6 py-4 sm:px-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{report.name}</h3>
                    <p className="text-sm text-gray-500">{report.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Создан: {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleGenerateReport(report.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                      Просмотр
                    </button>
                    <div className="relative group">
                      <button
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                      >
                        Экспорт
                      </button>
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden group-hover:block">
                        <div className="py-1">
                          <button
                            onClick={() => handleExportReport(report.id, 'pdf')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => handleExportReport(report.id, 'excel')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Excel
                          </button>
                          <button
                            onClick={() => handleExportReport(report.id, 'csv')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            CSV
                          </button>
                          <button
                            onClick={() => handleExportReport(report.id, 'json')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            JSON
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditReport(report)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
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

      {isBuilderOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                {selectedReport ? 'Редактирование отчета' : 'Создание нового отчета'}
              </h3>
              <ReportBuilder 
                initialConfig={selectedReport?.config} 
                onSave={handleSaveReport} 
              />
              <div className="mt-5 text-right">
                <button
                  onClick={() => setIsBuilderOpen(false)}
                  className="mr-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}