// src/listeners/CoachListener.ts
import { EventBus, EventTypes, type Event } from '../background/EventBus';
import { notificationService } from '../background/NotificationService';
import { logger } from '../logging';

/**
 * Listener para eventos de coaches en tiempo real
 * Maneja cambios de disponibilidad, ratings y estado de coaches
 */
export class CoachListener {
  private eventBus: EventBus;
  private listenerIds: string[] = [];
  private isActive = false;

  constructor() {
    this.eventBus = EventBus.getInstance();
  }

  /**
   * Inicia la escucha de eventos de coach
   */
  start(): void {
    if (this.isActive) {
      console.warn('[CoachListener] Already active');
      return;
    }

    this.setupCoachEventListeners();
    this.isActive = true;

    logger.info('[CoachListener] Started listening to coach events');
  }

  /**
   * Detiene la escucha de eventos
   */
  stop(): void {
    this.listenerIds.forEach(id => this.eventBus.unsubscribe(id));
    this.listenerIds = [];
    this.isActive = false;

    logger.info('[CoachListener] Stopped listening to coach events');
  }

  /**
   * Configura listeners para eventos de coach
   */
  private setupCoachEventListeners(): void {
    // Listener para coach disponible
    const availableId = this.eventBus.subscribe(
      EventTypes.COACH_AVAILABLE,
      this.handleCoachAvailable.bind(this)
    );
    this.listenerIds.push(availableId);

    // Listener para coach no disponible
    const unavailableId = this.eventBus.subscribe(
      EventTypes.COACH_UNAVAILABLE,
      this.handleCoachUnavailable.bind(this)
    );
    this.listenerIds.push(unavailableId);

    // Listener para actualización de rating
    const ratingUpdatedId = this.eventBus.subscribe(
      EventTypes.COACH_RATING_UPDATED,
      this.handleRatingUpdated.bind(this)
    );
    this.listenerIds.push(ratingUpdatedId);
  }

  /**
   * Maneja cuando un coach se pone disponible
   */
  private handleCoachAvailable(event: Event): void {
    const { coachId, coachName, specialties, location } = event.payload;

    logger.auth('CoachAvailable', 'Processing coach availability', {
      userId: coachId,
      metadata: { specialties, location },
    });

    // Tareas cuando coach se pone disponible:

    // 1. Notificar a usuarios suscritos
    this.notifySubscribedUsers(coachId, coachName, specialties);

    // 2. Actualizar cache de coaches disponibles
    this.updateAvailabilityCache(coachId, true);

    // 3. Trigger re-indexing para búsquedas
    this.triggerSearchReindex(coachId);

    // 4. Tracking de disponibilidad
    this.trackAvailabilityChange(coachId, 'available');

    console.log(`[CoachListener] Coach ${coachId} availability processed`);
  }

  /**
   * Maneja cuando un coach se pone no disponible
   */
  private handleCoachUnavailable(event: Event): void {
    const { coachId, reason } = event.payload;

    logger.auth('CoachUnavailable', 'Processing coach unavailability', {
      userId: coachId,
      metadata: { reason },
    });

    // Tareas cuando coach se pone no disponible:

    // 1. Actualizar cache de disponibilidad
    this.updateAvailabilityCache(coachId, false);

    // 2. Cancelar sesiones pendientes si es necesario
    if (reason === 'emergency') {
      this.handleEmergencyUnavailability(coachId);
    }

    // 3. Actualizar métricas de disponibilidad
    this.updateAvailabilityMetrics(coachId, 'unavailable');

    // 4. Trigger re-indexing para búsquedas
    this.triggerSearchReindex(coachId);

    console.log(`[CoachListener] Coach ${coachId} unavailability processed`);
  }

  /**
   * Maneja actualización de rating de coach
   */
  private handleRatingUpdated(event: Event): void {
    const { coachId, oldRating, newRating, reviewCount } = event.payload;

    logger.api('RatingUpdated', 'Processing rating update', {
      userId: coachId,
      metadata: { oldRating, newRating, reviewCount },
    });

    // Tareas para actualización de rating:

    // 1. Verificar cambios de tier
    this.checkTierChanges(coachId, oldRating, newRating);

    // 2. Actualizar posición en rankings
    this.updateRankingPosition(coachId, newRating);

    // 3. Recalcular elegibilidad para promociones
    this.updatePromotionEligibility(coachId, newRating);

    // 4. Notificar al coach sobre milestone
    this.checkRatingMilestones(coachId, newRating, reviewCount);

    console.log(`[CoachListener] Coach ${coachId} rating update processed`);
  }

  // Métodos auxiliares

  private async notifySubscribedUsers(
    coachId: string,
    coachName: string,
    specialties: string[]
  ): Promise<void> {
    // Obtener usuarios suscritos (simulado)
    const subscribedUsers = await this.getSubscribedUsers(coachId);

    subscribedUsers.forEach(userId => {
      notificationService.sendTemplatedNotification(
        userId,
        'coach_available',
        { coachName },
        { coachId }
      );
    });
  }

  private updateAvailabilityCache(coachId: string, isAvailable: boolean): void {
    // Simulación - en implementación real sería cache Redis/memoria
    console.log(`[CoachListener] Updating availability cache: ${coachId} = ${isAvailable}`);

    // Aquí se actualizaría el cache real
    // cache.set(`coach:${coachId}:available`, isAvailable, TTL);
  }

  private triggerSearchReindex(coachId: string): void {
    // Simulación - en implementación real sería trigger a Elasticsearch/Algolia
    console.log(`[CoachListener] Triggering search reindex for coach ${coachId}`);

    // Aquí se triggearía la reindexación real
    // searchService.reindexCoach(coachId);
  }

  private trackAvailabilityChange(coachId: string, status: string): void {
    // Analytics tracking
    console.log(`[CoachListener] Tracking availability change: ${coachId} -> ${status}`);

    // Aquí se enviarían eventos a analytics
    // analytics.track('coach_availability_changed', { coachId, status, timestamp });
  }

  private handleEmergencyUnavailability(coachId: string): void {
    console.log(`[CoachListener] Handling emergency unavailability for coach ${coachId}`);

    // 1. Obtener sesiones programadas para hoy
    const upcomingSessions = this.getUpcomingSessions(coachId);

    // 2. Cancelar y reembolsar automáticamente
    upcomingSessions.forEach(sessionId => {
      this.eventBus.publish(EventTypes.SESSION_CANCELLED, {
        sessionId,
        coachId,
        reason: 'coach_emergency',
        cancelledBy: 'system',
      });
    });

    // 3. Notificar a usuarios afectados
    this.notifyAffectedUsers(coachId, upcomingSessions);
  }

  private checkTierChanges(coachId: string, oldRating: number, newRating: number): void {
    const oldTier = this.calculateTier(oldRating);
    const newTier = this.calculateTier(newRating);

    if (oldTier !== newTier) {
      console.log(`[CoachListener] Tier change detected: ${coachId} ${oldTier} -> ${newTier}`);

      // Notificar al coach sobre cambio de tier
      notificationService.sendNotification(
        coachId,
        {
          title: '🏆 ¡Felicitaciones!',
          body: `Has alcanzado el tier ${newTier.toUpperCase()}`,
          priority: 'high',
        },
        { coachId }
      );

      // Actualizar benefits del tier
      this.updateTierBenefits(coachId, newTier);
    }
  }

  private updateRankingPosition(coachId: string, newRating: number): void {
    // Simulación - en implementación real sería actualización de rankings
    console.log(
      `[CoachListener] Updating ranking position for coach ${coachId} with rating ${newRating}`
    );
  }

  private updatePromotionEligibility(coachId: string, newRating: number): void {
    // Verificar elegibilidad para promociones especiales
    if (newRating >= 4.8) {
      console.log(`[CoachListener] Coach ${coachId} now eligible for premium promotions`);
    }
  }

  private checkRatingMilestones(coachId: string, newRating: number, reviewCount: number): void {
    // Milestones de rating
    const milestones = [4.0, 4.5, 4.8, 5.0];
    const reachedMilestone = milestones.find(
      milestone => newRating >= milestone && newRating - 0.1 < milestone
    );

    if (reachedMilestone) {
      notificationService.sendNotification(
        coachId,
        {
          title: `⭐ Milestone alcanzado: ${reachedMilestone} estrellas`,
          body: `¡Excelente trabajo! Tienes ${reviewCount} reseñas`,
          priority: 'normal',
        },
        { coachId }
      );
    }
  }

  private calculateTier(rating: number): string {
    if (rating >= 4.8) {
      return 'platinum';
    }
    if (rating >= 4.5) {
      return 'gold';
    }
    if (rating >= 4.0) {
      return 'silver';
    }
    return 'bronze';
  }

  private updateTierBenefits(coachId: string, tier: string): void {
    // Simulación - en implementación real sería actualización de benefits
    console.log(`[CoachListener] Updating benefits for coach ${coachId} to tier ${tier}`);
  }

  private async getSubscribedUsers(coachId: string): Promise<string[]> {
    // Simulación - en implementación real sería query a base de datos
    return ['user1', 'user2', 'user3'];
  }

  private getUpcomingSessions(coachId: string): string[] {
    // Simulación - en implementación real sería query a base de datos
    return ['session1', 'session2'];
  }

  private notifyAffectedUsers(coachId: string, sessionIds: string[]): void {
    sessionIds.forEach(sessionId => {
      // Simulación - obtener userId del sessionId
      const userId = `user_${sessionId}`;

      notificationService.sendNotification(
        userId,
        {
          title: '❌ Sesión cancelada por emergencia',
          body: 'Tu coach tuvo una emergencia. Reembolso automático procesado.',
          priority: 'urgent',
        },
        { sessionId, coachId }
      );
    });
  }

  private updateAvailabilityMetrics(coachId: string, status: string): void {
    // Analytics tracking
    console.log(`[CoachListener] Updating availability metrics: ${coachId} -> ${status}`);
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
        .filter(event => event.type.startsWith('coach:')).length,
    };
  }
}

// Export default instance
export const coachListener = new CoachListener();
