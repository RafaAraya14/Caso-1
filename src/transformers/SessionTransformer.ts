// src/transformers/SessionTransformer.ts
import type { Coach } from '../models/Coach';
import type { User } from '../models/User';
import type {
  CreateSessionDTO,
  CreateSessionResponseDTO,
  SessionListItemDTO,
} from '../types/dtos/CreateSessionDTO';

/**
 * Transformador para sesiones
 * Convierte entre diferentes representaciones de datos de sesión
 */
export class SessionTransformer {
  /**
   * Convierte datos de solicitud y entidades a formato de API
   */
  static toApiCreateData(dto: CreateSessionDTO, user: User, coach: Coach): any {
    return {
      user_id: dto.userId,
      coach_id: dto.coachId,
      scheduled_time: dto.scheduledTime,
      specialty: dto.specialty,
      notes: dto.notes,
      duration: dto.preferredDuration || 20,
      status: 'pending',
      cost: this.calculateCost(user.role as 'BasicUser' | 'PremiumUser'),
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Convierte respuesta de API a CreateSessionResponseDTO
   */
  static fromApiCreateResponse(
    apiData: any,
    originalRequest: CreateSessionDTO
  ): CreateSessionResponseDTO {
    return {
      sessionId: apiData.id,
      userId: apiData.user_id,
      coachId: apiData.coach_id,
      scheduledTime: apiData.scheduled_time,
      status: apiData.status,
      cost: apiData.cost,
      duration: apiData.duration,
      meetingLink: this.generateMeetingLink(apiData.id),
      createdAt: apiData.created_at,
    };
  }

  /**
   * Convierte datos de API a SessionListItemDTO para listados
   */
  static toListItemDTO(sessionData: any, coachData?: any): SessionListItemDTO {
    return {
      sessionId: sessionData.id,
      coachName: coachData?.name || 'Coach Desconocido',
      coachSpecialties: coachData?.specialties || [],
      scheduledTime: sessionData.scheduled_time,
      status: sessionData.status,
      duration: sessionData.duration,
      cost: sessionData.cost,
    };
  }

  /**
   * Transforma múltiples sesiones de API a lista de DTOs
   */
  static toListItemDTOArray(
    sessionsData: any[],
    coachesData: { [coachId: string]: any }
  ): SessionListItemDTO[] {
    return sessionsData.map(session => {
      const coachData = coachesData[session.coach_id];
      return this.toListItemDTO(session, coachData);
    });
  }

  /**
   * Convierte CreateSessionDTO a formato para validación de negocio
   */
  static toBusinessValidationData(dto: CreateSessionDTO) {
    const scheduledDate = new Date(dto.scheduledTime);

    return {
      userId: dto.userId,
      coachId: dto.coachId,
      requestedHour: scheduledDate.getHours(),
      requestedMinute: scheduledDate.getMinutes(),
      specialty: dto.specialty,
      sessionDate: scheduledDate.toDateString(),
    };
  }

  /**
   * Transforma datos de sesión para notificaciones
   */
  static toNotificationData(
    sessionResponse: CreateSessionResponseDTO,
    coachName: string,
    userName: string
  ) {
    const scheduledDate = new Date(sessionResponse.scheduledTime);

    return {
      sessionId: sessionResponse.sessionId,
      coachNotification: {
        title: 'Nueva sesión reservada',
        body: `${userName} ha reservado una sesión contigo para ${scheduledDate.toLocaleString()}`,
        data: {
          sessionId: sessionResponse.sessionId,
          userId: sessionResponse.userId,
          scheduledTime: sessionResponse.scheduledTime,
        },
      },
      userNotification: {
        title: 'Sesión confirmada',
        body: `Tu sesión con ${coachName} está confirmada para ${scheduledDate.toLocaleString()}`,
        data: {
          sessionId: sessionResponse.sessionId,
          coachId: sessionResponse.coachId,
          meetingLink: sessionResponse.meetingLink,
        },
      },
    };
  }

  /**
   * Transforma datos para actualización de estadísticas
   */
  static toStatsUpdateData(sessionResponse: CreateSessionResponseDTO) {
    return {
      userId: sessionResponse.userId,
      coachId: sessionResponse.coachId,
      sessionCost: sessionResponse.cost,
      sessionDate: new Date(sessionResponse.scheduledTime).toDateString(),
      duration: sessionResponse.duration,
    };
  }

  /**
   * Convierte datos de sesión para reportes
   */
  static toReportData(sessions: SessionListItemDTO[]) {
    return sessions.map(session => ({
      sessionId: session.sessionId,
      date: new Date(session.scheduledTime).toDateString(),
      time: new Date(session.scheduledTime).toLocaleTimeString(),
      coachName: session.coachName,
      specialties: session.coachSpecialties.join(', '),
      status: session.status,
      duration: `${session.duration} min`,
      cost: `$${session.cost}`,
    }));
  }

  /**
   * Transforma filtros de búsqueda de sesiones
   */
  static transformSessionFilters(filters: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    coachId?: string;
    specialty?: string;
  }) {
    const apiFilters: any = {};

    if (filters.status) {
      apiFilters.status = filters.status;
    }

    if (filters.dateFrom) {
      apiFilters.scheduled_time = { gte: filters.dateFrom };
    }

    if (filters.dateTo) {
      apiFilters.scheduled_time = {
        ...apiFilters.scheduled_time,
        lte: filters.dateTo,
      };
    }

    if (filters.coachId) {
      apiFilters.coach_id = filters.coachId;
    }

    if (filters.specialty) {
      apiFilters.specialty = filters.specialty;
    }

    return apiFilters;
  }

  // Métodos auxiliares privados

  private static calculateCost(userType: 'BasicUser' | 'PremiumUser'): number {
    const baseCost = 20;
    const premiumDiscount = 0.25;

    return userType === 'PremiumUser' ? baseCost * (1 - premiumDiscount) : baseCost;
  }

  private static generateMeetingLink(sessionId: string): string {
    // En producción esto sería integración con Zoom/Teams/etc
    return `https://meet.20mincoach.com/session/${sessionId}`;
  }

  /**
   * Valida que los datos transformados sean consistentes
   */
  static validateTransformedData(original: CreateSessionDTO, transformed: any): boolean {
    return (
      transformed.user_id === original.userId &&
      transformed.coach_id === original.coachId &&
      transformed.scheduled_time === original.scheduledTime &&
      transformed.duration === (original.preferredDuration || 20)
    );
  }

  /**
   * Crea un resumen de transformación para logging
   */
  static createTransformationSummary(
    operation: string,
    inputType: string,
    outputType: string,
    recordCount: number = 1
  ) {
    return {
      operation,
      inputType,
      outputType,
      recordCount,
      timestamp: new Date().toISOString(),
    };
  }
}
