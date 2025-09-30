// src/error-handling/CustomError.ts

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NETWORK = 'network',
  DATABASE = 'database',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service',
  SYSTEM = 'system',
}

export interface ErrorMetadata {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  timestamp?: string;
  userAgent?: string;
  url?: string;
  [key: string]: unknown;
}

export class CustomError extends Error {
  public readonly code: string;
  public readonly friendlyMessage: string;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly metadata: ErrorMetadata;
  public readonly isRetryable: boolean;
  public readonly statusCode?: number;

  constructor(
    message: string,
    code: string,
    friendlyMessage: string,
    options: {
      severity?: ErrorSeverity;
      category?: ErrorCategory;
      metadata?: ErrorMetadata;
      isRetryable?: boolean;
      statusCode?: number;
      cause?: Error;
    } = {}
  ) {
    // 'message' technical errors for developers (saved in logs)
    super(message, { cause: options.cause });
    this.name = 'CustomError';

    // 'code' unique code to identify the error
    this.code = code;

    // 'friendlyMessage' safe and friendly message to show the user
    this.friendlyMessage = friendlyMessage;

    // Propiedades de configuración del error
    this.severity = options.severity ?? ErrorSeverity.MEDIUM;
    this.category = options.category ?? ErrorCategory.SYSTEM;
    this.isRetryable = options.isRetryable ?? false;
    this.statusCode = options.statusCode;

    this.metadata = {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...options.metadata,
    };

    // Maintain proper stack trace
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  // Helper methods for creating specific error types
  static validation(message: string, field?: string, value?: unknown): CustomError {
    return new CustomError(
      message,
      'VALIDATION_ERROR',
      'Los datos proporcionados no son válidos. Por favor, verifica e intenta nuevamente.',
      {
        severity: ErrorSeverity.LOW,
        category: ErrorCategory.VALIDATION,
        metadata: { field, value },
      }
    );
  }

  static authentication(message: string): CustomError {
    return new CustomError(
      message,
      'AUTH_ERROR',
      'Error de autenticación. Por favor, inicia sesión nuevamente.',
      {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.AUTHENTICATION,
        statusCode: 401,
      }
    );
  }

  static authorization(message: string): CustomError {
    return new CustomError(
      message,
      'AUTHZ_ERROR',
      'No tienes permisos para realizar esta acción.',
      {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.AUTHORIZATION,
        statusCode: 403,
      }
    );
  }

  static network(message: string, isRetryable: boolean = true): CustomError {
    return new CustomError(
      message,
      'NETWORK_ERROR',
      'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.',
      {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.NETWORK,
        isRetryable,
      }
    );
  }

  static database(message: string): CustomError {
    return new CustomError(
      message,
      'DATABASE_ERROR',
      'Error interno del servidor. Por favor, intenta nuevamente en unos momentos.',
      {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.DATABASE,
        statusCode: 500,
      }
    );
  }

  static businessLogic(message: string, friendlyMessage: string): CustomError {
    return new CustomError(message, 'BUSINESS_ERROR', friendlyMessage, {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.BUSINESS_LOGIC,
    });
  }

  static externalService(message: string, serviceName: string): CustomError {
    return new CustomError(
      message,
      'EXTERNAL_SERVICE_ERROR',
      'Servicio temporalmente no disponible. Por favor, intenta nuevamente más tarde.',
      {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.EXTERNAL_SERVICE,
        isRetryable: true,
        metadata: { serviceName },
      }
    );
  }

  // Helper method to check if error should be shown to user
  shouldShowToUser(): boolean {
    return this.severity !== ErrorSeverity.CRITICAL && this.category !== ErrorCategory.SYSTEM;
  }

  // Helper method to get user-friendly message
  getUserMessage(): string {
    return this.friendlyMessage;
  }

  // Serialize for logging
  toLogObject(): object {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      friendlyMessage: this.friendlyMessage,
      severity: this.severity,
      category: this.category,
      isRetryable: this.isRetryable,
      statusCode: this.statusCode,
      metadata: this.metadata,
      stack: this.stack,
    };
  }
}
