// Типы для системы мобильной оптимизации

// Настройки мобильного интерфейса
export interface MobileSettings {
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'normal' | 'large';
  touchFriendly: boolean;
  offlineMode: boolean;
  createdAt: string;
  updatedAt: string;
}

// Настройки touch-friendly элементов
export interface TouchSettings {
  userId: string;
  buttonSize: 'small' | 'normal' | 'large';
  tapZone: 'normal' | 'extended';
  gestureSupport: boolean;
  swipeNavigation: boolean;
  createdAt: string;
  updatedAt: string;
}

// Настройки производительности
export interface PerformanceSettings {
  userId: string;
  imageCompression: 'low' | 'medium' | 'high';
  lazyLoading: boolean;
  prefetchStrategy: 'aggressive' | 'conservative' | 'disabled';
  dataSaverMode: boolean;
  createdAt: string;
  updatedAt: string;
}

// Настройки оффлайн-режима
export interface OfflineSettings {
  userId: string;
  enabled: boolean;
  cacheStrategy: 'essential' | 'full' | 'custom';
  syncOnReconnect: boolean;
  dataLimit: string;
  createdAt: string;
  updatedAt: string;
}