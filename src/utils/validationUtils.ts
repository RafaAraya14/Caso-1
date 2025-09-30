/**
 * Validation Utilities
 *
 * Conjunto completo de utilidades para validación de datos.
 * Incluye validadores comunes, composición de validadores y validaciones específicas.
 *
 * @pattern Strategy + Factory + Composite
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export type ValidationRule<T = any> = (value: T) => ValidationResult;

export interface ValidatorOptions {
  required?: boolean;
  message?: string;
  trim?: boolean;
}

/**
 * Clase base para validadores personalizados
 */
export abstract class BaseValidator<T = any> {
  protected options: ValidatorOptions;

  constructor(options: ValidatorOptions = {}) {
    this.options = options;
  }

  abstract validate(value: T): ValidationResult;

  protected createError(message: string): ValidationResult {
    return { isValid: false, error: message };
  }

  protected createSuccess(warnings?: string[]): ValidationResult {
    return { isValid: true, warnings };
  }
}

/**
 * Singleton ValidationUtils para configuración global
 */
export class ValidationUtils {
  private static instance: ValidationUtils;
  private defaultLocale: string = 'es-ES';
  private customValidators: Map<string, ValidationRule> = new Map();

  private constructor() {}

  public static getInstance(): ValidationUtils {
    if (!ValidationUtils.instance) {
      ValidationUtils.instance = new ValidationUtils();
    }
    return ValidationUtils.instance;
  }

  public configure(locale: string): void {
    this.defaultLocale = locale;
  }

  public registerValidator(name: string, validator: ValidationRule): void {
    this.customValidators.set(name, validator);
  }

  public getValidator(name: string): ValidationRule | undefined {
    return this.customValidators.get(name);
  }

  public getDefaultLocale(): string {
    return this.defaultLocale;
  }
}

// Validadores básicos

export const isRequired = (message: string = 'Este campo es requerido'): ValidationRule => {
  return (value: any): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return { isValid: false, error: message };
    }

    if (typeof value === 'string' && value.trim() === '') {
      return { isValid: false, error: message };
    }

    if (Array.isArray(value) && value.length === 0) {
      return { isValid: false, error: message };
    }

    return { isValid: true };
  };
};

export const minLength = (min: number, message?: string): ValidationRule<string> => {
  return (value: string): ValidationResult => {
    if (!value) {
      return { isValid: true };
    } // Skip si está vacío (usar isRequired para requerir)

    if (value.length < min) {
      const defaultMessage = `Debe tener al menos ${min} caracteres`;
      return { isValid: false, error: message || defaultMessage };
    }

    return { isValid: true };
  };
};

export const maxLength = (max: number, message?: string): ValidationRule<string> => {
  return (value: string): ValidationResult => {
    if (!value) {
      return { isValid: true };
    }

    if (value.length > max) {
      const defaultMessage = `No puede tener más de ${max} caracteres`;
      return { isValid: false, error: message || defaultMessage };
    }

    return { isValid: true };
  };
};

export const isEmail = (message: string = 'Debe ser un email válido'): ValidationRule<string> => {
  return (value: string): ValidationResult => {
    if (!value) {
      return { isValid: true };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { isValid: false, error: message };
    }

    return { isValid: true };
  };
};

export const isPhone = (country: string = 'MX', message?: string): ValidationRule<string> => {
  return (value: string): ValidationResult => {
    if (!value) {
      return { isValid: true };
    }

    const cleaned = value.replace(/\D/g, '');
    let isValid = false;

    switch (country) {
      case 'MX':
        isValid = cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith('52'));
        break;
      case 'US':
        isValid = cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'));
        break;
      default:
        isValid = cleaned.length >= 10 && cleaned.length <= 15;
    }

    if (!isValid) {
      const defaultMessage = 'Debe ser un número de teléfono válido';
      return { isValid: false, error: message || defaultMessage };
    }

    return { isValid: true };
  };
};

export const isUrl = (message: string = 'Debe ser una URL válida'): ValidationRule<string> => {
  return (value: string): ValidationResult => {
    if (!value) {
      return { isValid: true };
    }

    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return { isValid: false, error: message };
    }
  };
};

export const isDate = (
  message: string = 'Debe ser una fecha válida'
): ValidationRule<string | Date> => {
  return (value: string | Date): ValidationResult => {
    if (!value) {
      return { isValid: true };
    }

    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) {
      return { isValid: false, error: message };
    }

    return { isValid: true };
  };
};

export const isPositiveNumber = (
  message: string = 'Debe ser un número positivo'
): ValidationRule<number> => {
  return (value: number): ValidationResult => {
    if (value === null || value === undefined) {
      return { isValid: true };
    }

    if (typeof value !== 'number' || isNaN(value) || value <= 0) {
      return { isValid: false, error: message };
    }

    return { isValid: true };
  };
};

export const isInteger = (
  message: string = 'Debe ser un número entero'
): ValidationRule<number> => {
  return (value: number): ValidationResult => {
    if (value === null || value === undefined) {
      return { isValid: true };
    }

    if (!Number.isInteger(value)) {
      return { isValid: false, error: message };
    }

    return { isValid: true };
  };
};

export const isBetween = (min: number, max: number, message?: string): ValidationRule<number> => {
  return (value: number): ValidationResult => {
    if (value === null || value === undefined) {
      return { isValid: true };
    }

    if (value < min || value > max) {
      const defaultMessage = `Debe estar entre ${min} y ${max}`;
      return { isValid: false, error: message || defaultMessage };
    }

    return { isValid: true };
  };
};

export const matchesRegex = (
  pattern: RegExp,
  message: string = 'Formato inválido'
): ValidationRule<string> => {
  return (value: string): ValidationResult => {
    if (!value) {
      return { isValid: true };
    }

    if (!pattern.test(value)) {
      return { isValid: false, error: message };
    }

    return { isValid: true };
  };
};

// Validadores específicos para la aplicación

export const isValidRating = (min: number = 1, max: number = 5): ValidationRule<number> => {
  return (value: number): ValidationResult => {
    if (value === null || value === undefined) {
      return { isValid: true };
    }

    if (typeof value !== 'number' || value < min || value > max) {
      return { isValid: false, error: `La calificación debe estar entre ${min} y ${max}` };
    }

    return { isValid: true };
  };
};

export const isValidSkills = (maxSkills: number = 10): ValidationRule<string[]> => {
  return (value: string[]): ValidationResult => {
    if (!value) {
      return { isValid: true };
    }

    if (!Array.isArray(value)) {
      return { isValid: false, error: 'Las habilidades deben ser una lista' };
    }

    if (value.length > maxSkills) {
      return { isValid: false, error: `Máximo ${maxSkills} habilidades permitidas` };
    }

    const invalidSkills = value.filter(skill => !skill || skill.trim().length < 2);
    if (invalidSkills.length > 0) {
      return { isValid: false, error: 'Todas las habilidades deben tener al menos 2 caracteres' };
    }

    return { isValid: true };
  };
};

export const isValidSessionDate = (): ValidationRule<Date | string> => {
  return (value: Date | string): ValidationResult => {
    if (!value) {
      return { isValid: true };
    }

    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Fecha inválida' };
    }

    const now = new Date();
    const minDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora en el futuro

    if (date <= minDate) {
      return {
        isValid: false,
        error: 'La sesión debe ser programada con al menos 1 hora de anticipación',
      };
    }

    const maxDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    if (date > maxDate) {
      return {
        isValid: false,
        error: 'La sesión no puede ser programada con más de 1 año de anticipación',
      };
    }

    return { isValid: true };
  };
};

export const isValidPrice = (currency: string = 'MXN'): ValidationRule<number> => {
  return (value: number): ValidationResult => {
    if (value === null || value === undefined) {
      return { isValid: true };
    }

    if (typeof value !== 'number' || isNaN(value) || value < 0) {
      return { isValid: false, error: 'El precio debe ser un número positivo' };
    }

    const maxPrices: Record<string, number> = {
      MXN: 50000,
      USD: 2500,
      EUR: 2200,
    };

    const maxPrice = maxPrices[currency] || 50000;

    if (value > maxPrice) {
      return { isValid: false, error: `El precio no puede exceder ${maxPrice} ${currency}` };
    }

    return { isValid: true };
  };
};

// Composición de validadores

export const createValidator = (...rules: ValidationRule[]): ValidationRule => {
  return (value: any): ValidationResult => {
    for (const rule of rules) {
      const result = rule(value);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  };
};

export const combineValidators = (validators: ValidationRule[]): ValidationRule => {
  return (value: any): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid && result.error) {
        errors.push(result.error);
      }
      if (result.warnings) {
        warnings.push(...result.warnings);
      }
    }

    return {
      isValid: errors.length === 0,
      error: errors.length > 0 ? errors[0] : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  };
};

// Validadores condicionales

export const conditionalValidator = (
  condition: (value: any) => boolean,
  validator: ValidationRule
): ValidationRule => {
  return (value: any): ValidationResult => {
    if (condition(value)) {
      return validator(value);
    }
    return { isValid: true };
  };
};

export const dependentValidator = (
  dependsOn: string,
  context: Record<string, any>,
  validator: ValidationRule
): ValidationRule => {
  return (value: any): ValidationResult => {
    if (context[dependsOn]) {
      return validator(value);
    }
    return { isValid: true };
  };
};

// Validadores asíncronos

export type AsyncValidationRule<T = any> = (value: T) => Promise<ValidationResult>;

export const createAsyncValidator = (...rules: AsyncValidationRule[]): AsyncValidationRule => {
  return async (value: any): Promise<ValidationResult> => {
    for (const rule of rules) {
      const result = await rule(value);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  };
};

export const isUniqueEmail = (
  checkFunction: (email: string) => Promise<boolean>
): AsyncValidationRule<string> => {
  return async (value: string): Promise<ValidationResult> => {
    if (!value) {
      return { isValid: true };
    }

    const isUnique = await checkFunction(value);
    if (!isUnique) {
      return { isValid: false, error: 'Este email ya está registrado' };
    }

    return { isValid: true };
  };
};

export const isValidCoachAvailability = (
  checkFunction: (coachId: string, date: Date) => Promise<boolean>
): AsyncValidationRule<{ coachId: string; date: Date }> => {
  return async (value: { coachId: string; date: Date }): Promise<ValidationResult> => {
    if (!value || !value.coachId || !value.date) {
      return { isValid: true };
    }

    const isAvailable = await checkFunction(value.coachId, value.date);
    if (!isAvailable) {
      return { isValid: false, error: 'El coach no está disponible en esta fecha y hora' };
    }

    return { isValid: true };
  };
};

// Utilidades de validación de formularios

export interface FormValidation {
  [field: string]: ValidationRule[];
}

export interface FormErrors {
  [field: string]: string;
}

export const validateForm = (data: Record<string, any>, validation: FormValidation): FormErrors => {
  const errors: FormErrors = {};

  for (const [field, validators] of Object.entries(validation)) {
    const value = data[field];

    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid && result.error) {
        errors[field] = result.error;
        break; // Solo mostrar el primer error por campo
      }
    }
  }

  return errors;
};

export const validateFormAsync = async (
  data: Record<string, any>,
  validation: Record<string, AsyncValidationRule[]>
): Promise<FormErrors> => {
  const errors: FormErrors = {};

  for (const [field, validators] of Object.entries(validation)) {
    const value = data[field];

    for (const validator of validators) {
      const result = await validator(value);
      if (!result.isValid && result.error) {
        errors[field] = result.error;
        break;
      }
    }
  }

  return errors;
};

export const hasFormErrors = (errors: FormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

export const getFirstError = (errors: FormErrors): string | null => {
  const firstField = Object.keys(errors)[0];
  return firstField ? errors[firstField] : null;
};

// Validaciones específicas del dominio

export const validateCoachProfile = {
  firstName: [isRequired('El nombre es requerido'), minLength(2), maxLength(50)],
  lastName: [isRequired('El apellido es requerido'), minLength(2), maxLength(50)],
  email: [isRequired('El email es requerido'), isEmail()],
  phone: [isRequired('El teléfono es requerido'), isPhone('MX')],
  hourlyRate: [
    isRequired('La tarifa por hora es requerida'),
    isPositiveNumber(),
    isValidPrice('MXN'),
  ],
  skills: [isRequired('Las habilidades son requeridas'), isValidSkills(10)],
  bio: [maxLength(1000, 'La biografía no puede tener más de 1000 caracteres')],
};

export const validateSessionBooking = {
  coachId: [isRequired('Debe seleccionar un coach')],
  sessionDate: [isRequired('La fecha es requerida'), isValidSessionDate()],
  duration: [
    isRequired('La duración es requerida'),
    isInteger(),
    isBetween(30, 480, 'La duración debe estar entre 30 minutos y 8 horas'),
  ],
  sessionType: [isRequired('El tipo de sesión es requerido')],
  notes: [maxLength(500, 'Las notas no pueden tener más de 500 caracteres')],
};

export const validateUserRegistration = {
  firstName: [isRequired('El nombre es requerido'), minLength(2), maxLength(50)],
  lastName: [isRequired('El apellido es requerido'), minLength(2), maxLength(50)],
  email: [isRequired('El email es requerido'), isEmail()],
  password: [
    isRequired('La contraseña es requerida'),
    minLength(8, 'La contraseña debe tener al menos 8 caracteres'),
    matchesRegex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  ],
  phone: [isPhone('MX')],
  birthDate: [isDate()],
};
