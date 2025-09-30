// src/background/EventBus.ts
/**
 * Event Bus implementation using Pub/Sub pattern
 * Singleton pattern para manejar eventos globales de la aplicación
 */

export interface Event<T = any> {
  type: string;
  payload: T;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface EventListener<T = any> {
  id: string;
  eventType: string;
  callback: (event: Event<T>) => void;
  once?: boolean;
}

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, EventListener[]> = new Map();
  private eventHistory: Event[] = [];
  private maxHistorySize = 100;

  private constructor() {
    // Private constructor para Singleton
  }

  /**
   * Obtiene la instancia única del EventBus (Singleton pattern)
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Suscribe un listener a un tipo de evento específico
   */
  subscribe<T>(
    eventType: string,
    callback: (event: Event<T>) => void,
    options: { once?: boolean; listenerId?: string } = {}
  ): string {
    const listenerId =
      options.listenerId || `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const listener: EventListener<T> = {
      id: listenerId,
      eventType,
      callback: callback as (event: Event) => void,
      once: options.once || false,
    };

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    this.listeners.get(eventType)!.push(listener);

    console.log(`[EventBus] Listener ${listenerId} subscribed to ${eventType}`);
    return listenerId;
  }

  /**
   * Desuscribe un listener específico
   */
  unsubscribe(listenerId: string): boolean {
    for (const [eventType, listeners] of this.listeners.entries()) {
      const index = listeners.findIndex(listener => listener.id === listenerId);
      if (index !== -1) {
        listeners.splice(index, 1);
        console.log(`[EventBus] Listener ${listenerId} unsubscribed from ${eventType}`);

        // Limpiar array vacío
        if (listeners.length === 0) {
          this.listeners.delete(eventType);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Publica un evento a todos los listeners suscritos
   */
  publish<T>(
    eventType: string,
    payload: T,
    metadata: { userId?: string; sessionId?: string } = {}
  ): void {
    const event: Event<T> = {
      type: eventType,
      payload,
      timestamp: new Date(),
      userId: metadata.userId,
      sessionId: metadata.sessionId,
    };

    // Agregar a historial
    this.addToHistory(event);

    // Obtener listeners para este tipo de evento
    const listeners = this.listeners.get(eventType) || [];

    console.log(`[EventBus] Publishing ${eventType} to ${listeners.length} listeners`);

    // Notificar a todos los listeners
    const listenersToRemove: string[] = [];

    listeners.forEach(listener => {
      try {
        listener.callback(event);

        // Si es un listener de una sola vez, marcarlo para eliminación
        if (listener.once) {
          listenersToRemove.push(listener.id);
        }
      } catch (error) {
        console.error(`[EventBus] Error in listener ${listener.id}:`, error);
      }
    });

    // Remover listeners de una sola vez
    listenersToRemove.forEach(listenerId => this.unsubscribe(listenerId));
  }

  /**
   * Suscripción de una sola vez (se desuscribe automáticamente después del primer evento)
   */
  once<T>(eventType: string, callback: (event: Event<T>) => void): string {
    return this.subscribe(eventType, callback, { once: true });
  }

  /**
   * Obtiene todos los listeners activos
   */
  getActiveListeners(): { [eventType: string]: number } {
    const result: { [eventType: string]: number } = {};

    for (const [eventType, listeners] of this.listeners.entries()) {
      result[eventType] = listeners.length;
    }

    return result;
  }

  /**
   * Obtiene el historial de eventos recientes
   */
  getEventHistory(eventType?: string, limit?: number): Event[] {
    let filteredHistory = eventType
      ? this.eventHistory.filter(event => event.type === eventType)
      : this.eventHistory;

    if (limit) {
      filteredHistory = filteredHistory.slice(-limit);
    }

    return filteredHistory;
  }

  /**
   * Limpia todos los listeners
   */
  clearAllListeners(): void {
    this.listeners.clear();
    console.log('[EventBus] All listeners cleared');
  }

  /**
   * Limpia el historial de eventos
   */
  clearHistory(): void {
    this.eventHistory = [];
    console.log('[EventBus] Event history cleared');
  }

  /**
   * Obtiene estadísticas del EventBus
   */
  getStats(): {
    totalListeners: number;
    eventTypes: string[];
    historySize: number;
    mostActiveEventType: string | null;
  } {
    const totalListeners = Array.from(this.listeners.values()).reduce(
      (sum, listeners) => sum + listeners.length,
      0
    );

    const eventTypes = Array.from(this.listeners.keys());

    const eventTypeCounts: { [type: string]: number } = {};
    this.eventHistory.forEach(event => {
      eventTypeCounts[event.type] = (eventTypeCounts[event.type] || 0) + 1;
    });

    const mostActiveEventType =
      Object.entries(eventTypeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    return {
      totalListeners,
      eventTypes,
      historySize: this.eventHistory.length,
      mostActiveEventType,
    };
  }

  private addToHistory(event: Event): void {
    this.eventHistory.push(event);

    // Mantener el tamaño del historial bajo control
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }
}

// Tipos de eventos predefinidos para 20minCoach
export const EventTypes = {
  // Eventos de sesión
  SESSION_CREATED: 'session:created',
  SESSION_STARTED: 'session:started',
  SESSION_ENDED: 'session:ended',
  SESSION_CANCELLED: 'session:cancelled',

  // Eventos de coach
  COACH_AVAILABLE: 'coach:available',
  COACH_UNAVAILABLE: 'coach:unavailable',
  COACH_RATING_UPDATED: 'coach:rating:updated',

  // Eventos de usuario
  USER_LOGGED_IN: 'user:logged:in',
  USER_LOGGED_OUT: 'user:logged:out',
  USER_CREDITS_UPDATED: 'user:credits:updated',

  // Eventos de notificación
  NOTIFICATION_SENT: 'notification:sent',
  NOTIFICATION_READ: 'notification:read',

  // Eventos de sistema
  SYSTEM_MAINTENANCE: 'system:maintenance',
  SYSTEM_ERROR: 'system:error',
} as const;

// Export default instance for convenience
export const eventBus = EventBus.getInstance();
