// src/error-handling/errorHandler.ts
import { CustomError, ErrorSeverity, ErrorCategory } from './CustomError';
import { logger } from '../logging/logger';

/**
 * Handler centralizado para manejo de errores
 */
export class ErrorHandler {
  /**
   * Procesa y loggea un error, retornando el mensaje apropiado para el usuario
   */
  static handle(error: unknown, context?: {
    component?: string;
    action?: string;
    userId?: string;
    sessionId?: string;
  }): string {
    let customError: CustomError;
    
    // Convertir cualquier error a CustomError
    if (error instanceof CustomError) {
      customError = error;
    } else if (error instanceof Error) {
      customError = this.convertToCustomError(error);
    } else {
      customError = new CustomError(
        `Unknown error: ${String(error)}`,
        'UNKNOWN_ERROR',
        'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.',
        {
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.SYSTEM
        }
      );
    }

    // Agregar contexto al metadata
    if (context) {
      customError.metadata.component = context.component;
      customError.metadata.action = context.action;
      customError.metadata.userId = context.userId;
      customError.metadata.sessionId = context.sessionId;
    }

    // Loggear el error
    const logLevel = this.getLogLevel(customError);
    if (logLevel === 'critical') {
      logger.critical(customError.message, customError, {
        component: context?.component,
        action: context?.action,
        userId: context?.userId,
        sessionId: context?.sessionId,
        friendlyMessage: customError.friendlyMessage
      });
    } else {
      logger.error(customError.message, customError, {
        component: context?.component,
        action: context?.action,
        userId: context?.userId,
        sessionId: context?.sessionId,
        friendlyMessage: customError.friendlyMessage
      });
    }

    // Retornar mensaje apropiado para el usuario
    return customError.shouldShowToUser() ? customError.getUserMessage() : 
           'Ha ocurrido un error interno. Por favor, contacta soporte si el problema persiste.';
  }

  /**
   * Convierte errores estándar a CustomError
   */
  private static convertToCustomError(error: Error): CustomError {
    // Mapear errores comunes
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return CustomError.network('Network request failed: ' + error.message);
    }
    
    if (error.name === 'SyntaxError') {
      return CustomError.validation('Invalid data format: ' + error.message);
    }
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return CustomError.authentication('Authentication failed: ' + error.message);
    }
    
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return CustomError.authorization('Authorization failed: ' + error.message);
    }
    
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return CustomError.database('Database error: ' + error.message);
    }

    // Error genérico
    return new CustomError(
      error.message,
      'GENERIC_ERROR',
      'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.',
      {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.SYSTEM,
        metadata: {
          originalErrorName: error.name,
          originalStack: error.stack
        }
      }
    );
  }

  /**
   * Determina el nivel de log basado en la severidad del error
   */
  private static getLogLevel(error: CustomError): 'error' | 'critical' {
    return error.severity === ErrorSeverity.CRITICAL ? 'critical' : 'error';
  }

  /**
   * Helper para manejo async/await con logging automático
   */
  static async tryAsync<T>(
    operation: () => Promise<T>,
    context?: {
      component?: string;
      action?: string;
      userId?: string;
      sessionId?: string;
    }
  ): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      const errorMessage = this.handle(error, context);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Helper para manejo síncronò con logging automático
   */
  static try<T>(
    operation: () => T,
    context?: {
      component?: string;
      action?: string;
      userId?: string;
      sessionId?: string;
    }
  ): { success: true; data: T } | { success: false; error: string } {
    try {
      const data = operation();
      return { success: true, data };
    } catch (error) {
      const errorMessage = this.handle(error, context);
      return { success: false, error: errorMessage };
    }
  }
}

/**
 * Decorator para métodos que necesitan manejo automático de errores
 */
export function withErrorHandling(
  component: string,
  action?: string
) {
  return function (target: unknown, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      try {
        return await method.apply(this, args);
      } catch (error) {
        const errorMessage = ErrorHandler.handle(error, {
          component,
          action: action || propertyName
        });
        throw new CustomError(
          `Error in ${component}.${action || propertyName}`,
          'METHOD_ERROR',
          errorMessage
        );
      }
    };

    return descriptor;
  };
}