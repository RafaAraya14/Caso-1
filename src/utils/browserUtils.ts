/**
 * Browser Utilities
 *
 * Conjunto de utilidades para interacción con el navegador.
 * Incluye detección de dispositivos, manipulación del DOM y localStorage.
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown';

export class BrowserUtils {
  private static instance: BrowserUtils;

  private constructor() {}

  public static getInstance(): BrowserUtils {
    if (!BrowserUtils.instance) {
      BrowserUtils.instance = new BrowserUtils();
    }
    return BrowserUtils.instance;
  }
}

// Detección de soporte y capacidades

export const isSupported = (feature: string): boolean => {
  const features: Record<string, () => boolean> = {
    localStorage: () => typeof Storage !== 'undefined',
    sessionStorage: () => typeof Storage !== 'undefined',
    geolocation: () => 'geolocation' in navigator,
    notifications: () => 'Notification' in window,
    serviceWorker: () => 'serviceWorker' in navigator,
    webRTC: () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    webGL: () => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    },
    webAssembly: () => typeof WebAssembly === 'object',
    touchEvents: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  };

  return features[feature] ? features[feature]() : false;
};

// Información del dispositivo

export const getDeviceInfo = (): { type: DeviceType; os: string; browser: BrowserType } => {
  const { userAgent } = navigator;

  // Detectar tipo de dispositivo
  let type: DeviceType = 'desktop';
  if (/Mobi|Android/i.test(userAgent)) {
    type = 'mobile';
  } else if (/Tablet|iPad/i.test(userAgent)) {
    type = 'tablet';
  }

  // Detectar OS
  let os = 'Unknown';
  if (userAgent.indexOf('Windows') !== -1) {
    os = 'Windows';
  } else if (userAgent.indexOf('Mac') !== -1) {
    os = 'MacOS';
  } else if (userAgent.indexOf('Linux') !== -1) {
    os = 'Linux';
  } else if (userAgent.indexOf('Android') !== -1) {
    os = 'Android';
  } else if (userAgent.indexOf('iOS') !== -1) {
    os = 'iOS';
  }

  // Detectar navegador
  let browser: BrowserType = 'unknown';
  if (userAgent.indexOf('Chrome') !== -1) {
    browser = 'chrome';
  } else if (userAgent.indexOf('Firefox') !== -1) {
    browser = 'firefox';
  } else if (userAgent.indexOf('Safari') !== -1) {
    browser = 'safari';
  } else if (userAgent.indexOf('Edge') !== -1) {
    browser = 'edge';
  } else if (userAgent.indexOf('Opera') !== -1) {
    browser = 'opera';
  }

  return { type, os, browser };
};

export const isMobile = (): boolean => getDeviceInfo().type === 'mobile';
export const isTablet = (): boolean => getDeviceInfo().type === 'tablet';
export const isDesktop = (): boolean => getDeviceInfo().type === 'desktop';

export const getBrowserInfo = () => {
  const { browser } = getDeviceInfo();
  const version =
    navigator.userAgent.match(/(?:Chrome|Firefox|Safari|Edge|Opera)\/(\d+)/)?.[1] || 'Unknown';

  return {
    name: browser,
    version,
    userAgent: navigator.userAgent,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
  };
};

// Manipulación del clipboard

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para navegadores sin soporte de Clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

// Descarga de archivos

export const downloadFile = (data: string | Blob, filename: string, mimeType?: string): void => {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType || 'text/plain' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Navegación y scroll

export const scrollToElement = (
  element: Element | string,
  options?: ScrollIntoViewOptions
): void => {
  const target = typeof element === 'string' ? document.querySelector(element) : element;

  if (target) {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      ...options,
    });
  }
};

export const getScrollPosition = (): { x: number; y: number } => {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop,
  };
};

// Debounce y throttle

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Storage utilities

interface StorageInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  length: number;
}

class SafeStorage implements StorageInterface {
  private storage: Storage | null;
  private fallback: Map<string, string> = new Map();

  constructor(storageType: 'localStorage' | 'sessionStorage') {
    try {
      this.storage = window[storageType];
      // Test si podemos escribir
      this.storage.setItem('__test__', 'test');
      this.storage.removeItem('__test__');
    } catch {
      this.storage = null;
    }
  }

  getItem(key: string): string | null {
    try {
      return this.storage ? this.storage.getItem(key) : this.fallback.get(key) || null;
    } catch {
      return this.fallback.get(key) || null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      if (this.storage) {
        this.storage.setItem(key, value);
      } else {
        this.fallback.set(key, value);
      }
    } catch {
      this.fallback.set(key, value);
    }
  }

  removeItem(key: string): void {
    try {
      if (this.storage) {
        this.storage.removeItem(key);
      } else {
        this.fallback.delete(key);
      }
    } catch {
      this.fallback.delete(key);
    }
  }

  clear(): void {
    try {
      if (this.storage) {
        this.storage.clear();
      } else {
        this.fallback.clear();
      }
    } catch {
      this.fallback.clear();
    }
  }

  key(index: number): string | null {
    try {
      if (this.storage) {
        return this.storage.key(index);
      } else {
        const keys = Array.from(this.fallback.keys());
        return keys[index] || null;
      }
    } catch {
      return null;
    }
  }

  get length(): number {
    try {
      return this.storage ? this.storage.length : this.fallback.size;
    } catch {
      return this.fallback.size;
    }
  }
}

export const localStorage = new SafeStorage('localStorage');
export const sessionStorage = new SafeStorage('sessionStorage');

// Utilidades específicas para la aplicación

export const saveUserPreferences = (preferences: Record<string, any>): void => {
  localStorage.setItem('userPreferences', JSON.stringify(preferences));
};

export const getUserPreferences = (): Record<string, any> => {
  try {
    const stored = localStorage.getItem('userPreferences');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const clearUserData = (): void => {
  const keysToRemove = ['userPreferences', 'authToken', 'sessionData'];
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

export const trackPageView = (page: string): void => {
  // En una implementación real, esto enviaría datos a analytics
  console.log(`Page view: ${page}`);
};

export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const isOnline = (): boolean => navigator.onLine;

export const waitForOnline = (): Promise<void> => {
  if (isOnline()) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    const handleOnline = () => {
      window.removeEventListener('online', handleOnline);
      resolve();
    };

    window.addEventListener('online', handleOnline);
  });
};

export const getViewportSize = (): { width: number; height: number } => {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
};

export const observeElementVisibility = (
  element: Element,
  callback: (isVisible: boolean) => void,
  options?: IntersectionObserverInit
): (() => void) => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      callback(entry.isIntersecting);
    });
  }, options);

  observer.observe(element);

  return () => observer.disconnect();
};
