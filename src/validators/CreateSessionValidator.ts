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

    // Validar userId
    const userIdError = this.validateRequired(data.userId, 'userId');
    if (userIdError) {
      errors.push(userIdError);
    }

    // Validar coachId
    const coachIdError = this.validateRequired(data.coachId, 'coachId');
    if (coachIdError) {
      errors.push(coachIdError);
    }

    // Validar scheduledTime
    const timeError = this.validateRequired(data.scheduledTime, 'scheduledTime');
    if (timeError) {
      errors.push(timeError);
    } else {
      // Validar formato de fecha
      const dateFormatError = this.validateDate(data.scheduledTime, 'scheduledTime');
      if (dateFormatError) {
        errors.push(dateFormatError);
      } else {
        // Validar que sea fecha futura
        const futureDateError = this.validateFutureDate(data.scheduledTime, 'scheduledTime');
        if (futureDateError) {
          errors.push(futureDateError);
        }

        // Validar horario de negocio
        const businessHoursError = this.validateBusinessHours(data.scheduledTime);
        if (businessHoursError) {
          errors.push(businessHoursError);
        }
      }
    }

    // Validar specialty (opcional pero si existe debe ser válida)
    if (data.specialty !== undefined) {
      const specialtyError = this.validateSpecialty(data.specialty);
      if (specialtyError) {
        errors.push(specialtyError);
      }
    }

    // Validar notes (opcional pero con límite)
    if (data.notes !== undefined) {
      const notesError = this.validateLength(data.notes, 0, 500, 'notes');
      if (notesError) {
        errors.push(notesError);
      }
    }

    // Validar preferredDuration
    if (data.preferredDuration !== undefined) {
      const durationError = this.validateDuration(data.preferredDuration);
      if (durationError) {
        errors.push(durationError);
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.filter(Boolean),
    };
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
