// src/business/useCases/BookSessionUseCase.ts
import { Coach } from '../../models/Coach';
import { User } from '../../models/User';
import { SessionRules } from '../rules/SessionRules';

/**
 * Use Case para reservar una sesión
 * Implementa Clean Architecture patterns
 */
export interface BookSessionRequest {
  userId: string;
  coachId: string;
  requestedHour: number;
  specialty?: string;
}

export interface BookSessionResponse {
  success: boolean;
  sessionId?: string;
  cost?: number;
  scheduledTime?: Date;
  errorMessage?: string;
}

export class BookSessionUseCase {
  /**
   * Ejecuta el caso de uso de reservar una sesión
   */
  static async execute(request: BookSessionRequest): Promise<BookSessionResponse> {
    try {
      // 1. Validar entrada
      const validation = this.validateRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          errorMessage: validation.reason,
        };
      }

      // 2. Obtener entidades (normalmente desde repositorios)
      // Por ahora simulamos la obtención de datos
      const user = await this.getUserById(request.userId);
      const coach = await this.getCoachById(request.coachId);

      if (!user || !coach) {
        return {
          success: false,
          errorMessage: 'Usuario o coach no encontrado',
        };
      }

      // 3. Aplicar reglas de negocio
      const sessionValidation = SessionRules.validateSessionCreation(
        user,
        coach,
        request.requestedHour
      );

      if (!sessionValidation.isValid) {
        return {
          success: false,
          errorMessage: sessionValidation.reason,
        };
      }

      // 4. Calcular costo
      const cost = SessionRules.calculateSessionCost(user.role as 'BasicUser' | 'PremiumUser');

      // 5. Crear la sesión (normalmente a través de repositorio)
      const sessionId = await this.createSession(request, cost);

      // 6. Actualizar créditos del usuario
      await this.updateUserCredits(request.userId);

      // 7. Notificar al coach
      await this.notifyCoach(request.coachId, sessionId);

      const scheduledTime = new Date();
      scheduledTime.setHours(request.requestedHour, 0, 0, 0);

      return {
        success: true,
        sessionId,
        cost,
        scheduledTime,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: `Error interno: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Valida la solicitud de entrada
   */
  private static validateRequest(request: BookSessionRequest): {
    isValid: boolean;
    reason?: string;
  } {
    if (!request.userId || request.userId.trim() === '') {
      return { isValid: false, reason: 'ID de usuario requerido' };
    }

    if (!request.coachId || request.coachId.trim() === '') {
      return { isValid: false, reason: 'ID de coach requerido' };
    }

    if (request.requestedHour < 0 || request.requestedHour > 23) {
      return { isValid: false, reason: 'Hora inválida' };
    }

    return { isValid: true };
  }

  /**
   * Simula obtener usuario por ID (en implementación real sería un repositorio)
   */
  private static async getUserById(userId: string): Promise<User | null> {
    // Simulación - en implementación real sería una llamada al repositorio
    return new User(userId, 'user@example.com', 'Test User', 'BasicUser', true, 5);
  }

  /**
   * Simula obtener coach por ID
   */
  private static async getCoachById(coachId: string): Promise<Coach | null> {
    // Simulación - en implementación real sería una llamada al repositorio
    return new Coach(coachId, 'Coach Test', 4.5, ['Programming', 'Career'], true, 3);
  }

  /**
   * Simula crear una sesión
   */
  private static async createSession(request: BookSessionRequest, cost: number): Promise<string> {
    // Simulación - en implementación real sería persistencia
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Aquí iría la lógica de persistencia real
    console.log(
      `Creating session: ${sessionId} for user ${request.userId} with coach ${request.coachId}`
    );

    return sessionId;
  }

  /**
   * Simula actualizar créditos del usuario
   */
  private static async updateUserCredits(userId: string): Promise<void> {
    // Simulación - en implementación real sería actualización en base de datos
    console.log(`Updating credits for user: ${userId}`);
  }

  /**
   * Simula notificar al coach
   */
  private static async notifyCoach(coachId: string, sessionId: string): Promise<void> {
    // Simulación - en implementación real sería notificación push/email
    console.log(`Notifying coach ${coachId} about new session: ${sessionId}`);
  }
}
