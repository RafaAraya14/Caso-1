// src/logging/logger.ts
import { CustomError } from '../error-handling/CustomError';

// Tipos de logging
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  friendlyMessage?: string; // Para CustomError
  metadata?: Record<string, unknown>;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  environment: string;
}

// Interface para providers de logging
export interface ILogProvider {
  log(entry: LogEntry): void;
  shouldLog(level: LogLevel): boolean;
}

// Provider para consola con formato unificado
class ConsoleLogProvider implements ILogProvider {
  private minLevel: LogLevel;
  private isDevelopment: boolean;

  constructor(minLevel: LogLevel = LogLevel.INFO) {
    this.minLevel = minLevel;
    this.isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
  }

  shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const levelName = LogLevel[entry.level];
    const emoji = this.getLevelEmoji(entry.level);
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    
    // Formato: [🟢 INFO 14:30:25] [Auth/Login] Usuario iniciando sesión
    let logMessage = `[${emoji} ${levelName} ${timestamp}]`;
    
    if (entry.context?.component) {
      logMessage += ` [${entry.context.component}${entry.context.action ? '/' + entry.context.action : ''}]`;
    }
    
    logMessage += ` ${entry.message}`;

    // Datos adicionales
    const additionalData: Record<string, unknown> = {};
    
    if (entry.context?.userId) {
      additionalData.userId = entry.context.userId;
    }
    
    if (entry.context?.sessionId) {
      additionalData.sessionId = entry.context.sessionId;
    }
    
    if (entry.context?.metadata) {
      additionalData.metadata = entry.context.metadata;
    }

    // Log según el nivel
    switch (entry.level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          // eslint-disable-next-line no-console
          console.debug(logMessage, additionalData);
        }
        break;
      case LogLevel.INFO:
        // eslint-disable-next-line no-console
        console.info(logMessage, Object.keys(additionalData).length > 0 ? additionalData : '');
        break;
      case LogLevel.WARN:
        // eslint-disable-next-line no-console
        console.warn(logMessage, additionalData);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        // eslint-disable-next-line no-console
        console.error(logMessage, {
          ...additionalData,
          error: entry.error
        });
        break;
    }

    // En desarrollo, mostrar stack trace para errores
    if (this.isDevelopment && entry.error?.stack && (entry.level === LogLevel.ERROR || entry.level === LogLevel.CRITICAL)) {
      // eslint-disable-next-line no-console
      console.error('Stack trace:', entry.error.stack);
    }
  }

  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '🔍';
      case LogLevel.INFO: return '🟢';
      case LogLevel.WARN: return '🟡';
      case LogLevel.ERROR: return '🔴';
      case LogLevel.CRITICAL: return '💥';
      default: return '📝';
    }
  }
}

// Provider para envío a servicio externo (ejemplo)
class RemoteLogProvider implements ILogProvider {
  private endpoint: string;
  private apiKey: string;
  private minLevel: LogLevel;

  constructor(endpoint: string, apiKey: string, minLevel: LogLevel = LogLevel.WARN) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.minLevel = minLevel;
  }

  shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    // En producción, enviar logs críticos a servicio externo
    if (entry.level >= LogLevel.ERROR) {
      this.sendToRemote(entry).catch(error => {
        // eslint-disable-next-line no-console
        console.error('Failed to send log to remote service:', error);
      });
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(entry),
      });
    } catch {
      // Silently fail - no queremos que el logging cause errores
    }
  }
}

// Logger principal
class Logger {
  private providers: ILogProvider[] = [];
  private defaultContext: LogContext = {};

  constructor() {
    // Provider por defecto
    this.addProvider(new ConsoleLogProvider(
      import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO
    ));

    // En producción, agregar provider remoto si está configurado
    if (!import.meta.env.DEV && import.meta.env.VITE_LOG_ENDPOINT) {
      this.addProvider(new RemoteLogProvider(
        import.meta.env.VITE_LOG_ENDPOINT,
        import.meta.env.VITE_LOG_API_KEY || '',
        LogLevel.ERROR
      ));
    }
  }

  addProvider(provider: ILogProvider): void {
    this.providers.push(provider);
  }

  setDefaultContext(context: Partial<LogContext>): void {
    this.defaultContext = { ...this.defaultContext, ...context };
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.defaultContext, ...context },
      environment: import.meta.env.MODE || 'unknown'
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };

      // Si es CustomError, agregar información adicional
      if (error instanceof CustomError) {
        entry.error.code = error.code;
        entry.context = {
          ...entry.context,
          friendlyMessage: error.friendlyMessage
        };
      }
    }

    return entry;
  }

  private writeLog(entry: LogEntry): void {
    this.providers.forEach(provider => {
      try {
        provider.log(entry);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Logging provider failed:', error);
      }
    });
  }

  debug(message: string, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.writeLog(entry);
  }

  info(message: string, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.writeLog(entry);
  }

  warn(message: string, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.writeLog(entry);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
    this.writeLog(entry);
  }

  critical(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.CRITICAL, message, context, error);
    this.writeLog(entry);
  }

  // Métodos especializados por contexto
  auth(action: string, message: string, context?: Omit<LogContext, 'component' | 'action'>): void {
    this.info(message, {
      ...context,
      component: 'Auth',
      action
    });
  }

  session(action: string, message: string, context?: Omit<LogContext, 'component' | 'action'>): void {
    this.info(message, {
      ...context,
      component: 'Session',
      action
    });
  }

  payment(action: string, message: string, context?: Omit<LogContext, 'component' | 'action'>): void {
    this.info(message, {
      ...context,
      component: 'Payment',
      action
    });
  }

  api(action: string, message: string, context?: Omit<LogContext, 'component' | 'action'>): void {
    this.info(message, {
      ...context,
      component: 'API',
      action
    });
  }
}

// Instancia singleton
export const logger = new Logger();

// Función helper para capturar errores no manejados
export function setupGlobalErrorHandling(): void {
  // Capturar errores JavaScript no manejados
  window.addEventListener('error', (event) => {
    logger.critical('Unhandled JavaScript error', event.error, {
      component: 'Global',
      action: 'UnhandledError',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });

  // Capturar promesas rechazadas no manejadas
  window.addEventListener('unhandledrejection', (event) => {
    logger.critical('Unhandled promise rejection', 
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)), 
      {
        component: 'Global',
        action: 'UnhandledRejection'
      }
    );
  });
}