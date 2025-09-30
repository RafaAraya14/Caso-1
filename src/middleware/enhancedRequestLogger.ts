/**
 * Enhanced Request Logger Middleware
 *
 * Provides comprehensive HTTP request/response logging with:
 * - Performance metrics tracking
 * - User context correlation
 * - Memory management for active requests
 * - Configurable log levels based on response status
 *
 * @version 1.0.0
 * @author 20MinCoach Development Team
 */

import { logger } from '../logging';

import type { User } from '../models';

/**
 * Interface for request data storage
 */
interface RequestData {
  method: string;
  url: string;
  startTime: number;
  user?: User;
  data?: Record<string, unknown>;
  cpuStart?: NodeJS.CpuUsage;
}

/**
 * Interface for additional logging context
 */
interface RequestContext {
  sessionId?: string;
  trackPerformance?: boolean;
  excludeBody?: boolean;
}

/**
 * Performance metrics for tracking
 */
interface PerformanceMetrics {
  requestId: string;
  url: string;
  method: string;
  responseTime: number;
  timestamp: number;
}

/**
 * Log levels enum
 */
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Enhanced Request Logger - Singleton for managing HTTP request logging
 */
export class EnhancedRequestLogger {
  private static instance: EnhancedRequestLogger;
  private activeRequests = new Map<string, RequestData>();
  private performanceMetrics: PerformanceMetrics[] = [];
  private maxActiveRequests = 1000;
  private maxMetricsHistory = 500;
  private cleanupInterval?: NodeJS.Timeout;

  private constructor() {
    this.startCleanupProcess();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): EnhancedRequestLogger {
    if (!EnhancedRequestLogger.instance) {
      EnhancedRequestLogger.instance = new EnhancedRequestLogger();
    }
    return EnhancedRequestLogger.instance;
  }

  /**
   * Log the start of an HTTP request
   */
  logRequest(
    requestId: string,
    method: string,
    url: string,
    user?: User,
    additionalContext?: RequestContext
  ): void {
    const timestamp = Date.now();
    const cpuStart = process.cpuUsage();

    // Store request data for correlation
    this.activeRequests.set(requestId, {
      method,
      url,
      startTime: timestamp,
      user,
      data: additionalContext as Record<string, unknown>,
      cpuStart,
    });

    // Log request start
    logger.info('HTTP Request Started', {
      userId: user?.id,
      sessionId: additionalContext?.sessionId,
      metadata: {
        requestId,
        method,
        url: this.sanitizeUrl(url),
        userRole: user?.role,
        timestamp,
      },
    });

    // Cleanup if too many active requests
    if (this.activeRequests.size > this.maxActiveRequests) {
      this.cleanupOldRequests();
    }
  }

  /**
   * Log the completion of an HTTP request
   */
  logResponse(
    requestId: string,
    response: { status: number; statusText?: string },
    errorDetails?: string
  ): void {
    const activeRequest = this.activeRequests.get(requestId);
    if (!activeRequest) {
      logger.warn('Response logged for unknown request', {
        metadata: { requestId },
      });
      return;
    }

    const responseTime = Date.now() - activeRequest.startTime;
    const cpuEnd = activeRequest.cpuStart ? process.cpuUsage(activeRequest.cpuStart) : undefined;

    this.logResponseData({
      requestId,
      response,
      responseTime,
      requestData: activeRequest,
      error: errorDetails,
    });

    this.trackPerformanceMetrics(requestId, activeRequest, responseTime, cpuEnd);
    this.cleanupRequest(requestId);
  }

  /**
   * Log response data with appropriate level based on status
   */
  private logResponseData(params: {
    requestId: string;
    response: { status: number; statusText?: string };
    responseTime: number;
    requestData: RequestData;
    error?: string;
  }): void {
    const { requestId, response, responseTime, requestData } = params;
    const logLevel = this.getLogLevel(response.status);
    const message = `${requestData.method} ${this.sanitizeUrl(requestData.url)} - ${response.status} (${responseTime}ms)`;

    if (logLevel === LogLevel.ERROR) {
      logger.error(message, undefined, {
        userId: requestData.user?.id,
        metadata: {
          requestId,
          method: requestData.method,
          url: this.sanitizeUrl(requestData.url),
          statusCode: response.status,
          statusText: response.statusText,
          responseTime,
          userRole: requestData.user?.role,
          sessionId: requestData.data?.sessionId,
        },
      });
    } else if (logLevel === LogLevel.WARN) {
      logger.warn(message, {
        userId: requestData.user?.id,
        metadata: {
          requestId,
          method: requestData.method,
          url: this.sanitizeUrl(requestData.url),
          statusCode: response.status,
          statusText: response.statusText,
          responseTime,
          userRole: requestData.user?.role,
          sessionId: requestData.data?.sessionId,
        },
      });
    } else if (logLevel === LogLevel.INFO) {
      logger.info(message, {
        userId: requestData.user?.id,
        metadata: {
          requestId,
          method: requestData.method,
          url: this.sanitizeUrl(requestData.url),
          statusCode: response.status,
          statusText: response.statusText,
          responseTime,
          userRole: requestData.user?.role,
          sessionId: requestData.data?.sessionId,
        },
      });
    } else {
      logger.debug(message, {
        userId: requestData.user?.id,
        metadata: {
          requestId,
          method: requestData.method,
          url: this.sanitizeUrl(requestData.url),
          statusCode: response.status,
          statusText: response.statusText,
          responseTime,
          userRole: requestData.user?.role,
          sessionId: requestData.data?.sessionId,
        },
      });
    }

    // Log slow requests
    if (responseTime > 2000) {
      logger.warn('Slow Request Detected', {
        metadata: {
          requestId,
          responseTime,
          url: requestData.url,
          method: requestData.method,
        },
      });
    }
  }

  /**
   * Track performance metrics
   */
  private trackPerformanceMetrics(
    requestId: string,
    requestData: RequestData,
    responseTime: number,
    cpuUsage?: NodeJS.CpuUsage
  ): void {
    const metrics: PerformanceMetrics = {
      requestId,
      url: requestData.url,
      method: requestData.method,
      responseTime,
      timestamp: Date.now(),
    };

    this.performanceMetrics.push(metrics);

    // Cleanup old metrics
    if (this.performanceMetrics.length > this.maxMetricsHistory) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxMetricsHistory);
    }

    // Log CPU usage if available
    if (cpuUsage) {
      logger.debug('Request CPU Usage', {
        metadata: {
          requestId,
          userCPU: cpuUsage.user,
          systemCPU: cpuUsage.system,
        },
      });
    }
  }

  /**
   * Get appropriate log level based on HTTP status
   */
  private getLogLevel(status: number): LogLevel {
    if (status >= 500) {
      return LogLevel.ERROR;
    }
    if (status >= 400) {
      return LogLevel.WARN;
    }
    if (status >= 300) {
      return LogLevel.INFO;
    }
    return LogLevel.DEBUG;
  }

  /**
   * Sanitize URL for logging (remove sensitive data)
   */
  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url, 'http://localhost');
      // Remove potentially sensitive query parameters
      const sensitiveParams = ['password', 'token', 'key', 'secret', 'api_key'];

      sensitiveParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.set(param, '[REDACTED]');
        }
      });

      return urlObj.pathname + urlObj.search;
    } catch {
      return url.split('?')[0]; // Return path only if URL parsing fails
    }
  }

  /**
   * Cleanup a specific request
   */
  private cleanupRequest(requestId: string): void {
    this.activeRequests.delete(requestId);
  }

  /**
   * Cleanup old requests to prevent memory leaks
   */
  private cleanupOldRequests(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [requestId, request] of this.activeRequests.entries()) {
      if (now - request.startTime > maxAge) {
        logger.warn('Cleaning up stale request', {
          metadata: {
            requestId,
            ageMs: now - request.startTime,
          },
        });
        this.activeRequests.delete(requestId);
      }
    }
  }

  /**
   * Start automatic cleanup process
   */
  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupOldRequests();
      },
      2 * 60 * 1000
    ); // Every 2 minutes
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    averageResponseTime: number;
    slowRequestsCount: number;
    activeRequestsCount: number;
  } {
    const slowThreshold = 1000; // 1 second
    const relevantMetrics = this.performanceMetrics.filter(
      m => Date.now() - m.timestamp < 60 * 60 * 1000 // Last hour
    );

    if (relevantMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        slowRequestsCount: 0,
        activeRequestsCount: this.activeRequests.size,
      };
    }

    const totalTime = relevantMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    const averageResponseTime = totalTime / relevantMetrics.length;
    const slowRequestsCount = relevantMetrics.filter(m => m.responseTime > slowThreshold).length;

    return {
      averageResponseTime,
      slowRequestsCount,
      activeRequestsCount: this.activeRequests.size,
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.activeRequests.clear();
    this.performanceMetrics.length = 0;
  }
}

// Export singleton instance
export const enhancedRequestLogger = EnhancedRequestLogger.getInstance();
