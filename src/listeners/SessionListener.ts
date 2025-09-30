// src/listeners/SessionListener.ts
import { EventBus, EventTypes, type Event } from '../background/EventBus';
import { notificationService } from '../background/NotificationService';
import { logger } from '../logging';

/**
 * Listener para eventos de sesión en tiempo real
 * Implementa patrón Observer para reaccionar a cambios de estado de sesiones
 */
export class SessionListener {
  private eventBus: EventBus;
  private listenerIds: string[] = [];
  private isActive = false;

  constructor() {
    this.eventBus = EventBus.getInstance();
  }

  /**
   * Inicia la escucha de eventos de sesión
   */
  start(): void {
    if (this.isActive) {
      console.warn('[SessionListener] Already active');
      return;
    }

    this.setupSessionEventListeners();
    this.isActive = true;

    logger.info('[SessionListener] Started listening to session events');
  }

  /**
   * Detiene la escucha de eventos
   */
  stop(): void {
    this.listenerIds.forEach(id => this.eventBus.unsubscribe(id));
    this.listenerIds = [];
    this.isActive = false;

    logger.info('[SessionListener] Stopped listening to session events');
  }

  /**
   * Configura todos los listeners de eventos de sesión
   */
  private setupSessionEventListeners(): void {
    // Listener para sesiones creadas
    const sessionCreatedId = this.eventBus.subscribe(
      EventTypes.SESSION_CREATED,
      this.handleSessionCreated.bind(this)
    );
    this.listenerIds.push(sessionCreatedId);

    // Listener para sesiones iniciadas
    const sessionStartedId = this.eventBus.subscribe(
      EventTypes.SESSION_STARTED,
      this.handleSessionStarted.bind(this)
    );
    this.listenerIds.push(sessionStartedId);

    // Listener para sesiones terminadas
    const sessionEndedId = this.eventBus.subscribe(
      EventTypes.SESSION_ENDED,
      this.handleSessionEnded.bind(this)
    );
    this.listenerIds.push(sessionEndedId);

    // Listener para sesiones canceladas
    const sessionCancelledId = this.eventBus.subscribe(
      EventTypes.SESSION_CANCELLED,
      this.handleSessionCancelled.bind(this)
    );
    this.listenerIds.push(sessionCancelledId);
  }

  /**
   * Maneja evento de sesión creada
   */
  private handleSessionCreated(event: Event): void {
    const { sessionId, userId, coachId, scheduledTime, cost } = event.payload;

    logger.session('SessionCreated', 'Processing session creation', {
      sessionId,
      userId,
      metadata: { coachId, scheduledTime, cost },
    });

    // Tareas a realizar cuando se crea una sesión:

    // 1. Programar recordatorios
    this.scheduleSessionReminders(sessionId, userId, coachId, scheduledTime);

    // 2. Actualizar estadísticas del coach
    this.updateCoachStats(coachId, 'session_booked');

    // 3. Actualizar créditos del usuario
    this.updateUserCredits(userId, cost);

    // 4. Crear entrada en analytics
    this.trackSessionCreation(sessionId, userId, coachId);

    console.log(`[SessionListener] Session ${sessionId} creation processed`);
  }

  /**
   * Maneja evento de sesión iniciada
   */
  private handleSessionStarted(event: Event): void {
    const { sessionId, userId, coachId, meetingLink } = event.payload;

    logger.session('SessionStarted', 'Processing session start', {
      sessionId,
      userId,
      metadata: { coachId },
    });

    // Tareas para sesión iniciada:

    // 1. Iniciar timer de 20 minutos
    this.startSessionTimer(sessionId, userId, coachId);

    // 2. Actualizar estado del coach a "en sesión"
    this.updateCoachStatus(coachId, 'in_session');

    // 3. Tracking de sesión activa
    this.trackActiveSession(sessionId, userId, coachId);

    console.log(`[SessionListener] Session ${sessionId} start processed`);
  }

  /**
   * Maneja evento de sesión terminada
   */
  private handleSessionEnded(event: Event): void {
    const { sessionId, userId, coachId, duration, rating } = event.payload;

    logger.session('SessionEnded', 'Processing session completion', {
      sessionId,
      userId,
      metadata: { coachId, duration, rating },
    });

    // Tareas para sesión terminada:

    // 1. Actualizar estadísticas del coach
    this.updateCoachStats(coachId, 'session_completed', { duration, rating });

    // 2. Procesar pago al coach
    this.processCoachPayment(coachId, sessionId);

    // 3. Solicitar feedback si no se ha dado
    if (!rating) {
      this.requestUserFeedback(userId, sessionId, coachId);
    }

    // 4. Actualizar estado del coach a disponible
    this.updateCoachStatus(coachId, 'available');

    console.log(`[SessionListener] Session ${sessionId} completion processed`);
  }

  /**
   * Maneja evento de sesión cancelada
   */
  private handleSessionCancelled(event: Event): void {
    const { sessionId, userId, coachId, reason, cancelledBy } = event.payload;

    logger.session('SessionCancelled', 'Processing session cancellation', {
      sessionId,
      userId,
      metadata: { coachId, reason, cancelledBy },
    });

    // Tareas para sesión cancelada:

    // 1. Reembolsar créditos al usuario si aplica
    this.processRefund(userId, sessionId, cancelledBy);

    // 2. Liberar slot del coach
    this.updateCoachStatus(coachId, 'available');

    // 3. Cancelar recordatorios programados
    this.cancelSessionReminders(sessionId);

    // 4. Tracking de cancelación
    this.trackSessionCancellation(sessionId, reason, cancelledBy);

    console.log(`[SessionListener] Session ${sessionId} cancellation processed`);
  }

  // Métodos auxiliares para tareas específicas

  private scheduleSessionReminders(
    sessionId: string,
    userId: string,
    coachId: string,
    scheduledTime: string
  ): void {
    const sessionDate = new Date(scheduledTime);
    const now = new Date();

    // Recordatorio 1 hora antes
    const oneHourBefore = new Date(sessionDate.getTime() - 60 * 60 * 1000);
    if (oneHourBefore > now) {
      const delay = oneHourBefore.getTime() - now.getTime();
      notificationService.scheduleNotification(
        userId,
        {
          title: '⏰ Recordatorio de sesión',
          body: 'Tu sesión comienza en 1 hora',
          priority: 'high',
        },
        delay,
        { sessionId, coachId }
      );
    }

    // Recordatorio 5 minutos antes
    const fiveMinutesBefore = new Date(sessionDate.getTime() - 5 * 60 * 1000);
    if (fiveMinutesBefore > now) {
      const delay = fiveMinutesBefore.getTime() - now.getTime();
      notificationService.scheduleNotification(
        userId,
        {
          title: '🚀 Tu sesión está por comenzar',
          body: 'Faltan 5 minutos para tu sesión',
          priority: 'urgent',
        },
        delay,
        { sessionId, coachId }
      );
    }
  }

  private startSessionTimer(sessionId: string, userId: string, coachId: string): void {
    // Timer de 20 minutos para auto-finalizar sesión
    setTimeout(
      () => {
        this.eventBus.publish(EventTypes.SESSION_ENDED, {
          sessionId,
          userId,
          coachId,
          duration: 20,
          autoEnded: true,
        });
      },
      20 * 60 * 1000
    ); // 20 minutos
  }

  private updateCoachStats(
    coachId: string,
    action: string,
    data?: { duration?: number; rating?: number }
  ): void {
    // Simulación - en implementación real sería llamada a API
    console.log(`[SessionListener] Updating coach ${coachId} stats: ${action}`, data);

    // Aquí se haría la actualización real de estadísticas
    // Por ejemplo: incrementar sessionsToday, actualizar rating promedio, etc.
  }

  private updateUserCredits(userId: string, cost: number): void {
    // Simulación - en implementación real sería actualización en base de datos
    console.log(`[SessionListener] Deducting ${cost} credits from user ${userId}`);
  }

  private updateCoachStatus(coachId: string, status: string): void {
    // Simulación - en implementación real sería actualización en base de datos
    console.log(`[SessionListener] Updating coach ${coachId} status to: ${status}`);
  }

  private processCoachPayment(coachId: string, sessionId: string): void {
    // Simulación - en implementación real sería procesamiento de pago
    console.log(`[SessionListener] Processing payment for coach ${coachId}, session ${sessionId}`);
  }

  private processRefund(userId: string, sessionId: string, cancelledBy: string): void {
    // Solo reembolsar si cancela el coach o es error del sistema
    if (cancelledBy === 'coach' || cancelledBy === 'system') {
      console.log(`[SessionListener] Processing refund for user ${userId}, session ${sessionId}`);
    }
  }

  private requestUserFeedback(userId: string, sessionId: string, coachId: string): void {
    // Programar solicitud de feedback 5 minutos después de la sesión
    setTimeout(
      () => {
        notificationService.sendNotification(
          userId,
          {
            title: '⭐ ¿Cómo fue tu sesión?',
            body: 'Ayúdanos calificando tu experiencia',
            priority: 'normal',
            url: `/feedback/${sessionId}`,
          },
          { sessionId, coachId }
        );
      },
      5 * 60 * 1000
    ); // 5 minutos
  }

  private cancelSessionReminders(sessionId: string): void {
    // En implementación real, se cancelarían los timeouts programados
    console.log(`[SessionListener] Cancelling reminders for session ${sessionId}`);
  }

  private trackSessionCreation(sessionId: string, _userId: string, _coachId: string): void {
    // Analytics tracking
    console.log(`[SessionListener] Tracking session creation: ${sessionId}`);
  }

  private trackActiveSession(sessionId: string, _userId: string, _coachId: string): void {
    // Analytics tracking
    console.log(`[SessionListener] Tracking active session: ${sessionId}`);
  }

  private trackSessionCancellation(sessionId: string, reason: string, _cancelledBy: string): void {
    // Analytics tracking
    console.log(`[SessionListener] Tracking cancellation: ${sessionId}, reason: ${reason}`);
  }

  /**
   * Obtiene estadísticas del listener
   */
  getStats(): {
    isActive: boolean;
    listenersCount: number;
    eventsProcessed: number;
  } {
    return {
      isActive: this.isActive,
      listenersCount: this.listenerIds.length,
      eventsProcessed: this.eventBus
        .getEventHistory()
        .filter(event => event.type.startsWith('session:')).length,
    };
  }
}

// Export default instance
export const sessionListener = new SessionListener();
