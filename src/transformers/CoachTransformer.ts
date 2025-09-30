// src/transformers/CoachTransformer.ts
import { CoachRules } from '../business/rules/CoachRules';
import { Coach } from '../models/Coach';

import type { CoachSummaryDTO, CoachDetailDTO } from '../types/dtos/SearchCoachDTO';

/**
 * Transformador para convertir entre modelos Coach y DTOs
 * Implementa patrón Mapper para separar concerns entre capas
 */
export class CoachTransformer {
  /**
   * Convierte un modelo Coach a CoachSummaryDTO para listados
   */
  static toSummaryDTO(coach: Coach): CoachSummaryDTO {
    const tier = CoachRules.getCoachTier(coach.rating);
    const basePrice = CoachRules.calculateExpectedEarnings(coach, 1).totalEarnings;

    return {
      id: coach.id,
      name: coach.name,
      rating: Math.round(coach.rating * 10) / 10, // Redondear a 1 decimal
      reviewCount: this.estimateReviewCount(coach.rating), // Simulado
      specialties: [...coach.specialties], // Copia para evitar mutación
      isAvailable: coach.isAvailable,
      nextAvailableSlot: this.getNextAvailableSlot(coach),
      tier,
      basePrice: Math.round(basePrice),
      location: this.getCoachLocation(coach), // Simulado
      profileImageUrl: this.getProfileImageUrl(coach.id),
      shortBio: this.generateShortBio(coach),
    };
  }

  /**
   * Convierte un modelo Coach a CoachDetailDTO para perfil completo
   */
  static toDetailDTO(coach: Coach): CoachDetailDTO {
    const summaryData = this.toSummaryDTO(coach);
    const tierMultiplier = CoachRules.getTierMultiplier(summaryData.tier);

    return {
      ...summaryData,
      email: this.generateEmail(coach.name), // En prod vendría de BD
      fullBio: this.generateFullBio(coach),
      experience: this.generateExperience(coach.rating),
      certifications: this.generateCertifications(coach.specialties),
      languages: ['Spanish', 'English'], // Simulado
      sessionCount: this.estimateSessionCount(coach.rating),
      joinedDate: this.generateJoinDate(coach.id),
      availability: {
        timeSlots: this.generateTimeSlots(),
        timezone: 'America/Bogota',
      },
      pricing: {
        baseRate: 25,
        tierMultiplier,
        specialtyRates: this.generateSpecialtyRates(coach.specialties),
      },
      stats: {
        totalSessions: this.estimateSessionCount(coach.rating),
        averageRating: coach.rating,
        completionRate: this.calculateCompletionRate(coach.rating),
        responseTime: this.estimateResponseTime(summaryData.tier),
      },
    };
  }

  /**
   * Convierte datos de API (Supabase) a modelo Coach
   */
  static fromApiData(apiData: any): Coach {
    return new Coach(
      apiData.id?.toString() || '0',
      apiData.name || 'Unknown Coach',
      apiData.rating || 0,
      apiData.specialties || [],
      apiData.is_available || false,
      apiData.sessions_today || 0
    );
  }

  /**
   * Convierte un array de datos de API a modelos Coach
   */
  static fromApiDataArray(apiDataArray: any[]): Coach[] {
    return apiDataArray.map(data => this.fromApiData(data));
  }

  /**
   * Convierte modelo Coach a formato de API para actualización
   */
  static toApiUpdateData(coach: Coach): any {
    return {
      name: coach.name,
      rating: coach.rating,
      specialties: coach.specialties,
      is_available: coach.isAvailable,
      sessions_today: coach['sessionsToday'] || 0, // Acceso privado simulado
    };
  }

  /**
   * Filtra coaches basado en criterios de búsqueda
   */
  static filterBySearchCriteria(
    coaches: Coach[],
    specialty?: string,
    minRating?: number,
    availableOnly?: boolean
  ): Coach[] {
    return coaches.filter(coach => {
      // Filtro por especialidad
      if (specialty && !coach.specialties.includes(specialty)) {
        return false;
      }

      // Filtro por rating mínimo
      if (minRating && coach.rating < minRating) {
        return false;
      }

      // Filtro por disponibilidad
      if (availableOnly && !coach.isAvailable) {
        return false;
      }

      // Aplicar reglas de negocio
      const qualificationCheck = CoachRules.isQualifiedCoach(coach);
      if (!qualificationCheck.isQualified) {
        return false;
      }

      return true;
    });
  }

  // Métodos privados para generar datos simulados
  private static estimateReviewCount(rating: number): number {
    // Estimación basada en el rating
    return Math.floor(rating * 50 + Math.random() * 20);
  }

  private static getNextAvailableSlot(coach: Coach): string | undefined {
    if (!coach.isAvailable) {
      return undefined;
    }

    const now = new Date();
    const nextSlot = new Date(now.getTime() + 30 * 60 * 1000); // +30 minutos
    return nextSlot.toISOString();
  }

  private static getCoachLocation(coach: Coach): string {
    // Simulado - en producción vendría de base de datos
    const locations = [
      'Bogotá, Colombia',
      'Medellín, Colombia',
      'Cali, Colombia',
      'Barranquilla, Colombia',
    ];
    return locations[coach.id.length % locations.length];
  }

  private static getProfileImageUrl(coachId: string): string {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${coachId}`;
  }

  private static generateShortBio(coach: Coach): string {
    const specialtyText = coach.specialties[0] || 'diversos temas';
    return `Experto en ${specialtyText} con ${coach.rating} estrellas de calificación.`;
  }

  private static generateEmail(name: string): string {
    const normalized = name.toLowerCase().replace(/\s+/g, '.');
    return `${normalized}@20mincoach.com`;
  }

  private static generateFullBio(coach: Coach): string {
    return `${coach.name} es un profesional experimentado especializado en ${coach.specialties.join(', ')}. Con una calificación de ${coach.rating} estrellas, ha ayudado a numerosos clientes a alcanzar sus objetivos a través de sesiones personalizadas de 20 minutos.`;
  }

  private static generateExperience(rating: number): string {
    const years = Math.floor(rating - 2); // 3.5 rating = ~1.5 años
    return `${years}+ años de experiencia profesional`;
  }

  private static generateCertifications(specialties: string[]): string[] {
    const certMap: { [key: string]: string } = {
      Psychology: 'Certificación en Psicología Clínica',
      Programming: 'AWS Certified Developer',
      Art: 'Licenciatura en Bellas Artes',
      Fitness: 'Certificación Personal Trainer',
      Law: 'Licenciado en Derecho',
      Business: 'MBA en Administración',
    };

    return specialties.map(s => certMap[s] || `Certificación en ${s}`);
  }

  private static estimateSessionCount(rating: number): number {
    return Math.floor(rating * 100 + Math.random() * 50);
  }

  private static generateJoinDate(coachId: string): string {
    // Fecha aleatoria basada en ID
    const monthsAgo = (parseInt(coachId.slice(-1)) || 1) * 3;
    const joinDate = new Date();
    joinDate.setMonth(joinDate.getMonth() - monthsAgo);
    return joinDate.toISOString();
  }

  private static generateTimeSlots() {
    return [
      { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' }, // Lunes
      { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' }, // Martes
      { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' }, // Miércoles
      { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' }, // Jueves
      { dayOfWeek: 5, startTime: '08:00', endTime: '16:00' }, // Viernes
    ];
  }

  private static generateSpecialtyRates(specialties: string[]): { [specialty: string]: number } {
    const rates: { [key: string]: number } = {};
    specialties.forEach(specialty => {
      rates[specialty] = 25 + Math.floor(Math.random() * 10); // $25-35
    });
    return rates;
  }

  private static calculateCompletionRate(rating: number): number {
    // Rate más alto = mayor completion rate
    return Math.min(95, Math.floor(rating * 20 + 10));
  }

  private static estimateResponseTime(tier: string): number {
    const timeMap = {
      platinum: 2,
      gold: 5,
      silver: 10,
      bronze: 15,
    };
    return timeMap[tier as keyof typeof timeMap] || 10;
  }
}
