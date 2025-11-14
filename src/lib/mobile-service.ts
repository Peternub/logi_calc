// Types are now defined directly in this file

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

// Сервис мобильной оптимизации
export class MobileService {
  // Получение настроек мобильного интерфейса
  static async getMobileSettings(userId: string): Promise<MobileSettings | null> {
    // TODO: Реализовать получение настроек из базы данных
    return null;
  }

  // Обновление настроек мобильного интерфейса
  static async updateMobileSettings(settings: MobileSettings): Promise<MobileSettings> {
    // TODO: Реализовать обновление настроек в базе данных
    throw new Error('Not implemented');
  }

  // Получение настроек touch-friendly элементов
  static async getTouchSettings(userId: string): Promise<TouchSettings | null> {
    // TODO: Реализовать получение настроек touch из базы данных
    return null;
  }

  // Обновление настроек touch-friendly элементов
  static async updateTouchSettings(settings: TouchSettings): Promise<TouchSettings> {
    // TODO: Реализовать обновление настроек touch в базе данных
    throw new Error('Not implemented');
  }

  // Получение настроек производительности
  static async getPerformanceSettings(userId: string): Promise<PerformanceSettings | null> {
    // TODO: Реализовать получение настроек производительности из базы данных
    return null;
  }

  // Обновление настроек производительности
  static async updatePerformanceSettings(settings: PerformanceSettings): Promise<PerformanceSettings> {
    // TODO: Реализовать обновление настроек производительности в базе данных
    throw new Error('Not implemented');
  }

  // Получение настроек оффлайн-режима
  static async getOfflineSettings(userId: string): Promise<OfflineSettings | null> {
    // TODO: Реализовать получение настроек оффлайн-режима из базы данных
    return null;
  }

  // Обновление настроек оффлайн-режима
  static async updateOfflineSettings(settings: OfflineSettings): Promise<OfflineSettings> {
    // TODO: Реализовать обновление настроек оффлайн-режима в базе данных
    throw new Error('Not implemented');
  }

  // Проверка мобильного устройства
  static isMobileDevice(userAgent: string): boolean {
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent);
  }

  // Получение рекомендуемых настроек для мобильного устройства
  static getRecommendedSettings(userAgent: string): Partial<MobileSettings & TouchSettings & PerformanceSettings> {
    const isMobile = this.isMobileDevice(userAgent);
    
    if (isMobile) {
      return {
        touchFriendly: true,
        buttonSize: 'large',
        tapZone: 'extended',
        lazyLoading: true,
        imageCompression: 'medium',
        dataSaverMode: false
      };
    }
    
    return {
      touchFriendly: false,
      buttonSize: 'normal',
      tapZone: 'normal',
      lazyLoading: false,
      imageCompression: 'low',
      dataSaverMode: false
    };
  }
}