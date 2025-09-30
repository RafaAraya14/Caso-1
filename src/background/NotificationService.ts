// src/background/NotificationService.ts
import { EventBus, EventTypes, type Event } from './EventBus';

/**
 * Servicio de notificaciones usando patrón Observer y Singleton
 * Maneja notificaciones en tiempo real para coaches y usuarios
 */

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  actions?: NotificationAction[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  persistant?: boolean;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationTemplate {
  id: string;
  title: string;
  body: string;
  variables: string[];
  priority: NotificationPayload['priority'];
}

export class NotificationService {
  private static instance: NotificationService;
  private eventBus: EventBus;
  private permission: NotificationPermission = 'default';
  private templates: Map<string, NotificationTemplate> = new Map();

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.initializeTemplates();
    this.setupEventListeners();
    this.requestPermission();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Envía una notificación inmediata
   */
  async sendNotification(
    userId: string,
    payload: NotificationPayload,
    metadata: { sessionId?: string; coachId?: string } = {}
  ): Promise<boolean> {
    try {
      // Verificar permisos
      if (this.permission !== 'granted') {
        console.warn('[NotificationService] Permission not granted');
        return false;
      }

      // Crear notificación del navegador
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: `user-${userId}-${Date.now()}`,
        requireInteraction: payload.persistant || false,
        silent: payload.priority === 'low',
      });

      // Configurar eventos de la notificación
      notification.onclick = () => {
        if (payload.url) {
          window.open(payload.url, '_blank');
        }
        notification.close();
      };

      // Auto-cerrar notificaciones no persistentes
      if (!payload.persistant) {
        setTimeout(() => notification.close(), 5000);
      }

      // Emitir evento de notificación enviada
      this.eventBus.publish(EventTypes.NOTIFICATION_SENT, {
        userId,
        payload,
        metadata,
        timestamp: new Date(),
      });

      console.log(`[NotificationService] Notification sent to user ${userId}`);
      return true;
    } catch (error) {
      console.error('[NotificationService] Error sending notification:', error);
      return false;
    }
  }

  /**
   * Envía notificación usando una plantilla predefinida
   */
  async sendTemplatedNotification(
    userId: string,
    templateId: string,
    variables: { [key: string]: string },
    metadata: { sessionId?: string; coachId?: string } = {}
  ): Promise<boolean> {
    const template = this.templates.get(templateId);

    if (!template) {
      console.error(`[NotificationService] Template ${templateId} not found`);
      return false;
    }

    // Reemplazar variables en la plantilla
    let { title } = template;
    let { body } = template;

    template.variables.forEach(variable => {
      const value = variables[variable] || `{${variable}}`;
      title = title.replace(new RegExp(`\\{${variable}\\}`, 'g'), value);
      body = body.replace(new RegExp(`\\{${variable}\\}`, 'g'), value);
    });

    const payload: NotificationPayload = {
      title,
      body,
      priority: template.priority,
    };

    return this.sendNotification(userId, payload, metadata);
  }

  /**
   * Configura listeners para eventos automáticos de notificación
   */
  private setupEventListeners(): void {
    // Notificar cuando se crea una sesión
    this.eventBus.subscribe(EventTypes.SESSION_CREATED, (event: Event) => {
      const { coachId, userId, sessionId } = event.payload;

      // Notificar al coach
      this.sendTemplatedNotification(
        coachId,
        'session_booked_coach',
        { sessionId },
        { sessionId, coachId }
      );

      // Notificar al usuario
      this.sendTemplatedNotification(
        userId,
        'session_confirmed_user',
        { sessionId },
        { sessionId, coachId }
      );
    });

    // Notificar cuando comienza una sesión
    this.eventBus.subscribe(EventTypes.SESSION_STARTED, (event: Event) => {
      const { coachId, userId, meetingLink } = event.payload;

      this.sendTemplatedNotification(
        userId,
        'session_starting',
        { meetingLink },
        { sessionId: event.sessionId, coachId }
      );
    });

    // Notificar cuando un coach se pone disponible
    this.eventBus.subscribe(EventTypes.COACH_AVAILABLE, (event: Event) => {
      // Notificar a usuarios suscritos a este coach
      this.notifySubscribedUsers(event.payload.coachId, 'coach_available', {
        coachName: event.payload.coachName,
      });
    });
  }

  /**
   * Inicializa plantillas de notificación
   */
  private initializeTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        id: 'session_booked_coach',
        title: '📅 Nueva sesión reservada',
        body: 'Tienes una nueva sesión programada. ID: {sessionId}',
        variables: ['sessionId'],
        priority: 'high',
      },
      {
        id: 'session_confirmed_user',
        title: '✅ Sesión confirmada',
        body: 'Tu sesión ha sido confirmada. ID: {sessionId}',
        variables: ['sessionId'],
        priority: 'normal',
      },
      {
        id: 'session_starting',
        title: '🎥 Tu sesión está por comenzar',
        body: 'Únete aquí: {meetingLink}',
        variables: ['meetingLink'],
        priority: 'urgent',
      },
      {
        id: 'coach_available',
        title: '👨‍💼 Coach disponible',
        body: '{coachName} ahora está disponible para sesiones',
        variables: ['coachName'],
        priority: 'low',
      },
      {
        id: 'session_reminder',
        title: '⏰ Recordatorio de sesión',
        body: 'Tu sesión comienza en {minutes} minutos',
        variables: ['minutes'],
        priority: 'high',
      },
      {
        id: 'session_cancelled',
        title: '❌ Sesión cancelada',
        body: 'Tu sesión con {coachName} ha sido cancelada',
        variables: ['coachName'],
        priority: 'high',
      },
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });

    console.log(`[NotificationService] ${templates.length} templates initialized`);
  }

  /**
   * Solicita permiso para mostrar notificaciones
   */
  private async requestPermission(): Promise<void> {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
      console.log(`[NotificationService] Permission status: ${this.permission}`);
    } else {
      console.warn('[NotificationService] Notifications not supported');
    }
  }

  /**
   * Notifica a usuarios suscritos (simulado)
   */
  private async notifySubscribedUsers(
    coachId: string,
    templateId: string,
    variables: { [key: string]: string }
  ): Promise<void> {
    // En implementación real, obtendría usuarios suscritos de base de datos
    const subscribedUsers = await this.getSubscribedUsers(coachId);

    subscribedUsers.forEach(userId => {
      this.sendTemplatedNotification(userId, templateId, variables, { coachId });
    });
  }

  /**
   * Simula obtener usuarios suscritos a un coach
   */
  private async getSubscribedUsers(_coachId: string): Promise<string[]> {
    // Simulación - en implementación real vendría de base de datos
    return ['user1', 'user2', 'user3'];
  }

  /**
   * Programa una notificación para el futuro
   */
  scheduleNotification(
    userId: string,
    payload: NotificationPayload,
    delay: number, // en milisegundos
    metadata: { sessionId?: string; coachId?: string } = {}
  ): number {
    const timeoutId = window.setTimeout(() => {
      this.sendNotification(userId, payload, metadata);
    }, delay);

    console.log(`[NotificationService] Notification scheduled for user ${userId} in ${delay}ms`);
    return timeoutId;
  }

  /**
   * Cancela una notificación programada
   */
  cancelScheduledNotification(timeoutId: number): void {
    clearTimeout(timeoutId);
    console.log(`[NotificationService] Scheduled notification ${timeoutId} cancelled`);
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus(): {
    permission: NotificationPermission;
    templatesCount: number;
    isSupported: boolean;
  } {
    return {
      permission: this.permission,
      templatesCount: this.templates.size,
      isSupported: 'Notification' in window,
    };
  }
}

// Export default instance
export const notificationService = NotificationService.getInstance();
