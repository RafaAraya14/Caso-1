// src/business/useCases/SearchCoachUseCase.ts
import { Coach } from '../../models/Coach';
import { CoachRules } from '../rules/CoachRules';

/**
 * Use Case para buscar coaches disponibles
 */
export interface SearchCoachRequest {
  specialty?: string;
  minRating?: number;
  maxResults?: number;
  location?: string;
  availableNow?: boolean;
}

export interface SearchCoachResponse {
  success: boolean;
  coaches: Coach[];
  totalFound: number;
  searchCriteria: SearchCoachRequest;
  errorMessage?: string;
}

export class SearchCoachUseCase {
  /**
   * Ejecuta la búsqueda de coaches
   */
  static async execute(request: SearchCoachRequest): Promise<SearchCoachResponse> {
    try {
      // 1. Validar criterios de búsqueda
      const validation = this.validateSearchCriteria(request);
      if (!validation.isValid) {
        return {
          success: false,
          coaches: [],
          totalFound: 0,
          searchCriteria: request,
          errorMessage: validation.reason,
        };
      }

      // 2. Obtener todos los coaches (normalmente desde repositorio)
      const allCoaches = await this.getAllCoaches();

      // 3. Aplicar filtros usando reglas de negocio
      let filteredCoaches = CoachRules.filterAvailableCoaches(allCoaches, request.specialty);

      // 4. Aplicar filtros adicionales
      if (request.minRating) {
        filteredCoaches = filteredCoaches.filter(coach => coach.rating >= request.minRating!);
      }

      if (request.availableNow) {
        filteredCoaches = filteredCoaches.filter(coach => coach.isAvailable);
      }

      // 5. Ordenar por rating (mejor primero)
      filteredCoaches.sort((a, b) => b.rating - a.rating);

      // 6. Limitar resultados
      const maxResults = request.maxResults || 20;
      const limitedResults = filteredCoaches.slice(0, maxResults);

      // 7. Enriquecer con información adicional
      const enrichedCoaches = limitedResults.map(coach => this.enrichCoachData(coach));

      return {
        success: true,
        coaches: enrichedCoaches,
        totalFound: filteredCoaches.length,
        searchCriteria: request,
      };
    } catch (error) {
      return {
        success: false,
        coaches: [],
        totalFound: 0,
        searchCriteria: request,
        errorMessage: `Error en búsqueda: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Busca coaches por especialidad específica
   */
  static async findBySpecialty(specialty: string): Promise<Coach[]> {
    const request: SearchCoachRequest = {
      specialty,
      availableNow: true,
      maxResults: 10,
    };

    const response = await this.execute(request);
    return response.coaches;
  }

  /**
   * Busca los mejores coaches (por rating)
   */
  static async findTopRated(limit: number = 5): Promise<Coach[]> {
    const request: SearchCoachRequest = {
      minRating: 4.5,
      availableNow: true,
      maxResults: limit,
    };

    const response = await this.execute(request);
    return response.coaches;
  }

  /**
   * Valida los criterios de búsqueda
   */
  private static validateSearchCriteria(request: SearchCoachRequest): {
    isValid: boolean;
    reason?: string;
  } {
    if (request.minRating && (request.minRating < 0 || request.minRating > 5)) {
      return { isValid: false, reason: 'Rating mínimo debe estar entre 0 y 5' };
    }

    if (request.maxResults !== undefined && request.maxResults <= 0) {
      return { isValid: false, reason: 'Máximo de resultados debe ser mayor que 0' };
    }

    if (request.specialty && request.specialty.trim() === '') {
      return { isValid: false, reason: 'Especialidad no puede estar vacía' };
    }

    return { isValid: true };
  }

  /**
   * Simula obtener todos los coaches (en implementación real sería repositorio)
   */
  private static async getAllCoaches(): Promise<Coach[]> {
    // Simulación de datos - en implementación real vendría de base de datos
    return [
      new Coach('c1', 'Dr. Sarah Wilson', 4.8, ['Psychology', 'Stress Management'], true, 2),
      new Coach('c2', 'Mike Rodriguez', 4.5, ['Programming', 'Career Development'], true, 1),
      new Coach('c3', 'Anna Chen', 4.9, ['Art', 'Creative Writing'], true, 0),
      new Coach('c4', 'David Brown', 4.2, ['Fitness', 'Nutrition'], false, 5),
      new Coach('c5', 'Lisa Parker', 4.6, ['Law', 'Business'], true, 3),
      new Coach('c6', 'Carlos Silva', 3.8, ['Mechanics', 'DIY'], true, 4),
      new Coach('c7', 'Emma Davis', 4.7, ['Agriculture', 'Sustainability'], true, 1),
      new Coach('c8', 'Tom Johnson', 4.3, ['Cloud Services', 'DevOps'], true, 2),
    ];
  }

  /**
   * Enriquece los datos del coach con información adicional
   */
  private static enrichCoachData(coach: Coach): Coach {
    // Aquí se podrían agregar datos calculados como:
    // - Tier del coach
    // - Próxima disponibilidad
    // - Especialidades destacadas
    // - etc.

    const tier = CoachRules.getCoachTier(coach.rating);
    const earnings = CoachRules.calculateExpectedEarnings(coach, 8);

    // Por ahora solo agregamos la información como console.log para demostrar
    console.log(
      `Coach ${coach.name} - Tier: ${tier}, Expected daily earnings: $${earnings.totalEarnings}`
    );

    return coach;
  }

  /**
   * Obtiene estadísticas de la búsqueda
   */
  static async getSearchStats(): Promise<{
    totalCoaches: number;
    availableCoaches: number;
    topSpecialties: string[];
    averageRating: number;
  }> {
    const allCoaches = await this.getAllCoaches();
    const availableCoaches = allCoaches.filter(coach => coach.isAvailable);

    // Calcular especialidades más populares
    const specialtyCount: { [key: string]: number } = {};
    allCoaches.forEach(coach => {
      coach.specialties.forEach(specialty => {
        specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1;
      });
    });

    const topSpecialties = Object.entries(specialtyCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([specialty]) => specialty);

    // Calcular rating promedio
    const averageRating =
      allCoaches.reduce((sum, coach) => sum + coach.rating, 0) / allCoaches.length;

    return {
      totalCoaches: allCoaches.length,
      availableCoaches: availableCoaches.length,
      topSpecialties,
      averageRating: Math.round(averageRating * 100) / 100,
    };
  }
}
