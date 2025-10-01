// src/validators/CreateSessionValidator.ts
import { BaseValidator, type ValidationResult } from './BaseValidator';

import type { CreateSessionDTO } from '../types/dtos/CreateSessionDTO';

/**
 * Validador para CreateSessionDTO
 * Ejemplo de implementación específica siguiendo el patrón Strategy
 */
export class CreateSessionValidator extends BaseValidator<CreateSessionDTO> {
  validate(data: CreateSessionDTO): ValidationResult {
    const errors = [];

    // Validar campos requeridos
    if (!data.userId) {
      errors.push(this.createError('userId', 'El ID de usuario es requerido', 'REQUIRED_FIELD'));
    }

    if (!data.coachId) {
      errors.push(this.createError('coachId', 'El ID del coach es requerido', 'REQUIRED_FIELD'));
    } else if (!this.isValidIdFormat(data.coachId)) {
      errors.push(this.createError('coachId', 'Formato de ID de coach inválido', 'INVALID_FORMAT'));
    }

    if (!data.scheduledDateTime) {
      errors.push(
        this.createError('scheduledDateTime', 'La fecha programada es requerida', 'REQUIRED_FIELD')
      );
    } else {
      const dateValidation = this.validateScheduledDateTime(data.scheduledDateTime);
      if (dateValidation) {
        errors.push(dateValidation);
      }
    }

    if (!data.duration) {
      errors.push(this.createError('duration', 'La duración es requerida', 'REQUIRED_FIELD'));
    } else if (data.duration < 10 || data.duration >= 120) {
      errors.push(
        this.createError(
          'duration',
          'La duración debe estar entre 10 y 119 minutos',
          'INVALID_RANGE'
        )
      );
    }

    if (!data.sessionType) {
      errors.push(
        this.createError('sessionType', 'El tipo de sesión es requerido', 'REQUIRED_FIELD')
      );
    } else if (!['video-call', 'phone-call', 'in-person'].includes(data.sessionType)) {
      errors.push(this.createError('sessionType', 'Tipo de sesión inválido', 'INVALID_VALUE'));
    }

    // Validar campos opcionales
    if (data.topic && data.topic.length > 200) {
      errors.push(
        this.createError('topic', 'El tema no puede exceder 200 caracteres', 'MAX_LENGTH')
      );
    }

    if (data.notes && data.notes.length > 500) {
      errors.push(
        this.createError('notes', 'Las notas no pueden exceder 500 caracteres', 'MAX_LENGTH')
      );
    }

    return {
      isValid: errors.length === 0,
      errors: errors.filter(Boolean),
    };
  }

  private isValidIdFormat(id: string): boolean {
    // Debe tener formato uuid o ID estructurado (no solo "invalid-id")
    return /^[a-zA-Z0-9-]+$/.test(id) && id.length >= 5 && !id.startsWith('invalid');
  }

  private validateScheduledDateTime(dateTime: string) {
    const date = new Date(dateTime);

    if (isNaN(date.getTime())) {
      return this.createError('scheduledDateTime', 'Formato de fecha inválido', 'INVALID_FORMAT');
    }

    const now = new Date();
    const minAdvanceTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora de anticipación

    if (date <= minAdvanceTime) {
      return this.createError(
        'scheduledDateTime',
        'La sesión debe programarse con al menos 1 hora de anticipación',
        'INVALID_DATE'
      );
    }

    return null;
  }

  /**
   * Valida que la sesión esté dentro del horario de negocio
   */
  private validateBusinessHours(scheduledTime: string) {
    const date = new Date(scheduledTime);
    const hour = date.getHours();
    const minute = date.getMinutes();

    // Horario de negocio: 8:00 AM a 10:00 PM
    if (hour < 8 || hour >= 22) {
      return this.createError(
        'scheduledTime',
        'Las sesiones solo están disponibles de 8:00 AM a 10:00 PM',
        'OUTSIDE_BUSINESS_HOURS'
      );
    }

    // Solo permitir sesiones en punto o media hora
    if (minute !== 0 && minute !== 30) {
      return this.createError(
        'scheduledTime',
        'Las sesiones solo pueden empezar en punto o a los 30 minutos',
        'INVALID_TIME_SLOT'
      );
    }

    return null;
  }

  /**
   * Valida la especialidad
   */
  private validateSpecialty(specialty: string) {
    const validSpecialties = [
      'Psychology',
      'Programming',
      'Art',
      'Fitness',
      'Law',
      'Mechanics',
      'Agriculture',
      'Cloud Services',
      'Business',
      'Career Development',
      'Health',
      'Education',
      'Finance',
      'Design',
      'Marketing',
      'Writing',
      'Music',
      'Cooking',
    ];

    if (!validSpecialties.includes(specialty)) {
      return this.createError(
        'specialty',
        `Especialidad inválida. Opciones válidas: ${validSpecialties.join(', ')}`,
        'INVALID_SPECIALTY'
      );
    }

    return null;
  }

  /**
   * Valida la duración preferida
   */
  private validateDuration(duration: number) {
    // Solo permitimos sesiones de 20 minutos (estándar de 20minCoach)
    if (duration !== 20) {
      return this.createError(
        'preferredDuration',
        'Solo se permiten sesiones de 20 minutos',
        'INVALID_DURATION'
      );
    }

    return null;
  }

  /**
   * Validación rápida solo para campos requeridos
   */
  static validateRequired(data: Partial<CreateSessionDTO>): ValidationResult {
    const validator = new CreateSessionValidator();
    const errors = [];

    const userIdError = validator.validateRequired(data.userId, 'userId');
    if (userIdError) {
      errors.push(userIdError);
    }

    const coachIdError = validator.validateRequired(data.coachId, 'coachId');
    if (coachIdError) {
      errors.push(coachIdError);
    }

    const timeError = validator.validateRequired(data.scheduledTime, 'scheduledTime');
    if (timeError) {
      errors.push(timeError);
    }

    return {
      isValid: errors.length === 0,
      errors: errors.filter(Boolean),
    };
  }

  /**
   * Valida solo el formato de tiempo sin otras restricciones
   */
  static validateTimeFormat(scheduledTime: string): ValidationResult {
    const validator = new CreateSessionValidator();
    const errors = [];

    const dateError = validator.validateDate(scheduledTime, 'scheduledTime');
    if (dateError) {
      errors.push(dateError);
    }

    return {
      isValid: errors.length === 0,
      errors: errors.filter(Boolean),
    };
  }
}
