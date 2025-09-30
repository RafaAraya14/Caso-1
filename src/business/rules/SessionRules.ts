// src/business/rules/SessionRules.ts
import type { Coach } from '../../models/Coach';
import type { User } from '../../models/User';

/**
 * Reglas de negocio para las sesiones de 20minCoach
 * Implementa Domain-Driven Design patterns
 */
export class SessionRules {
  private static readonly SESSION_DURATION_MINUTES = 20;
  private static readonly BUSINESS_HOURS_START = 8; // 8 AM
  private static readonly BUSINESS_HOURS_END = 22; // 10 PM
  private static readonly MAX_SESSIONS_PER_DAY = 8;

  /**
   * Valida si un usuario puede reservar una sesión
   */
  static canUserBookSession(user: User): { canBook: boolean; reason?: string } {
    // Solo clientes pueden reservar sesiones
    if (user.role !== 'BasicUser' && user.role !== 'PremiumUser') {
      return {
        canBook: false,
        reason: 'Solo los usuarios registrados pueden reservar sesiones',
      };
    }

    // Verificar suscripción activa
    if (!user.hasActiveSubscription) {
      return {
        canBook: false,
        reason: 'Necesitas una suscripción activa para reservar sesiones',
      };
    }

    // Verificar créditos disponibles
    if (user.sessionsRemaining <= 0) {
      return {
        canBook: false,
        reason: 'No tienes sesiones disponibles en tu paquete',
      };
    }

    return { canBook: true };
  }

  /**
   * Valida si un coach puede aceptar una sesión
   */
  static canCoachAcceptSession(coach: Coach): { canAccept: boolean; reason?: string } {
    // Verificar disponibilidad
    if (!coach.isAvailable) {
      return {
        canAccept: false,
        reason: 'El coach no está disponible en este momento',
      };
    }

    // Verificar rating mínimo
    if (!coach.canAcceptSession()) {
      return {
        canAccept: false,
        reason: 'El coach no cumple con los requisitos mínimos de calidad',
      };
    }

    return { canAccept: true };
  }

  /**
   * Valida el horario de la sesión
   */
  static isValidSessionTime(
    hour: number,
    minute: number = 0
  ): { isValid: boolean; reason?: string } {
    // Verificar horario de negocio
    if (hour < this.BUSINESS_HOURS_START || hour >= this.BUSINESS_HOURS_END) {
      return {
        isValid: false,
        reason: `Las sesiones solo están disponibles de ${this.BUSINESS_HOURS_START}:00 a ${this.BUSINESS_HOURS_END}:00`,
      };
    }

    // Verificar minutos válidos (solo :00 y :30)
    if (minute !== 0 && minute !== 30) {
      return {
        isValid: false,
        reason: 'Las sesiones solo pueden iniciarse en punto o a los 30 minutos',
      };
    }

    return { isValid: true };
  }

  /**
   * Calcula el costo de la sesión según el tipo de usuario
   */
  static calculateSessionCost(userType: 'BasicUser' | 'PremiumUser'): number {
    const baseCost = 20; // USD
    const premiumDiscount = 0.25; // 25% descuento

    return userType === 'PremiumUser' ? baseCost * (1 - premiumDiscount) : baseCost;
  }

  /**
   * Obtiene la duración estándar de las sesiones
   */
  static getSessionDuration(): number {
    return this.SESSION_DURATION_MINUTES;
  }

  /**
   * Valida si se puede crear una sesión entre un usuario y coach específicos
   */
  static validateSessionCreation(
    user: User,
    coach: Coach,
    requestedHour: number
  ): { isValid: boolean; reason?: string } {
    // Validar usuario
    const userValidation = this.canUserBookSession(user);
    if (!userValidation.canBook) {
      return { isValid: false, reason: userValidation.reason };
    }

    // Validar coach
    const coachValidation = this.canCoachAcceptSession(coach);
    if (!coachValidation.canAccept) {
      return { isValid: false, reason: coachValidation.reason };
    }

    // Validar horario
    const timeValidation = this.isValidSessionTime(requestedHour);
    if (!timeValidation.isValid) {
      return { isValid: false, reason: timeValidation.reason };
    }

    return { isValid: true };
  }
}
