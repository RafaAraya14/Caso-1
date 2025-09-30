/**
 * ConfigManager - Singleton Pattern
 *
 * Gestiona la configuración global de la aplicación de forma centralizada.
 * Implementa el patrón Singleton para garantizar una única instancia
 * y acceso global a la configuración.
 *
 * @pattern Singleton
 * @description Punto único de acceso a configuración de la aplicación
 */

interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  supabase: {
    url: string;
    anonKey: string;
    maxConnections: number;
  };
  features: {
    enableNotifications: boolean;
    enableAnalytics: boolean;
    enableBackgroundJobs: boolean;
    enableRealTimeUpdates: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    itemsPerPage: number;
    animationDuration: number;
  };
  cache: {
    defaultTTL: number; // Time To Live in milliseconds
    maxSize: number;
    enableCompression: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: boolean;
    enableRemote: boolean;
    maxLogSize: number;
  };
}

interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;
  private isInitialized: boolean = false;
  private configHistory: { timestamp: Date; changes: Partial<AppConfig> }[] = [];

  /**
   * Constructor privado para implementar Singleton
   */
  private constructor() {
    this.config = this.getDefaultConfig();
  }

  /**
   * Obtiene la instancia única del ConfigManager
   * @returns Instancia del ConfigManager
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Inicializa la configuración con valores del entorno
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('ConfigManager already initialized');
      return;
    }

    try {
      // Cargar configuración desde variables de entorno
      this.loadFromEnvironment();

      // Cargar configuración desde localStorage si existe
      await this.loadFromStorage();

      // Validar configuración
      const validation = this.validateConfig();
      if (!validation.isValid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      // Mostrar warnings si existen
      if (validation.warnings.length > 0) {
        console.warn('Configuration warnings:', validation.warnings);
      }

      this.isInitialized = true;
      console.log('ConfigManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ConfigManager:', error);
      throw error;
    }
  }

  /**
   * Obtiene toda la configuración
   */
  public getConfig(): AppConfig {
    this.ensureInitialized();
    return { ...this.config }; // Retorna una copia para evitar mutaciones
  }

  /**
   * Obtiene un valor específico de configuración
   */
  public get<T = any>(path: string): T {
    this.ensureInitialized();

    const keys = path.split('.');
    let value: any = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        throw new Error(`Configuration path not found: ${path}`);
      }
    }

    return value as T;
  }

  /**
   * Establece un valor de configuración
   */
  public set(path: string, value: any): void {
    this.ensureInitialized();

    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let target: any = this.config;

    // Navegar hasta el objeto padre
    for (const key of keys) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      target = target[key];
    }

    // Guardar valor anterior para historial
    const oldValue = target[lastKey];

    // Establecer nuevo valor
    target[lastKey] = value;

    // Agregar al historial
    this.configHistory.push({
      timestamp: new Date(),
      changes: { [path]: { from: oldValue, to: value } } as any,
    });

    // Mantener solo los últimos 50 cambios
    if (this.configHistory.length > 50) {
      this.configHistory = this.configHistory.slice(-50);
    }

    // Persistir en localStorage
    this.saveToStorage();

    console.log(`Configuration updated: ${path} = ${JSON.stringify(value)}`);
  }

  /**
   * Actualiza múltiples valores de configuración
   */
  public update(updates: Partial<AppConfig>): void {
    this.ensureInitialized();

    const changes: any = {};

    // Aplicar cambios recursivamente
    const applyUpdates = (target: any, source: any, path: string = '') => {
      for (const [key, value] of Object.entries(source)) {
        const fullPath = path ? `${path}.${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (!target[key] || typeof target[key] !== 'object') {
            target[key] = {};
          }
          applyUpdates(target[key], value, fullPath);
        } else {
          const oldValue = target[key];
          target[key] = value;
          changes[fullPath] = { from: oldValue, to: value };
        }
      }
    };

    applyUpdates(this.config, updates);

    // Agregar al historial
    this.configHistory.push({
      timestamp: new Date(),
      changes,
    });

    // Validar configuración después de cambios
    const validation = this.validateConfig();
    if (!validation.isValid) {
      console.error('Configuration validation failed after update:', validation.errors);
    }

    // Persistir cambios
    this.saveToStorage();

    console.log('Configuration updated:', Object.keys(changes));
  }

  /**
   * Restablece la configuración a valores por defecto
   */
  public reset(): void {
    this.config = this.getDefaultConfig();
    this.configHistory = [];
    this.saveToStorage();
    console.log('Configuration reset to defaults');
  }

  /**
   * Obtiene el historial de cambios de configuración
   */
  public getConfigHistory(): { timestamp: Date; changes: Partial<AppConfig> }[] {
    return [...this.configHistory];
  }

  /**
   * Exporta la configuración actual
   */
  public exportConfig(): string {
    this.ensureInitialized();
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Importa configuración desde JSON
   */
  public importConfig(configJson: string): void {
    try {
      const importedConfig = JSON.parse(configJson) as Partial<AppConfig>;
      this.update(importedConfig);
      console.log('Configuration imported successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to import configuration: ${errorMessage}`);
    }
  }

  /**
   * Valida la configuración actual
   */
  private validateConfig(): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar API config
    if (!this.config.api.baseUrl) {
      errors.push('API base URL is required');
    }
    if (this.config.api.timeout < 1000) {
      warnings.push('API timeout is very low (< 1s)');
    }
    if (this.config.api.retryAttempts < 0 || this.config.api.retryAttempts > 10) {
      errors.push('API retry attempts must be between 0 and 10');
    }

    // Validar Supabase config
    if (!this.config.supabase.url) {
      errors.push('Supabase URL is required');
    }
    if (!this.config.supabase.anonKey) {
      errors.push('Supabase anonymous key is required');
    }

    // Validar cache config
    if (this.config.cache.defaultTTL < 0) {
      errors.push('Cache TTL cannot be negative');
    }
    if (this.config.cache.maxSize < 1) {
      errors.push('Cache max size must be at least 1');
    }

    // Validar UI config
    if (this.config.ui.itemsPerPage < 1 || this.config.ui.itemsPerPage > 100) {
      warnings.push('Items per page should be between 1 and 100');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Carga configuración desde variables de entorno
   */
  private loadFromEnvironment(): void {
    // API Configuration
    if (import.meta.env.VITE_API_BASE_URL) {
      this.config.api.baseUrl = import.meta.env.VITE_API_BASE_URL;
    }
    if (import.meta.env.VITE_API_TIMEOUT) {
      this.config.api.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT);
    }

    // Supabase Configuration
    if (import.meta.env.VITE_SUPABASE_URL) {
      this.config.supabase.url = import.meta.env.VITE_SUPABASE_URL;
    }
    if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
      this.config.supabase.anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    }

    // Feature Flags
    if (import.meta.env.VITE_ENABLE_NOTIFICATIONS !== undefined) {
      this.config.features.enableNotifications =
        import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true';
    }
    if (import.meta.env.VITE_ENABLE_ANALYTICS !== undefined) {
      this.config.features.enableAnalytics = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    }

    // Logging
    if (import.meta.env.VITE_LOG_LEVEL) {
      this.config.logging.level = import.meta.env.VITE_LOG_LEVEL as any;
    }
  }

  /**
   * Carga configuración desde localStorage
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const storedConfig = localStorage.getItem('app-config');
      if (storedConfig) {
        const parsed = JSON.parse(storedConfig);
        this.update(parsed);
      }
    } catch (error) {
      console.warn('Failed to load config from storage:', error);
    }
  }

  /**
   * Guarda configuración en localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('app-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save config to storage:', error);
    }
  }

  /**
   * Obtiene la configuración por defecto
   */
  private getDefaultConfig(): AppConfig {
    return {
      api: {
        baseUrl: 'http://localhost:3000/api',
        timeout: 30000,
        retryAttempts: 3,
      },
      supabase: {
        url: '',
        anonKey: '',
        maxConnections: 10,
      },
      features: {
        enableNotifications: true,
        enableAnalytics: true,
        enableBackgroundJobs: true,
        enableRealTimeUpdates: true,
      },
      ui: {
        theme: 'auto',
        language: 'es',
        itemsPerPage: 10,
        animationDuration: 300,
      },
      cache: {
        defaultTTL: 300000, // 5 minutos
        maxSize: 100,
        enableCompression: false,
      },
      logging: {
        level: 'info',
        enableConsole: true,
        enableRemote: false,
        maxLogSize: 1000,
      },
    };
  }

  /**
   * Verifica que el ConfigManager esté inicializado
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('ConfigManager not initialized. Call initialize() first.');
    }
  }

  /**
   * Utilidad para obtener configuración con valor por defecto
   */
  public getWithDefault<T>(path: string, defaultValue: T): T {
    try {
      return this.get<T>(path);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Verifica si una característica está habilitada
   */
  public isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.get<boolean>(`features.${feature}`);
  }

  /**
   * Obtiene información de debug del ConfigManager
   */
  public getDebugInfo(): object {
    return {
      isInitialized: this.isInitialized,
      configSize: JSON.stringify(this.config).length,
      historySize: this.configHistory.length,
      lastUpdate: this.configHistory[this.configHistory.length - 1]?.timestamp,
      validation: this.validateConfig(),
    };
  }
}
