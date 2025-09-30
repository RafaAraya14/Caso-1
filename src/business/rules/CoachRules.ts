// src/business/rules/CoachRules.ts
import type { Coach } from '../../models/Coach';

/**
 * Reglas de negocio específicas para coaches
 * Implementa políticas de calidad y disponibilidad
 */
export class CoachRules {
  private static readonly MINIMUM_RATING = 3.5;
  private static readonly MAX_SESSIONS_PER_DAY = 8;
  private static readonly RATING_TIER_THRESHOLDS = {
    bronze: 3.5,
    silver: 4.0,
    gold: 4.5,
    platinum: 4.8,
  };

  /**
   * Determina el tier del coach basado en su rating
   */
  static getCoachTier(rating: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (rating >= this.RATING_TIER_THRESHOLDS.platinum) {
      return 'platinum';
    }
    if (rating >= this.RATING_TIER_THRESHOLDS.gold) {
      return 'gold';
    }
    if (rating >= this.RATING_TIER_THRESHOLDS.silver) {
      return 'silver';
    }
    return 'bronze';
  }

  /**
   * Calcula el multiplicador de ganancias según el tier
   */
  static getTierMultiplier(tier: 'bronze' | 'silver' | 'gold' | 'platinum'): number {
    const multipliers = {
      bronze: 1.0,
      silver: 1.1,
      gold: 1.25,
      platinum: 1.5,
    };
    return multipliers[tier];
  }

  /**
   * Valida si un coach está calificado para operar
   */
  static isQualifiedCoach(coach: Coach): { isQualified: boolean; reason?: string } {
    // Verificar rating mínimo
    if (coach.rating < this.MINIMUM_RATING) {
      return {
        isQualified: false,
        reason: `Rating insuficiente. Mínimo requerido: ${this.MINIMUM_RATING}`,
      };
    }

    // Verificar que tenga especialidades
    if (!coach.specialties || coach.specialties.length === 0) {
      return {
        isQualified: false,
        reason: 'El coach debe tener al menos una especialidad definida',
      };
    }

    return { isQualified: true };
  }

  /**
   * Verifica si el coach puede aceptar más sesiones hoy
   */
  static canAcceptMoreSessions(sessionsToday: number): { canAccept: boolean; reason?: string } {
    if (sessionsToday >= this.MAX_SESSIONS_PER_DAY) {
      return {
        canAccept: false,
        reason: `Límite diario alcanzado (${this.MAX_SESSIONS_PER_DAY} sesiones)`,
      };
    }

    return { canAccept: true };
  }

  /**
   * Calcula las ganancias esperadas para un coach
   */
  static calculateExpectedEarnings(
    coach: Coach,
    sessionsCount: number
  ): { baseEarnings: number; tierBonus: number; totalEarnings: number } {
    const baseRate = 25; // USD por sesión
    const tier = this.getCoachTier(coach.rating);
    const tierMultiplier = this.getTierMultiplier(tier);

    const baseEarnings = sessionsCount * baseRate;
    const tierBonus = baseEarnings * (tierMultiplier - 1);
    const totalEarnings = baseEarnings * tierMultiplier;

    return {
      baseEarnings,
      tierBonus,
      totalEarnings,
    };
  }

  /**
   * Determina si un coach necesita capacitación adicional
   */
  static needsTraining(coach: Coach): { needsTraining: boolean; reason?: string } {
    const tier = this.getCoachTier(coach.rating);

    // Coaches bronze necesitan capacitación
    if (tier === 'bronze') {
      return {
        needsTraining: true,
        reason: 'Coach en tier Bronze requiere capacitación para mejorar',
      };
    }

    // Si tiene pocas especialidades, podría beneficiarse de capacitación
    if (coach.specialties.length < 2) {
      return {
        needsTraining: true,
        reason: 'Desarrollar más especialidades aumentaría las oportunidades',
      };
    }

    return { needsTraining: false };
  }

  /**
   * Valida si un coach puede cambiar su disponibilidad
   */
  static canToggleAvailability(
    coach: Coach,
    currentSessions: number
  ): { canToggle: boolean; reason?: string } {
    // No puede ponerse no disponible si está en sesión
    if (currentSessions > 0 && coach.isAvailable) {
      return {
        canToggle: false,
        reason: 'No puedes desactivarte mientras tienes sesiones activas',
      };
    }

    // No puede activarse si no está calificado
    const qualificationCheck = this.isQualifiedCoach(coach);
    if (!qualificationCheck.isQualified) {
      return {
        canToggle: false,
        reason: qualificationCheck.reason,
      };
    }

    return { canToggle: true };
  }

  /**
   * Filtra coaches por especialidad y disponibilidad
   */
  static filterAvailableCoaches(coaches: Coach[], specialty?: string): Coach[] {
    return coaches.filter(coach => {
      // Debe estar disponible
      if (!coach.isAvailable) {
        return false;
      }

      // Debe estar calificado
      if (!this.isQualifiedCoach(coach).isQualified) {
        return false;
      }

      // Debe poder aceptar sesiones
      if (!coach.canAcceptSession()) {
        return false;
      }

      // Si se especifica especialidad, debe tenerla
      if (specialty && !coach.specialties.includes(specialty)) {
        return false;
      }

      return true;
    });
  }
}
