// src/validators/BaseValidator.ts

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Error de validación
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Clase base para todos los validadores
 * Implementa patrón Strategy para diferentes tipos de validación
 */
export abstract class BaseValidator<T> {
  /**
   * Valida un objeto completo
   */
  abstract validate(data: T): ValidationResult;

  /**
   * Crea un error de validación
   */
  protected createError(field: string, message: string, code: string): ValidationError {
    return { field, message, code };
  }

  /**
   * Combina múltiples resultados de validación
   */
  protected combineResults(...results: ValidationResult[]): ValidationResult {
    const allErrors = results.flatMap(result => result.errors);
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  /**
   * Validaciones comunes reutilizables
   */
  protected validateRequired(value: any, fieldName: string): ValidationError | null {
    if (value === null || value === undefined || value === '') {
      return this.createError(fieldName, `${fieldName} es requerido`, 'REQUIRED');
    }
    return null;
  }

  protected validateEmail(email: string, fieldName: string = 'email'): ValidationError | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return this.createError(fieldName, 'Formato de email inválido', 'INVALID_EMAIL');
    }
    return null;
  }

  protected validateLength(
    value: string,
    min: number,
    max: number,
    fieldName: string
  ): ValidationError | null {
    if (value.length < min) {
      return this.createError(
        fieldName,
        `${fieldName} debe tener al menos ${min} caracteres`,
        'MIN_LENGTH'
      );
    }
    if (value.length > max) {
      return this.createError(
        fieldName,
        `${fieldName} no puede tener más de ${max} caracteres`,
        'MAX_LENGTH'
      );
    }
    return null;
  }

  protected validateRange(
    value: number,
    min: number,
    max: number,
    fieldName: string
  ): ValidationError | null {
    if (value < min || value > max) {
      return this.createError(
        fieldName,
        `${fieldName} debe estar entre ${min} y ${max}`,
        'OUT_OF_RANGE'
      );
    }
    return null;
  }

  protected validatePattern(
    value: string,
    pattern: RegExp,
    fieldName: string,
    message: string
  ): ValidationError | null {
    if (!pattern.test(value)) {
      return this.createError(fieldName, message, 'PATTERN_MISMATCH');
    }
    return null;
  }

  protected validateDate(dateString: string, fieldName: string): ValidationError | null {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return this.createError(fieldName, 'Formato de fecha inválido', 'INVALID_DATE');
    }
    return null;
  }

  protected validateFutureDate(dateString: string, fieldName: string): ValidationError | null {
    const dateError = this.validateDate(dateString, fieldName);
    if (dateError) {
      return dateError;
    }

    const date = new Date(dateString);
    const now = new Date();

    if (date <= now) {
      return this.createError(fieldName, 'La fecha debe ser en el futuro', 'PAST_DATE');
    }
    return null;
  }

  /**
   * Convierte un resultado de validación a un string legible
   */
  static formatErrors(result: ValidationResult): string {
    if (result.isValid) {
      return '';
    }

    return result.errors.map(error => `${error.field}: ${error.message}`).join('; ');
  }

  /**
   * Obtiene solo los errores de un campo específico
   */
  static getFieldErrors(result: ValidationResult, fieldName: string): ValidationError[] {
    return result.errors.filter(error => error.field === fieldName);
  }
}
