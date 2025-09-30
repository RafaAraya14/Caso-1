// src/middleware/authInterceptor.ts
import { CustomError } from '../error-handling';
import { supabase } from '../lib/supabase';
import { logger } from '../logging';

/**
 * Interceptor para agregar automáticamente tokens de autenticación a las requests
 */
export class AuthInterceptor {
  private static instance: AuthInterceptor;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }[] = [];

  private constructor() {
    this.initializeTokens();
    this.setupAuthListener();
  }

  static getInstance(): AuthInterceptor {
    if (!AuthInterceptor.instance) {
      AuthInterceptor.instance = new AuthInterceptor();
    }
    return AuthInterceptor.instance;
  }

  private async initializeTokens(): Promise<void> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        this.accessToken = session.access_token;
        this.refreshToken = session.refresh_token;
        logger.debug('Auth tokens initialized', {
          component: 'AuthInterceptor',
          action: 'InitializeTokens',
        });
      }
    } catch (error) {
      logger.error('Failed to initialize auth tokens', error as Error, {
        component: 'AuthInterceptor',
        action: 'InitializeTokens',
      });
    }
  }

  private setupAuthListener(): void {
    supabase.auth.onAuthStateChange((event, session) => {
      logger.debug(`Auth state changed: ${event}`, {
        component: 'AuthInterceptor',
        action: 'AuthStateChange',
        metadata: { event, hasSession: !!session },
      });

      if (session) {
        this.accessToken = session.access_token;
        this.refreshToken = session.refresh_token;

        // Procesar cola de requests fallidas
        this.processFailedQueue(null);
      } else {
        this.accessToken = null;
        this.refreshToken = null;

        // Rechazar requests en cola
        this.processFailedQueue(CustomError.authentication('Session expired, please login again'));
      }
    });
  }

  private processFailedQueue(error: Error | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });

    this.failedQueue = [];
    this.isRefreshing = false;
  }

  /**
   * Intercept y agregar headers de autorización a fetch requests
   */
  async interceptRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const requestId = Math.random().toString(36).substr(2, 9);

    logger.debug('Intercepting request', {
      component: 'AuthInterceptor',
      action: 'InterceptRequest',
      metadata: { url, requestId, hasToken: !!this.accessToken },
    });

    // Agregar headers de autorización si existe token
    const headers = new Headers(options.headers);
    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    // Agregar headers adicionales
    headers.set('Content-Type', 'application/json');
    headers.set('X-Request-ID', requestId);

    const modifiedOptions: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, modifiedOptions);

      // Si el token expiró, intentar refrescar
      if (response.status === 401 && this.accessToken) {
        logger.warn('Token expired, attempting refresh', {
          component: 'AuthInterceptor',
          action: 'TokenRefresh',
          metadata: { url, requestId },
        });

        const refreshedResponse = await this.handleTokenRefresh(url, modifiedOptions);
        return refreshedResponse;
      }

      // Log successful request
      if (response.ok) {
        logger.debug('Request completed successfully', {
          component: 'AuthInterceptor',
          action: 'RequestSuccess',
          metadata: { url, status: response.status, requestId },
        });
      } else {
        logger.warn('Request failed', {
          component: 'AuthInterceptor',
          action: 'RequestFailed',
          metadata: { url, status: response.status, requestId },
        });
      }

      return response;
    } catch (error) {
      logger.error('Request error', error as Error, {
        component: 'AuthInterceptor',
        action: 'RequestError',
        metadata: { url, requestId },
      });
      throw error;
    }
  }

  private async handleTokenRefresh(
    originalUrl: string,
    originalOptions: RequestInit
  ): Promise<Response> {
    // Si ya estamos refrescando, agregar a la cola
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({
          resolve: () => {
            resolve(this.interceptRequest(originalUrl, originalOptions));
          },
          reject,
        });
      });
    }

    this.isRefreshing = true;

    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: this.refreshToken!,
      });

      if (error || !data.session) {
        throw CustomError.authentication('Failed to refresh session');
      }

      this.accessToken = data.session.access_token;
      this.refreshToken = data.session.refresh_token;

      logger.info('Token refreshed successfully', {
        component: 'AuthInterceptor',
        action: 'TokenRefresh',
      });

      // Procesar cola y reintentar request original
      this.processFailedQueue(null);

      // Reintentar el request original con nuevo token
      const headers = new Headers(originalOptions.headers);
      headers.set('Authorization', `Bearer ${this.accessToken}`);

      return fetch(originalUrl, {
        ...originalOptions,
        headers,
      });
    } catch (error) {
      this.processFailedQueue(error as Error);
      throw error;
    }
  }

  /**
   * Helper para realizar requests autenticadas
   */
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    return this.interceptRequest(url, options);
  }

  /**
   * Helper para obtener el token actual
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Helper para verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Limpiar tokens (logout)
   */
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    logger.info('Auth tokens cleared', {
      component: 'AuthInterceptor',
      action: 'ClearTokens',
    });
  }
}

// Instancia singleton
export const authInterceptor = AuthInterceptor.getInstance();

// Helper function para uso fácil
export const authenticatedFetch = (url: string, options?: RequestInit) =>
  authInterceptor.authenticatedFetch(url, options);
