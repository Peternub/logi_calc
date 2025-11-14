'use client';

import { useState, useEffect } from 'react';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isServiceWorkerReady: boolean;
  isPushSupported: boolean;
  isSubscribed: boolean;
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isServiceWorkerReady: false,
    isPushSupported: false,
    isSubscribed: false
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Проверка поддержки Service Worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Проверка поддержки Push API
    if ('PushManager' in window) {
      setPwaState(prev => ({ ...prev, isPushSupported: true }));
    }

    // Слушатель события beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaState(prev => ({ ...prev, isInstallable: true }));
    };

    // Проверка установленности PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isNavigatorStandalone = (window.navigator as any).standalone;
    
    if (isStandalone || isNavigatorStandalone) {
      setPwaState(prev => ({ ...prev, isInstalled: true }));
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      setPwaState(prev => ({ ...prev, isServiceWorkerReady: true }));

      // Проверка подписки на push уведомления
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        setPwaState(prev => ({ ...prev, isSubscribed: true }));
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const installPWA = async () => {
    if (!deferredPrompt) return false;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setPwaState(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  };

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
      });

      // TODO: Отправить подписку на сервер
      console.log('Push subscription:', subscription);
      setPwaState(prev => ({ ...prev, isSubscribed: true }));
      return true;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return false;
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        setPwaState(prev => ({ ...prev, isSubscribed: false }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  };

  return {
    ...pwaState,
    installPWA,
    subscribeToPush,
    unsubscribeFromPush
  };
}

// Вспомогательная функция для конвертации VAPID ключа
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}