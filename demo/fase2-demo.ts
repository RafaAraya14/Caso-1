/**
 * Demo de las implementaciones FASE 2
 * 
 * Este archivo demuestra cómo usar todas las nuevas funcionalidades
 * implementadas en FASE 2: Background Jobs, Utilities y Design Patterns
 */

import { EventBus } from '../src/background/EventBus';
import { NotificationService } from '../src/background/NotificationService';
import { SessionListener } from '../src/listeners/SessionListener';
import { CoachListener } from '../src/listeners/CoachListener';
import { ConfigManager } from '../src/utils/ConfigManager';
import { CacheManager } from '../src/utils/CacheManager';
import { 
  formatDate, 
  formatDateTime, 
  formatRelativeTime,
  addDays,
  isToday,
  formatSessionDate 
} from '../src/utils/dateFormatter';
import { 
  capitalize, 
  formatCoachName, 
  maskEmail, 
  generateSessionCode,
  formatSkills 
} from '../src/utils/stringFormatter';
import { 
  formatCurrency, 
  formatRating, 
  formatSessionDuration 
} from '../src/utils/numberFormatter';
import { 
  isRequired, 
  isEmail, 
  createValidator,
  validateForm 
} from '../src/utils/validationUtils';

export class Fase2Demo {
  private eventBus: EventBus;
  private notificationService: NotificationService;
  private configManager: ConfigManager;
  private cacheManager: CacheManager;

  constructor() {
    console.log('🚀 Iniciando Demo FASE 2 - Mejoras Estructurales');
    
    // Inicializar singletons
    this.eventBus = EventBus.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.configManager = ConfigManager.getInstance();
    this.cacheManager = CacheManager.getInstance();
  }

  async runDemo(): Promise<void> {
    try {
      console.log('\n=== DEMO FASE 2: MEJORAS ESTRUCTURALES ===\n');
      
      await this.demoConfigManager();
      await this.demoCacheManager();
      await this.demoEventSystem();
      await this.demoUtilities();
      await this.demoValidations();
      await this.demoBackgroundJobs();
      
      console.log('\n✅ Demo completado exitosamente!');
    } catch (error) {
      console.error('❌ Error en el demo:', error);
    }
  }

  // Demo 1: ConfigManager (Singleton Pattern)
  private async demoConfigManager(): Promise<void> {
    console.log('📋 1. DEMO ConfigManager (Singleton Pattern)');
    
    try {
      // Inicializar configuración
      await this.configManager.initialize();
      
      // Obtener configuración
      const apiUrl = this.configManager.get<string>('api.baseUrl');
      const theme = this.configManager.get<string>('ui.theme');
      
      console.log('   ✓ API URL:', apiUrl);
      console.log('   ✓ Theme:', theme);
      
      // Cambiar configuración
      this.configManager.set('ui.theme', 'dark');
      console.log('   ✓ Theme cambiado a:', this.configManager.get('ui.theme'));
      
      // Verificar que es Singleton
      const anotherInstance = ConfigManager.getInstance();
      console.log('   ✓ Es Singleton:', this.configManager === anotherInstance);
      
      // Mostrar estadísticas
      const debugInfo = this.configManager.getDebugInfo();
      console.log('   ✓ Debug Info:', debugInfo);
      
    } catch (error) {
      console.error('   ❌ Error en ConfigManager demo:', error);
    }
  }

  // Demo 2: CacheManager (Singleton + Strategy Pattern)
  private async demoCacheManager(): Promise<void> {
    console.log('\n🗄️ 2. DEMO CacheManager (Singleton + Strategy)');
    
    try {
      // Cache en memoria
      this.cacheManager.set('user:123', { name: 'Juan Pérez', email: 'juan@example.com' });
      const user = this.cacheManager.get('user:123');
      console.log('   ✓ Cache en memoria:', user);
      
      // Cache persistente
      this.cacheManager.set('settings', { theme: 'dark', lang: 'es' }, { persistent: true });
      const settings = this.cacheManager.get('settings', true);
      console.log('   ✓ Cache persistente:', settings);
      
      // Cache con TTL
      this.cacheManager.set('temp-data', 'datos temporales', { ttl: 5000 });
      console.log('   ✓ Cache con TTL establecido');
      
      // Cache específico para coaches
      this.cacheManager.cacheCoach('coach-123', {
        id: 'coach-123',
        name: 'Ana García',
        rating: 4.8,
        skills: ['JavaScript', 'React', 'Node.js']
      });
      
      // Cache con tags para invalidación
      this.cacheManager.set('coach-list', ['coach-123', 'coach-456'], { 
        tags: ['coaches', 'listings'] 
      });
      
      // Estadísticas del cache
      const stats = this.cacheManager.getStats();
      console.log('   ✓ Cache Stats:', stats);
      
      // Invalidar por tag
      const invalidated = this.cacheManager.invalidateByTag('coaches');
      console.log('   ✓ Items invalidados:', invalidated);
      
    } catch (error) {
      console.error('   ❌ Error en CacheManager demo:', error);
    }
  }

  // Demo 3: Sistema de Eventos (Observer Pattern)
  private async demoEventSystem(): Promise<void> {
    console.log('\n🔔 3. DEMO Sistema de Eventos (Observer Pattern)');
    
    try {
      // Crear listeners
      const sessionListener = new SessionListener();
      const coachListener = new CoachListener();
      
      console.log('   ✓ Listeners creados y conectados al EventBus');
      
      // Suscribirse a eventos personalizados para el demo
      const unsubscribe1 = this.eventBus.subscribe('demo:test', (data) => {
        console.log('   📨 Evento recibido:', data);
      });
      
      const unsubscribe2 = this.eventBus.subscribe('session:created', (data) => {
        console.log('   🎯 Nueva sesión creada:', data.sessionId);
      });
      
      // Publicar eventos de prueba
      this.eventBus.publish('demo:test', { 
        message: 'Hola desde el EventBus!', 
        timestamp: new Date() 
      });
      
      // Simular creación de sesión
      this.eventBus.publish('session:created', {
        sessionId: 'session-789',
        coachId: 'coach-123',
        userId: 'user-456',
        scheduledDate: new Date(),
        timestamp: new Date()
      });
      
      // Simular actualización de coach
      this.eventBus.publish('coach:rating_updated', {
        coachId: 'coach-123',
        newRating: 4.9,
        previousRating: 4.8,
        timestamp: new Date()
      });
      
      // Mostrar estadísticas del EventBus
      const eventStats = this.eventBus.getStats();
      console.log('   ✓ EventBus Stats:', eventStats);
      
      // Obtener historial de eventos
      const history = this.eventBus.getEventHistory();
      console.log('   ✓ Últimos eventos:', history.slice(0, 5).map(e => e.type));
      
      // Cleanup
      if (typeof unsubscribe1 === 'function') unsubscribe1();
      if (typeof unsubscribe2 === 'function') unsubscribe2();
      console.log('   ✓ Suscripciones limpiadas');
      
    } catch (error) {
      console.error('   ❌ Error en EventSystem demo:', error);
    }
  }

  // Demo 4: Utilities (Diversos Patterns)
  private async demoUtilities(): Promise<void> {
    console.log('\n🛠️ 4. DEMO Utilities (Diversos Patterns)');
    
    try {
      // Date Utilities
      const now = new Date();
      const futureDate = addDays(now, 7);
      
      console.log('   📅 Date Utilities:');
      console.log('     - Hoy:', formatDate(now));
      console.log('     - Fecha completa:', formatDateTime(now, { format: 'long', includeTime: true }));
      console.log('     - Relativa:', formatRelativeTime(futureDate));
      console.log('     - Es hoy:', isToday(now));
      console.log('     - Sesión formato:', formatSessionDate(futureDate));
      
      // String Utilities
      console.log('\n   📝 String Utilities:');
      console.log('     - Capitalize:', capitalize('hola mundo'));
      console.log('     - Coach name:', formatCoachName('ana', 'garcía'));
      console.log('     - Email mask:', maskEmail('usuario@ejemplo.com'));
      console.log('     - Session code:', generateSessionCode());
      console.log('     - Skills format:', formatSkills(['JavaScript', 'React', 'Node.js']));
      
      // Number Utilities
      console.log('\n   🔢 Number Utilities:');
      console.log('     - Currency:', formatCurrency(1500.50));
      console.log('     - Rating:', formatRating(4.8567));
      console.log('     - Duration:', formatSessionDuration(90));
      console.log('     - Coach price:', formatCurrency(800) + '/hora');
      
    } catch (error) {
      console.error('   ❌ Error en Utilities demo:', error);
    }
  }

  // Demo 5: Sistema de Validación (Strategy + Composite Pattern)
  private async demoValidations(): Promise<void> {
    console.log('\n✅ 5. DEMO Sistema de Validación (Strategy + Composite)');
    
    try {
      // Validadores individuales
      const emailValidator = isEmail('Email inválido');
      const requiredValidator = isRequired('Campo requerido');
      
      // Validador compuesto
      const compositeValidator = createValidator(
        requiredValidator,
        emailValidator
      );
      
      // Pruebas de validación
      console.log('   📧 Validación de email:');
      console.log('     - Email válido:', emailValidator('user@example.com'));
      console.log('     - Email inválido:', emailValidator('invalid-email'));
      console.log('     - Email vacío:', emailValidator(''));
      
      // Validación de formulario
      const formData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@ejemplo.com',
        phone: '5551234567'
      };
      
      const formValidation = {
        firstName: [isRequired('Nombre requerido')],
        lastName: [isRequired('Apellido requerido')],
        email: [isRequired('Email requerido'), isEmail('Email inválido')],
        phone: [isRequired('Teléfono requerido')]
      };
      
      const errors = validateForm(formData, formValidation);
      console.log('   📋 Validación de formulario:', Object.keys(errors).length === 0 ? 'Válido' : 'Errores:', errors);
      
      // Validación con datos inválidos
      const invalidData = { ...formData, email: 'email-invalido' };
      const invalidErrors = validateForm(invalidData, formValidation);
      console.log('   ❌ Datos inválidos:', invalidErrors);
      
    } catch (error) {
      console.error('   ❌ Error en Validations demo:', error);
    }
  }

  // Demo 6: Background Jobs en acción
  private async demoBackgroundJobs(): Promise<void> {
    console.log('\n⚙️ 6. DEMO Background Jobs');
    
    try {
      // Simular proceso de booking completo
      console.log('   🎯 Simulando proceso de booking de sesión...');
      
      // 1. Validación de datos
      const sessionData = {
        coachId: 'coach-123',
        userId: 'user-456',
        scheduledDate: addDays(new Date(), 2),
        duration: 60,
        sessionType: 'Mentoría Individual'
      };
      
      // 2. Publicar evento de intención de booking
      this.eventBus.publish('session:booking_started', {
        ...sessionData,
        timestamp: new Date(),
        step: 'validation'
      });
      
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 3. Publicar evento de creación exitosa
      this.eventBus.publish('session:created', {
        sessionId: 'session-' + Date.now(),
        ...sessionData,
        timestamp: new Date(),
        status: 'confirmed'
      });
      
      // 4. Simular notificación
      await this.notificationService.sendNotification(
        sessionData.userId,
        'session_confirmed',
        {
          coachName: 'Ana García',
          sessionDate: sessionData.scheduledDate,
          sessionType: sessionData.sessionType
        }
      );
      
      console.log('   ✅ Proceso de booking completado');
      
      // Mostrar estadísticas finales
      const finalStats = this.eventBus.getStats();
      console.log('   📊 Estadísticas finales del EventBus:', finalStats);
      
      // Mostrar estado de notificaciones
      const notificationStatus = this.notificationService.getStatus();
      console.log('   📧 Estado de notificaciones:', notificationStatus);
      
    } catch (error) {
      console.error('   ❌ Error en Background Jobs demo:', error);
    }
  }

  // Método para limpiar recursos
  public cleanup(): void {
    console.log('\n🧹 Limpiando recursos del demo...');
    
    // Limpiar cache
    this.cacheManager.clearAll();
    
    // Limpiar notificaciones pendientes
    console.log('   ✓ Notificaciones procesadas');
    
    console.log('   ✓ Recursos limpiados');
  }
}

// Ejecutar demo si es llamado directamente
if (require.main === module) {
  const demo = new Fase2Demo();
  demo.runDemo()
    .then(() => {
      demo.cleanup();
      console.log('\n🎉 Demo FASE 2 completado exitosamente!');
      console.log('📚 Revisa los archivos de documentación en docs/ para más detalles');
    })
    .catch(error => {
      console.error('💥 Error ejecutando demo:', error);
      process.exit(1);
    });
}