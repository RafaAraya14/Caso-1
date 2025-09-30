# Background Jobs - Guía de Implementación y Ejemplos

## Descripción General

El sistema de Background Jobs implementa un patrón Publisher-Subscriber (pub/sub) con Event Bus para manejar procesamiento asíncrono, notificaciones en tiempo real y listeners de eventos. Esta arquitectura permite desacoplar la lógica de negocio de las tareas de fondo.

## Arquitectura del Sistema

### Componentes Principales

1. **EventBus** (Singleton): Núcleo del sistema pub/sub
2. **NotificationService** (Observer): Manejo de notificaciones con templates
3. **SessionListener**: Escucha eventos de sesiones en tiempo real
4. **CoachListener**: Procesa eventos relacionados con coaches

## Ejemplos de Uso

### 1. Configuración Inicial

```typescript
// src/main.tsx o src/App.tsx
import { EventBus } from './background/EventBus';
import { NotificationService } from './background/NotificationService';
import { SessionListener } from './listeners/SessionListener';
import { CoachListener } from './listeners/CoachListener';

// Inicializar servicios (ejecutar una sola vez)
const eventBus = EventBus.getInstance();
const notificationService = NotificationService.getInstance();
const sessionListener = new SessionListener();
const coachListener = new CoachListener();

// Los listeners se conectan automáticamente al EventBus
```

### 2. Manejo de Eventos de Sesiones

#### Publicar Evento de Nueva Sesión
```typescript
// En BookSessionUseCase.ts o componente de booking
import { EventBus } from '../background/EventBus';

export class BookSessionUseCase {
  async execute(sessionData: CreateSessionDTO): Promise<Session> {
    try {
      // Crear la sesión
      const session = await this.sessionService.createSession(sessionData);
      
      // Publicar evento asíncrono
      EventBus.getInstance().publish('session:created', {
        sessionId: session.id,
        coachId: session.coachId,
        userId: session.userId,
        scheduledDate: session.scheduledDate,
        timestamp: new Date(),
        metadata: {
          service: 'BookSessionUseCase',
          version: '1.0'
        }
      });
      
      return session;
    } catch (error) {
      // Publicar evento de error
      EventBus.getInstance().publish('session:creation_failed', {
        error: error.message,
        sessionData,
        timestamp: new Date()
      });
      throw error;
    }
  }
}
```

#### Escuchar Eventos en Componentes React
```typescript
// En componente SessionBooking.tsx
import { useEffect, useState } from 'react';
import { EventBus } from '../background/EventBus';

export const SessionBooking: React.FC = () => {
  const [bookingStatus, setBookingStatus] = useState<string>('idle');
  
  useEffect(() => {
    const eventBus = EventBus.getInstance();
    
    // Suscribirse a eventos de sesión
    const unsubscribeCreated = eventBus.subscribe('session:created', (data) => {
      setBookingStatus('success');
      // Mostrar notificación de éxito
    });
    
    const unsubscribeFailed = eventBus.subscribe('session:creation_failed', (data) => {
      setBookingStatus('error');
      console.error('Error al crear sesión:', data.error);
    });
    
    // Cleanup
    return () => {
      unsubscribeCreated();
      unsubscribeFailed();
    };
  }, []);
  
  return (
    <div>
      {/* UI del componente */}
      {bookingStatus === 'success' && (
        <div className="alert-success">¡Sesión reservada exitosamente!</div>
      )}
    </div>
  );
};
```

### 3. Sistema de Notificaciones

#### Enviar Notificaciones Automáticas
```typescript
// En SessionListener.ts (ya implementado)
private async handleSessionCreated(data: any): Promise<void> {
  // Enviar notificación al usuario
  await this.notificationService.sendNotification({
    userId: data.userId,
    type: 'session_confirmed',
    data: {
      coachName: 'Nombre del Coach',
      sessionDate: data.scheduledDate,
      sessionType: 'Mentoría Individual'
    }
  });
  
  // Enviar notificación al coach
  await this.notificationService.sendNotification({
    userId: data.coachId,
    type: 'new_session_request',
    data: {
      clientName: 'Nombre del Cliente',
      sessionDate: data.scheduledDate,
      sessionType: 'Mentoría Individual'
    }
  });
}
```

#### Notificaciones Personalizadas
```typescript
// En cualquier servicio o componente
import { NotificationService } from '../background/NotificationService';

export class CustomNotificationExample {
  private notificationService = NotificationService.getInstance();
  
  async sendCustomNotification(userId: string, message: string) {
    await this.notificationService.sendNotification({
      userId,
      type: 'custom',
      data: { message },
      customTemplate: {
        title: 'Mensaje Personalizado',
        body: message,
        icon: 'info',
        actions: [
          { action: 'view', title: 'Ver Detalles' }
        ]
      }
    });
  }
}
```

### 4. Background Jobs para Coaches

#### Actualización de Rating en Tiempo Real
```typescript
// En el servicio que maneja reviews/ratings
export class ReviewService {
  async submitReview(reviewData: ReviewDTO): Promise<void> {
    // Guardar review en base de datos
    await this.saveReview(reviewData);
    
    // Publicar evento para actualizar rating
    EventBus.getInstance().publish('coach:rating_updated', {
      coachId: reviewData.coachId,
      newRating: reviewData.rating,
      reviewCount: await this.getReviewCount(reviewData.coachId),
      timestamp: new Date()
    });
  }
}
```

#### Monitoreo de Estado de Coaches
```typescript
// En el dashboard de admin o componente de monitoreo
export const CoachMonitoring: React.FC = () => {
  const [coachStatuses, setCoachStatuses] = useState<Map<string, string>>(new Map());
  
  useEffect(() => {
    const eventBus = EventBus.getInstance();
    
    const unsubscribe = eventBus.subscribe('coach:status_changed', (data) => {
      setCoachStatuses(prev => new Map(prev.set(data.coachId, data.newStatus)));
    });
    
    return unsubscribe;
  }, []);
  
  return (
    <div>
      {/* UI para mostrar estados de coaches */}
    </div>
  );
};
```

### 5. Procesamiento Asíncrono de Tareas

#### Queue de Tareas Diferidas
```typescript
// Ejemplo de procesamiento de pagos en background
export class PaymentProcessor {
  private eventBus = EventBus.getInstance();
  
  constructor() {
    // Suscribirse a eventos de pago
    this.eventBus.subscribe('payment:process_required', this.processPayment.bind(this));
  }
  
  // Encolar procesamiento de pago
  async enqueuePayment(paymentData: PaymentDTO): Promise<void> {
    this.eventBus.publish('payment:process_required', {
      paymentId: paymentData.id,
      amount: paymentData.amount,
      sessionId: paymentData.sessionId,
      timestamp: new Date(),
      priority: paymentData.amount > 1000 ? 'high' : 'normal'
    });
  }
  
  // Procesar pago en background
  private async processPayment(data: any): Promise<void> {
    try {
      // Simular procesamiento asíncrono
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Procesar pago
      const result = await this.paymentService.process(data);
      
      // Publicar resultado
      this.eventBus.publish('payment:processed', {
        paymentId: data.paymentId,
        status: 'success',
        transactionId: result.transactionId,
        timestamp: new Date()
      });
      
    } catch (error) {
      this.eventBus.publish('payment:failed', {
        paymentId: data.paymentId,
        error: error.message,
        timestamp: new Date()
      });
    }
  }
}
```

### 6. Monitoreo y Debugging

#### Estadísticas del EventBus
```typescript
// En componente de admin o debugging
export const EventBusStats: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    const eventBus = EventBus.getInstance();
    
    const interval = setInterval(() => {
      setStats(eventBus.getStats());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      <h3>EventBus Statistics</h3>
      {stats && (
        <div>
          <p>Total Events: {stats.totalEvents}</p>
          <p>Active Subscriptions: {stats.subscriptionCount}</p>
          <p>Events by Type:</p>
          <ul>
            {Object.entries(stats.eventsByType).map(([type, count]) => (
              <li key={type}>{type}: {count as number}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

#### Historial de Eventos
```typescript
// Acceder al historial para debugging
const eventBus = EventBus.getInstance();
const recentEvents = eventBus.getEventHistory(50); // Últimos 50 eventos

console.log('Recent events:', recentEvents);

// Filtrar eventos por tipo
const sessionEvents = recentEvents.filter(event => 
  event.type.startsWith('session:')
);
```

## Mejores Prácticas

### 1. Nomenclatura de Eventos
```typescript
// Usar formato: entity:action
'session:created'
'session:updated'
'session:cancelled'
'coach:status_changed'
'coach:rating_updated'
'payment:processed'
'notification:sent'
```

### 2. Estructura de Datos de Eventos
```typescript
interface EventData {
  // IDs relevantes
  sessionId?: string;
  coachId?: string;
  userId?: string;
  
  // Datos específicos del evento
  [key: string]: any;
  
  // Metadatos requeridos
  timestamp: Date;
  metadata?: {
    service: string;
    version: string;
    correlationId?: string;
  };
}
```

### 3. Manejo de Errores
```typescript
// Siempre incluir manejo de errores en listeners
eventBus.subscribe('session:created', async (data) => {
  try {
    await this.processSessionCreated(data);
  } catch (error) {
    logger.error('Error processing session:created event', {
      error: error.message,
      eventData: data,
      context: { service: 'SessionListener' }
    });
    
    // Publicar evento de error para monitoreo
    eventBus.publish('system:error', {
      originalEvent: 'session:created',
      error: error.message,
      timestamp: new Date()
    });
  }
});
```

### 4. Cleanup de Suscripciones
```typescript
// En componentes React
useEffect(() => {
  const unsubscribe = eventBus.subscribe('event:type', handler);
  return unsubscribe; // Importante para evitar memory leaks
}, []);

// En servicios/clases
export class SomeService {
  private unsubscribeFunctions: Array<() => void> = [];
  
  constructor() {
    this.unsubscribeFunctions.push(
      eventBus.subscribe('event:type', this.handler.bind(this))
    );
  }
  
  destroy() {
    this.unsubscribeFunctions.forEach(unsub => unsub());
  }
}
```

## Casos de Uso Específicos del Proyecto

### 1. Sistema de Créditos de Usuario
```typescript
// Actualizar créditos cuando se completa una sesión
eventBus.subscribe('session:completed', async (data) => {
  await userCreditsService.deductCredits(data.userId, data.sessionCost);
  
  // Notificar al usuario
  await notificationService.sendNotification({
    userId: data.userId,
    type: 'credits_updated',
    data: {
      creditsRemaining: await userCreditsService.getCredits(data.userId),
      sessionCompleted: true
    }
  });
});
```

### 2. Cache Invalidation
```typescript
// Invalidar cache cuando se actualiza información del coach
eventBus.subscribe('coach:profile_updated', async (data) => {
  await cacheService.invalidateCoachProfile(data.coachId);
  await cacheService.invalidateCoachList();
  
  // Refrescar datos en componentes activos
  eventBus.publish('cache:coach_data_refreshed', {
    coachId: data.coachId,
    timestamp: new Date()
  });
});
```

### 3. Analytics y Tracking
```typescript
// Enviar eventos a analytics
eventBus.subscribe('session:created', async (data) => {
  await analyticsService.track('session_booked', {
    coach_id: data.coachId,
    user_id: data.userId,
    session_type: data.sessionType,
    timestamp: data.timestamp
  });
});
```

Este sistema de background jobs proporciona una base sólida para manejar procesamiento asíncrono, notificaciones en tiempo real y desacoplamiento de la lógica de negocio en la aplicación.