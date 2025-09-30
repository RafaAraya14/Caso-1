// src/middleware/requestLogger.ts
import { logger } from '../logging';

export interface RequestLogData {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: unknown;
  timestamp: string;
  requestId: string;
}

export interface ResponseLogData {
  url: string;
  method: string;
  status: number;
  statusText: string;
  headers?: Record<string, string>;
  responseTime: number;
  requestId: string;
  bodySize?: number;
}

/**
 * Middleware para logging de requests y responses HTTP
 */
export class RequestLogger {
  private static instance: RequestLogger;
  private activeRequests = new Map<string, { startTime: number; data: RequestLogData }>();

  private constructor() {}

  static getInstance(): RequestLogger {
    if (!RequestLogger.instance) {
      RequestLogger.instance = new RequestLogger();
    }
    return RequestLogger.instance;
  }

  /**
   * Log del inicio de request
   */
  logRequest(url: string, options: RequestInit = {}): string {
    const requestId = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();
    const method = options.method || 'GET';

    const requestData: RequestLogData = {
      url,
      method,
      headers: this.extractHeaders(options.headers),
      body: this.sanitizeBody(options.body),
      timestamp,
      requestId,
    };

    // Guardar para calcular tiempo de respuesta
    this.activeRequests.set(requestId, {
      startTime: Date.now(),
      data: requestData,
    });

    // Log del request
    logger.api('Request', `${method} ${url}`, {
      metadata: {
        requestId,
        headers: requestData.headers,
        bodySize: this.getBodySize(options.body),
        url: this.sanitizeUrl(url),
      },
    });

    return requestId;
  }

  /**
   * Log de la respuesta
   */
  logResponse(requestId: string, response: Response): void {
    const activeRequest = this.activeRequests.get(requestId);
    if (!activeRequest) {
      logger.warn('Response logged for unknown request', {
        component: 'RequestLogger',
        action: 'LogResponse',
        metadata: { requestId },
      });
      return;
    }

    const responseTime = Date.now() - activeRequest.startTime;
    const { data: requestData } = activeRequest;

    // Limpiar de requests activos
    this.activeRequests.delete(requestId);

    // Determinar nivel de log basado en status
    const logLevel = this.getLogLevel(response.status);
    const message = `${requestData.method} ${this.sanitizeUrl(requestData.url)} - ${response.status} (${responseTime}ms)`;

    if (logLevel === 'error') {
      logger.error(message, undefined, {
        component: 'API',
        action: 'Response',
        metadata: {
          requestId,
          status: response.status,
          responseTime,
          url: this.sanitizeUrl(requestData.url),
          method: requestData.method,
        },
      });
    } else if (logLevel === 'warn') {
      logger.warn(message, {
        component: 'API',
        action: 'Response',
        metadata: {
          requestId,
          status: response.status,
          responseTime,
          url: this.sanitizeUrl(requestData.url),
          method: requestData.method,
        },
      });
    } else {
      logger.api('Response', message, {
        metadata: {
          requestId,
          status: response.status,
          responseTime,
          url: this.sanitizeUrl(requestData.url),
          method: requestData.method,
        },
      });
    }
  }

  /**
   * Log de error en request
   */
  logError(requestId: string, error: Error): void {
    const activeRequest = this.activeRequests.get(requestId);
    if (activeRequest) {
      const responseTime = Date.now() - activeRequest.startTime;
      const { data: requestData } = activeRequest;

      logger.error(
        `${requestData.method} ${this.sanitizeUrl(requestData.url)} - ERROR (${responseTime}ms)`,
        error,
        {
          component: 'API',
          action: 'RequestError',
          metadata: {
            requestId,
            responseTime,
            url: this.sanitizeUrl(requestData.url),
            method: requestData.method,
          },
        }
      );

      this.activeRequests.delete(requestId);
    } else {
      logger.error('Request error for unknown request', error, {
        component: 'RequestLogger',
        action: 'LogError',
        metadata: { requestId },
      });
    }
  }

  /**
   * Wrapper para fetch con logging automático
   */
  async loggedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const requestId = this.logRequest(url, options);

    try {
      const response = await fetch(url, options);
      this.logResponse(requestId, response);
      return response;
    } catch (error) {
      this.logError(requestId, error as Error);
      throw error;
    }
  }

  private extractHeaders(headers?: HeadersInit): Record<string, string> | undefined {
    if (!headers) {
      return undefined;
    }

    const result: Record<string, string> = {};

    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        if (!this.isSensitiveHeader(key)) {
          result[key] = value;
        }
      });
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => {
        if (!this.isSensitiveHeader(key)) {
          result[key] = value;
        }
      });
    } else {
      Object.entries(headers).forEach(([key, value]) => {
        if (!this.isSensitiveHeader(key)) {
          result[key] = value;
        }
      });
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  private extractResponseHeaders(response: Response): Record<string, string> | undefined {
    const result: Record<string, string> = {};

    response.headers.forEach((value, key) => {
      if (!this.isSensitiveHeader(key)) {
        result[key] = value;
      }
    });

    return Object.keys(result).length > 0 ? result : undefined;
  }

  private isSensitiveHeader(headerName: string): boolean {
    const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie', 'x-api-key'];
    return sensitiveHeaders.includes(headerName.toLowerCase());
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body) {
      return undefined;
    }

    try {
      if (typeof body === 'string') {
        const parsed = JSON.parse(body);
        return this.removeSensitiveFields(parsed);
      } else if (typeof body === 'object') {
        return this.removeSensitiveFields(body);
      }
    } catch {
      return '[Non-JSON body]';
    }

    return '[Binary body]';
  }

  private removeSensitiveFields(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    const result = { ...obj } as Record<string, unknown>;

    sensitiveFields.forEach(field => {
      if (field in result) {
        result[field] = '[REDACTED]';
      }
    });

    return result;
  }

  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);

      // Remover parámetros sensibles
      const sensitiveParams = ['token', 'key', 'secret', 'password'];
      sensitiveParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.set(param, '[REDACTED]');
        }
      });

      return urlObj.toString();
    } catch {
      return url;
    }
  }

  private getBodySize(body: unknown): number | undefined {
    if (!body) {
      return undefined;
    }

    if (typeof body === 'string') {
      return new Blob([body]).size;
    } else if (body instanceof Blob) {
      return body.size;
    } else if (body instanceof FormData) {
      // FormData no tiene size property, así que no podemos calcularlo fácilmente
      return undefined;
    }

    return undefined;
  }

  private getResponseBodySize(response: Response): number | undefined {
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : undefined;
  }

  private getLogLevel(status: number): 'info' | 'warn' | 'error' {
    if (status >= 500) {
      return 'error';
    }
    if (status >= 400) {
      return 'warn';
    }
    return 'info';
  }

  /**
   * Obtener estadísticas de requests
   */
  getActiveRequestsCount(): number {
    return this.activeRequests.size;
  }

  /**
   * Limpiar requests antiguos (para evitar memory leaks)
   */
  cleanupOldRequests(maxAgeMs: number = 300000): void {
    // 5 minutos por defecto
    const now = Date.now();

    for (const [requestId, request] of this.activeRequests.entries()) {
      if (now - request.startTime > maxAgeMs) {
        logger.warn('Cleaning up old request', {
          component: 'RequestLogger',
          action: 'CleanupOldRequest',
          metadata: { requestId, age: now - request.startTime },
        });
        this.activeRequests.delete(requestId);
      }
    }
  }
}

// Instancia singleton
export const requestLogger = RequestLogger.getInstance();

// Helper function para uso fácil
export const loggedFetch = (url: string, options?: RequestInit) =>
  requestLogger.loggedFetch(url, options);

// Setup cleanup periódico
if (typeof window !== 'undefined') {
  setInterval(() => {
    requestLogger.cleanupOldRequests();
  }, 60000); // Cada minuto
}
