/**
 * CacheManager - Singleton Pattern con Strategy Pattern
 *
 * Sistema de cache inteligente que implementa múltiples estrategias de cache
 * con TTL (Time To Live), LRU (Least Recently Used) y persistencia opcional.
 *
 * @pattern Singleton + Strategy
 * @description Cache centralizado con diferentes estrategias de almacenamiento
 */

interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  tags?: string[];
}

interface CacheStats {
  totalItems: number;
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage: number;
  oldestItem: number;
  newestItem: number;
}

interface CacheOptions {
  ttl?: number;
  tags?: string[];
  persistent?: boolean;
  serialize?: boolean;
}

/**
 * Estrategia base para diferentes tipos de cache
 */
abstract class CacheStrategy {
  abstract set<T>(key: string, value: T, options?: CacheOptions): void;
  abstract get<T>(key: string): T | null;
  abstract delete(key: string): boolean;
  abstract clear(): void;
  abstract keys(): string[];
  abstract size(): number;
}

/**
 * Estrategia de cache en memoria con LRU
 */
class MemoryCacheStrategy extends CacheStrategy {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    super();
    this.maxSize = maxSize;
  }

  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const now = Date.now();
    const ttl = options.ttl || 300000; // 5 minutos por defecto

    // Si el cache está lleno, eliminar el elemento menos recientemente usado
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now,
      tags: options.tags,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    const now = Date.now();

    // Verificar si el item ha expirado
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Actualizar estadísticas de acceso
    item.accessCount++;
    item.lastAccessed = now;

    return item.value as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  size(): number {
    return this.cache.size;
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  getItem(key: string): CacheItem<any> | null {
    return this.cache.get(key) || null;
  }

  getAllItems(): Map<string, CacheItem<any>> {
    return new Map(this.cache);
  }
}

/**
 * Estrategia de cache persistente usando localStorage
 */
class PersistentCacheStrategy extends CacheStrategy {
  private prefix: string;

  constructor(prefix: string = 'cache_') {
    super();
    this.prefix = prefix;
  }

  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const now = Date.now();
    const ttl = options.ttl || 300000;

    const item: CacheItem<T> = {
      value,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now,
      tags: options.tags,
    };

    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to store item in localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(this.prefix + key);
      if (!stored) {
        return null;
      }

      const item: CacheItem<T> = JSON.parse(stored);
      const now = Date.now();

      // Verificar expiración
      if (now - item.timestamp > item.ttl) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }

      // Actualizar estadísticas
      item.accessCount++;
      item.lastAccessed = now;
      localStorage.setItem(this.prefix + key, JSON.stringify(item));

      return item.value;
    } catch (error) {
      console.warn('Failed to retrieve item from localStorage:', error);
      return null;
    }
  }

  delete(key: string): boolean {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.warn('Failed to delete item from localStorage:', error);
      return false;
    }
  }

  clear(): void {
    try {
      const keys = this.keys();
      keys.forEach(key => localStorage.removeItem(this.prefix + key));
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }

  keys(): string[] {
    const keys: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
    } catch (error) {
      console.warn('Failed to get keys from localStorage:', error);
    }
    return keys;
  }

  size(): number {
    return this.keys().length;
  }
}

export class CacheManager {
  private static instance: CacheManager;
  private memoryStrategy: MemoryCacheStrategy;
  private persistentStrategy: PersistentCacheStrategy;
  private stats: { hits: number; misses: number } = { hits: 0, misses: 0 };
  private defaultStrategy: 'memory' | 'persistent' = 'memory';

  /**
   * Constructor privado para implementar Singleton
   */
  private constructor() {
    this.memoryStrategy = new MemoryCacheStrategy(100);
    this.persistentStrategy = new PersistentCacheStrategy('app_cache_');
  }

  /**
   * Obtiene la instancia única del CacheManager
   */
  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Configura el cache manager
   */
  public configure(options: {
    defaultStrategy?: 'memory' | 'persistent';
    maxMemorySize?: number;
    persistentPrefix?: string;
  }): void {
    if (options.defaultStrategy) {
      this.defaultStrategy = options.defaultStrategy;
    }

    if (options.maxMemorySize) {
      this.memoryStrategy = new MemoryCacheStrategy(options.maxMemorySize);
    }

    if (options.persistentPrefix) {
      this.persistentStrategy = new PersistentCacheStrategy(options.persistentPrefix);
    }
  }

  /**
   * Almacena un valor en cache
   */
  public set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const strategy = options.persistent ? this.persistentStrategy : this.memoryStrategy;
    strategy.set(key, value, options);
  }

  /**
   * Recupera un valor del cache
   */
  public get<T>(key: string, persistent: boolean = false): T | null {
    const strategy = persistent ? this.persistentStrategy : this.memoryStrategy;
    const value = strategy.get<T>(key);

    if (value !== null) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }

    return value;
  }

  /**
   * Elimina un elemento del cache
   */
  public delete(key: string, persistent: boolean = false): boolean {
    const strategy = persistent ? this.persistentStrategy : this.memoryStrategy;
    return strategy.delete(key);
  }

  /**
   * Limpia todo el cache
   */
  public clear(persistent: boolean = false): void {
    if (persistent) {
      this.persistentStrategy.clear();
    } else {
      this.memoryStrategy.clear();
    }
  }

  /**
   * Limpia todo el cache (memoria y persistente)
   */
  public clearAll(): void {
    this.memoryStrategy.clear();
    this.persistentStrategy.clear();
  }

  /**
   * Obtiene o establece un valor usando una función factory
   */
  public async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    options: CacheOptions = {}
  ): Promise<T> {
    let value = this.get<T>(key, options.persistent);

    if (value === null) {
      value = await factory();
      this.set(key, value, options);
    }

    return value;
  }

  /**
   * Cache con invalidación por tags
   */
  public invalidateByTag(tag: string): number {
    let invalidated = 0;

    // Invalidar en memoria
    const memoryItems = this.memoryStrategy.getAllItems();
    for (const [key, item] of memoryItems.entries()) {
      if (item.tags && item.tags.includes(tag)) {
        this.memoryStrategy.delete(key);
        invalidated++;
      }
    }

    // Para cache persistente, necesitamos iterar sobre las claves
    const persistentKeys = this.persistentStrategy.keys();
    for (const key of persistentKeys) {
      try {
        const stored = localStorage.getItem(`app_cache_${key}`);
        if (stored) {
          const item = JSON.parse(stored);
          if (item.tags && item.tags.includes(tag)) {
            this.persistentStrategy.delete(key);
            invalidated++;
          }
        }
      } catch (error) {
        console.warn('Error checking tags for key:', key, error);
      }
    }

    return invalidated;
  }

  /**
   * Limpieza automática de elementos expirados
   */
  public cleanup(): number {
    let cleaned = 0;

    // Limpiar memoria
    const memoryItems = this.memoryStrategy.getAllItems();
    const now = Date.now();

    for (const [key, item] of memoryItems.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.memoryStrategy.delete(key);
        cleaned++;
      }
    }

    // Limpiar persistente
    const persistentKeys = this.persistentStrategy.keys();
    for (const key of persistentKeys) {
      if (!this.get(key, true)) {
        // get() ya verifica expiración
        cleaned++; // Se eliminó automáticamente durante get()
      }
    }

    return cleaned;
  }

  /**
   * Obtiene estadísticas del cache
   */
  public getStats(): CacheStats {
    const memoryItems = this.memoryStrategy.getAllItems();
    const persistentSize = this.persistentStrategy.size();

    let oldestTime = Date.now();
    let newestTime = 0;
    let memoryUsage = 0;

    for (const item of memoryItems.values()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
      }
      if (item.timestamp > newestTime) {
        newestTime = item.timestamp;
      }
      memoryUsage += JSON.stringify(item).length;
    }

    return {
      totalItems: memoryItems.size + persistentSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      memoryUsage,
      oldestItem: oldestTime,
      newestItem: newestTime,
    };
  }

  /**
   * Resetea las estadísticas
   */
  public resetStats(): void {
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Obtiene todas las claves del cache
   */
  public keys(persistent: boolean = false): string[] {
    const strategy = persistent ? this.persistentStrategy : this.memoryStrategy;
    return strategy.keys();
  }

  /**
   * Verifica si existe una clave en el cache
   */
  public has(key: string, persistent: boolean = false): boolean {
    return this.get(key, persistent) !== null;
  }

  /**
   * Obtiene el tamaño del cache
   */
  public size(persistent: boolean = false): number {
    const strategy = persistent ? this.persistentStrategy : this.memoryStrategy;
    return strategy.size();
  }

  /**
   * Cache específico para coaches
   */
  public cacheCoach(coachId: string, coachData: any, ttl: number = 600000): void {
    this.set(`coach:${coachId}`, coachData, {
      ttl,
      tags: ['coaches', `coach:${coachId}`],
    });
  }

  /**
   * Cache específico para sesiones
   */
  public cacheSession(sessionId: string, sessionData: any, ttl: number = 300000): void {
    this.set(`session:${sessionId}`, sessionData, {
      ttl,
      tags: ['sessions', `session:${sessionId}`],
    });
  }

  /**
   * Cache específico para búsquedas
   */
  public cacheSearch(query: string, results: any, ttl: number = 180000): void {
    const key = `search:${btoa(query)}`;
    this.set(key, results, {
      ttl,
      tags: ['searches'],
    });
  }

  /**
   * Invalida cache relacionado con un coach
   */
  public invalidateCoach(coachId: string): void {
    this.invalidateByTag(`coach:${coachId}`);
    this.invalidateByTag('coaches'); // Invalidar listas de coaches
  }

  /**
   * Invalida cache relacionado con una sesión
   */
  public invalidateSession(sessionId: string): void {
    this.invalidateByTag(`session:${sessionId}`);
    this.invalidateByTag('sessions'); // Invalidar listas de sesiones
  }

  /**
   * Invalida todas las búsquedas
   */
  public invalidateSearches(): void {
    this.invalidateByTag('searches');
  }

  /**
   * Programa limpieza automática
   */
  public scheduleCleanup(intervalMs: number = 300000): () => void {
    const interval = setInterval(() => {
      const cleaned = this.cleanup();
      if (cleaned > 0) {
        console.log(`Cache cleanup: ${cleaned} expired items removed`);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }

  /**
   * Obtiene información de debug del cache
   */
  public getDebugInfo(): object {
    const stats = this.getStats();
    return {
      stats,
      memoryKeys: this.keys(false),
      persistentKeys: this.keys(true),
      defaultStrategy: this.defaultStrategy,
      memorySize: this.size(false),
      persistentSize: this.size(true),
    };
  }
}
