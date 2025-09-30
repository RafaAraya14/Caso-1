# Design Patterns Documentation

## Descripción General

Este documento detalla todos los patrones de diseño implementados en el proyecto Caso #1. Los patrones de diseño son soluciones probadas a problemas recurrentes en el desarrollo de software que mejoran la mantenibilidad, escalabilidad y legibilidad del código.

## Índice de Patrones Implementados

1. [Singleton Pattern](#singleton-pattern)
2. [Strategy Pattern](#strategy-pattern)
3. [Observer Pattern](#observer-pattern)
4. [Factory Pattern](#factory-pattern)
5. [Builder Pattern](#builder-pattern)
6. [Facade Pattern](#facade-pattern)
7. [Repository Pattern](#repository-pattern)
8. [Command Pattern](#command-pattern)
9. [Decorator Pattern](#decorator-pattern)
10. [Composite Pattern](#composite-pattern)

---

## Singleton Pattern

**Propósito**: Garantizar que una clase tenga una única instancia y proporcionar un punto de acceso global a ella.

### Implementaciones

#### 1. EventBus (src/background/EventBus.ts)
```typescript
export class EventBus {
  private static instance: EventBus;
  
  private constructor() {
    // Constructor privado para prevenir instanciación directa
  }
  
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
}
```

**Uso en el proyecto**:
- Sistema de eventos centralizado para comunicación entre componentes
- Garantiza que todos los componentes usen el mismo bus de eventos
- Mantiene el estado global de suscripciones y eventos

#### 2. NotificationService (src/background/NotificationService.ts)
```typescript
export class NotificationService {
  private static instance: NotificationService;
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
}
```

**Ventajas**:
- Servicio global de notificaciones accesible desde cualquier parte de la aplicación
- Configuración centralizada de templates y proveedores

#### 3. ConfigManager (src/utils/ConfigManager.ts)
```typescript
export class ConfigManager {
  private static instance: ConfigManager;
  
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }
}
```

**Beneficios**:
- Configuración global de la aplicación
- Punto único de acceso a variables de entorno y configuraciones

#### 4. CacheManager (src/utils/CacheManager.ts)
Similar implementación para gestión centralizada de cache.

### Cuándo usar Singleton
✅ **Usar cuando**:
- Necesitas exactamente una instancia (configuración global, logging, cache)
- Requieres acceso global a recursos compartidos
- Necesitas controlar el acceso a recursos limitados

❌ **Evitar cuando**:
- El estado global no es necesario
- Puede complicar las pruebas unitarias
- Puede crear dependencias ocultas

---

## Strategy Pattern

**Propósito**: Definir una familia de algoritmos, encapsular cada uno y hacerlos intercambiables.

### Implementaciones

#### 1. Validadores (src/validators/)
```typescript
// Strategy base
export abstract class BaseValidator<T> {
  abstract validate(data: T): ValidationResult;
}

// Estrategias concretas
export class CreateSessionValidator extends BaseValidator<CreateSessionDTO> {
  validate(data: CreateSessionDTO): ValidationResult {
    // Implementación específica para validar sesiones
  }
}

export class SearchCoachValidator extends BaseValidator<SearchCoachDTO> {
  validate(data: SearchCoachDTO): ValidationResult {
    // Implementación específica para validar búsquedas
  }
}
```

**Uso**:
```typescript
// Context que usa las estrategias
export class ValidationService {
  private validator: BaseValidator<any>;
  
  setValidator(validator: BaseValidator<any>) {
    this.validator = validator;
  }
  
  validate(data: any): ValidationResult {
    return this.validator.validate(data);
  }
}
```

#### 2. Cache Strategies (src/utils/CacheManager.ts)
```typescript
abstract class CacheStrategy {
  abstract set<T>(key: string, value: T, options?: CacheOptions): void;
  abstract get<T>(key: string): T | null;
}

class MemoryCacheStrategy extends CacheStrategy {
  // Implementación en memoria
}

class PersistentCacheStrategy extends CacheStrategy {
  // Implementación persistente en localStorage
}
```

### Ventajas del Strategy Pattern
- **Flexibilidad**: Permite cambiar algoritmos en tiempo de ejecución
- **Extensibilidad**: Fácil agregar nuevas estrategias sin modificar código existente
- **Testabilidad**: Cada estrategia se puede probar independientemente

---

## Observer Pattern

**Propósito**: Definir una dependencia uno-a-muchos entre objetos para que cuando un objeto cambie su estado, todos sus dependientes sean notificados automáticamente.

### Implementaciones

#### 1. EventBus + Listeners
```typescript
// Subject (Observable)
export class EventBus {
  private subscribers: Map<string, Array<(data: any) => void>> = new Map();
  
  subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(callback);
    
    // Retorna función de unsubscribe
    return () => {
      const callbacks = this.subscribers.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }
  
  publish(eventType: string, data: any): void {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

// Observers
export class SessionListener {
  constructor() {
    const eventBus = EventBus.getInstance();
    eventBus.subscribe('session:created', this.handleSessionCreated.bind(this));
    eventBus.subscribe('session:updated', this.handleSessionUpdated.bind(this));
  }
  
  private handleSessionCreated(data: any): void {
    // Reaccionar a creación de sesión
  }
}
```

#### 2. NotificationService como Observer
```typescript
export class NotificationService {
  constructor() {
    // Se suscribe a eventos del EventBus
    EventBus.getInstance().subscribe('session:created', this.onSessionCreated.bind(this));
    EventBus.getInstance().subscribe('coach:status_changed', this.onCoachStatusChanged.bind(this));
  }
  
  private onSessionCreated(data: any): void {
    this.sendNotification({
      userId: data.userId,
      type: 'session_confirmed',
      data
    });
  }
}
```

### Beneficios del Observer Pattern
- **Desacoplamiento**: Los subjects no conocen detalles específicos de sus observers
- **Comunicación dinámica**: Los observers pueden suscribirse/desuscribirse en tiempo de ejecución
- **Extensibilidad**: Fácil agregar nuevos observers sin modificar el subject

---

## Factory Pattern

**Propósito**: Crear objetos sin especificar la clase exacta a crear.

### Implementaciones

#### 1. Transformer Factory (src/transformers/)
```typescript
export class TransformerFactory {
  static createCoachTransformer(): CoachTransformer {
    return new CoachTransformer();
  }
  
  static createSessionTransformer(): SessionTransformer {
    return new SessionTransformer();
  }
  
  static createTransformer(type: 'coach' | 'session'): BaseTransformer {
    switch (type) {
      case 'coach':
        return new CoachTransformer();
      case 'session':
        return new SessionTransformer();
      default:
        throw new Error(`Unknown transformer type: ${type}`);
    }
  }
}
```

#### 2. Use Case Factory (src/business/)
```typescript
export class UseCaseFactory {
  static createBookSessionUseCase(): BookSessionUseCase {
    return new BookSessionUseCase(
      new SessionService(),
      new CoachService(),
      new UserService()
    );
  }
  
  static createSearchCoachUseCase(): SearchCoachUseCase {
    return new SearchCoachUseCase(
      new CoachService(),
      new CacheManager()
    );
  }
}
```

### Ventajas del Factory Pattern
- **Encapsulación**: La lógica de creación está centralizada
- **Flexibilidad**: Fácil cambiar la implementación de objetos creados
- **Reutilización**: La lógica de creación se puede reutilizar

---

## Builder Pattern

**Propósito**: Construir objetos complejos paso a paso.

### Implementaciones

#### 1. DTO Builder (src/types/dtos/)
```typescript
export class CreateSessionDTOBuilder {
  private dto: Partial<CreateSessionDTO> = {};
  
  setCoachId(coachId: string): CreateSessionDTOBuilder {
    this.dto.coachId = coachId;
    return this;
  }
  
  setUserId(userId: string): CreateSessionDTOBuilder {
    this.dto.userId = userId;
    return this;
  }
  
  setScheduledDate(date: Date): CreateSessionDTOBuilder {
    this.dto.scheduledDate = date;
    return this;
  }
  
  setDuration(duration: number): CreateSessionDTOBuilder {
    this.dto.duration = duration;
    return this;
  }
  
  build(): CreateSessionDTO {
    if (!this.dto.coachId || !this.dto.userId || !this.dto.scheduledDate) {
      throw new Error('Missing required fields for CreateSessionDTO');
    }
    return this.dto as CreateSessionDTO;
  }
}

// Uso:
const sessionDTO = new CreateSessionDTOBuilder()
  .setCoachId('coach-123')
  .setUserId('user-456')
  .setScheduledDate(new Date())
  .setDuration(60)
  .build();
```

#### 2. Query Builder para búsquedas
```typescript
export class CoachSearchQueryBuilder {
  private query: Partial<SearchCoachDTO> = {};
  
  withSkills(skills: string[]): CoachSearchQueryBuilder {
    this.query.skills = skills;
    return this;
  }
  
  withMinRating(rating: number): CoachSearchQueryBuilder {
    this.query.minRating = rating;
    return this;
  }
  
  withMaxPrice(price: number): CoachSearchQueryBuilder {
    this.query.maxHourlyRate = price;
    return this;
  }
  
  withAvailability(date: Date): CoachSearchQueryBuilder {
    this.query.availableDate = date;
    return this;
  }
  
  build(): SearchCoachDTO {
    return this.query as SearchCoachDTO;
  }
}
```

### Beneficios del Builder Pattern
- **Legibilidad**: Código más legible y fluido
- **Flexibilidad**: Construcción paso a paso opcional
- **Validación**: Validación en el momento de construcción

---

## Facade Pattern

**Propósito**: Proporcionar una interfaz unificada a un conjunto de interfaces en un subsistema.

### Implementaciones

#### 1. Session Management Facade
```typescript
export class SessionFacade {
  private bookSessionUseCase: BookSessionUseCase;
  private cancelSessionUseCase: CancelSessionUseCase;
  private sessionService: SessionService;
  private notificationService: NotificationService;
  
  constructor() {
    this.bookSessionUseCase = new BookSessionUseCase();
    this.cancelSessionUseCase = new CancelSessionUseCase();
    this.sessionService = new SessionService();
    this.notificationService = NotificationService.getInstance();
  }
  
  async bookSession(sessionData: CreateSessionDTO): Promise<Session> {
    // Coordina múltiples operaciones
    const session = await this.bookSessionUseCase.execute(sessionData);
    await this.notificationService.sendSessionConfirmation(session);
    return session;
  }
  
  async cancelSession(sessionId: string, reason: string): Promise<void> {
    await this.cancelSessionUseCase.execute(sessionId, reason);
    await this.notificationService.sendCancellationNotice(sessionId);
  }
}
```

#### 2. Coach Management Facade
```typescript
export class CoachFacade {
  private searchUseCase: SearchCoachUseCase;
  private coachService: CoachService;
  private cacheManager: CacheManager;
  
  async searchCoaches(criteria: SearchCoachDTO): Promise<Coach[]> {
    // Simplifica la búsqueda con cache
    const cacheKey = `search:${JSON.stringify(criteria)}`;
    
    let results = this.cacheManager.get<Coach[]>(cacheKey);
    if (!results) {
      results = await this.searchUseCase.execute(criteria);
      this.cacheManager.set(cacheKey, results, { ttl: 300000 });
    }
    
    return results;
  }
}
```

### Ventajas del Facade Pattern
- **Simplicidad**: Interfaz simple para operaciones complejas
- **Desacoplamiento**: Los clientes no dependen de clases internas del subsistema
- **Mantenibilidad**: Cambios internos no afectan a los clientes

---

## Repository Pattern

**Propósito**: Encapsular la lógica de acceso a datos y proporcionar una interfaz más orientada a objetos.

### Implementaciones

#### 1. Coach Repository (conceptual - src/services/)
```typescript
export interface CoachRepository {
  findById(id: string): Promise<Coach | null>;
  findBySkills(skills: string[]): Promise<Coach[]>;
  findAvailable(date: Date): Promise<Coach[]>;
  save(coach: Coach): Promise<Coach>;
  update(id: string, updates: Partial<Coach>): Promise<Coach>;
  delete(id: string): Promise<void>;
}

export class SupabaseCoachRepository implements CoachRepository {
  constructor(private supabaseClient: SupabaseClient) {}
  
  async findById(id: string): Promise<Coach | null> {
    const { data, error } = await this.supabaseClient
      .from('coaches')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw new Error(error.message);
    return data ? CoachTransformer.fromApi(data) : null;
  }
  
  async findBySkills(skills: string[]): Promise<Coach[]> {
    const { data, error } = await this.supabaseClient
      .from('coaches')
      .select('*')
      .contains('skills', skills);
      
    if (error) throw new Error(error.message);
    return data.map(item => CoachTransformer.fromApi(item));
  }
}
```

#### 2. Session Repository
```typescript
export interface SessionRepository {
  findByUserId(userId: string): Promise<Session[]>;
  findByCoachId(coachId: string): Promise<Session[]>;
  findUpcoming(): Promise<Session[]>;
  save(session: Session): Promise<Session>;
  updateStatus(id: string, status: SessionStatus): Promise<void>;
}
```

### Beneficios del Repository Pattern
- **Abstracción**: Abstrae la fuente de datos (base de datos, API, cache)
- **Testabilidad**: Fácil crear mocks para pruebas
- **Mantenibilidad**: Cambios en el acceso a datos no afectan la lógica de negocio

---

## Command Pattern

**Propósito**: Encapsular una solicitud como un objeto, permitiendo parametrizar clientes con diferentes solicitudes.

### Implementaciones

#### 1. Use Cases como Commands
```typescript
export interface Command<T, R> {
  execute(input: T): Promise<R>;
}

export class BookSessionUseCase implements Command<CreateSessionDTO, Session> {
  async execute(input: CreateSessionDTO): Promise<Session> {
    // Lógica de negocio encapsulada
    const validation = this.validateInput(input);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    const session = await this.sessionService.createSession(input);
    this.eventBus.publish('session:created', session);
    
    return session;
  }
}

// Command Invoker
export class CommandBus {
  private commands: Map<string, Command<any, any>> = new Map();
  
  register<T, R>(name: string, command: Command<T, R>): void {
    this.commands.set(name, command);
  }
  
  async execute<T, R>(commandName: string, input: T): Promise<R> {
    const command = this.commands.get(commandName);
    if (!command) {
      throw new Error(`Command not found: ${commandName}`);
    }
    
    return await command.execute(input);
  }
}
```

### Ventajas del Command Pattern
- **Desacoplamiento**: El invocador no conoce al receptor
- **Flexibilidad**: Fácil agregar nuevos commands
- **Logging/Undo**: Posibilidad de implementar logging y operaciones undo

---

## Decorator Pattern

**Propósito**: Agregar funcionalidad a objetos dinámicamente sin alterar su estructura.

### Implementaciones

#### 1. Logging Decorator para Use Cases
```typescript
export function withLogging<T extends { execute: (...args: any[]) => any }>(
  target: T
): T {
  const originalExecute = target.execute.bind(target);
  
  target.execute = async (...args: any[]) => {
    const startTime = Date.now();
    logger.info(`Executing ${target.constructor.name}`, { args });
    
    try {
      const result = await originalExecute(...args);
      const duration = Date.now() - startTime;
      logger.info(`${target.constructor.name} completed`, { duration, result });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`${target.constructor.name} failed`, { duration, error });
      throw error;
    }
  };
  
  return target;
}

// Uso:
const bookSessionUseCase = withLogging(new BookSessionUseCase());
```

#### 2. Cache Decorator
```typescript
export function withCache(cacheKey: (args: any[]) => string, ttl: number = 300000) {
  return function<T extends { execute: (...args: any[]) => any }>(target: T): T {
    const originalExecute = target.execute.bind(target);
    const cache = CacheManager.getInstance();
    
    target.execute = async (...args: any[]) => {
      const key = cacheKey(args);
      let result = cache.get(key);
      
      if (result === null) {
        result = await originalExecute(...args);
        cache.set(key, result, { ttl });
      }
      
      return result;
    };
    
    return target;
  };
}
```

### Beneficios del Decorator Pattern
- **Composición**: Agregar funcionalidad por composición, no herencia
- **Flexibilidad**: Combinaciones dinámicas de funcionalidades
- **Responsabilidad única**: Cada decorator tiene una responsabilidad específica

---

## Composite Pattern

**Propósito**: Componer objetos en estructuras de árbol para representar jerarquías.

### Implementaciones

#### 1. Validation Composite
```typescript
export abstract class ValidationComponent {
  abstract validate(data: any): ValidationResult;
}

export class ValidationComposite extends ValidationComponent {
  private children: ValidationComponent[] = [];
  
  add(validator: ValidationComponent): void {
    this.children.push(validator);
  }
  
  remove(validator: ValidationComponent): void {
    const index = this.children.indexOf(validator);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }
  
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (const child of this.children) {
      const result = child.validate(data);
      if (!result.isValid && result.error) {
        errors.push(result.error);
      }
      if (result.warnings) {
        warnings.push(...result.warnings);
      }
    }
    
    return {
      isValid: errors.length === 0,
      error: errors.length > 0 ? errors.join(', ') : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }
}

// Uso:
const formValidator = new ValidationComposite();
formValidator.add(new RequiredFieldValidator());
formValidator.add(new EmailValidator());
formValidator.add(new PasswordStrengthValidator());
```

### Beneficios del Composite Pattern
- **Uniformidad**: Tratamiento uniforme de objetos individuales y compuestos
- **Flexibilidad**: Fácil agregar nuevos tipos de componentes
- **Recursión**: Estructura recursiva natural

---

## Resumen de Patrones por Archivo

### src/background/
- **EventBus.ts**: Singleton + Observer (Subject)
- **NotificationService.ts**: Singleton + Observer

### src/listeners/
- **SessionListener.ts**: Observer
- **CoachListener.ts**: Observer

### src/business/
- **BookSessionUseCase.ts**: Command
- **SearchCoachUseCase.ts**: Command

### src/validators/
- **BaseValidator.ts**: Strategy (base)
- **CreateSessionValidator.ts**: Strategy (concrete)
- **SearchCoachValidator.ts**: Strategy (concrete)

### src/transformers/
- **CoachTransformer.ts**: Factory Pattern (static methods)
- **SessionTransformer.ts**: Factory Pattern (static methods)

### src/utils/
- **ConfigManager.ts**: Singleton
- **CacheManager.ts**: Singleton + Strategy
- **validationUtils.ts**: Strategy + Composite

## Beneficios Generales de los Patrones Implementados

### 1. **Mantenibilidad**
- Código más organizardo y predecible
- Separación clara de responsabilidades
- Fácil localización y corrección de bugs

### 2. **Escalabilidad**
- Fácil agregar nuevas funcionalidades
- Estructuras flexibles que crecen con la aplicación
- Reutilización de código

### 3. **Testabilidad**
- Dependencias claramente definidas
- Fácil crear mocks y stubs
- Pruebas unitarias más simples

### 4. **Legibilidad**
- Código autodocumentado
- Patrones reconocibles por otros desarrolladores
- Intención clara del diseño

### 5. **Reutilización**
- Componentes reutilizables
- Lógica centralizada
- Evita duplicación de código

## Mejores Prácticas Aplicadas

1. **Single Responsibility Principle**: Cada clase tiene una responsabilidad única
2. **Open/Closed Principle**: Clases abiertas para extensión, cerradas para modificación
3. **Dependency Inversion**: Dependencia de abstracciones, no de concreciones
4. **Interface Segregation**: Interfaces específicas y cohesivas
5. **Don't Repeat Yourself (DRY)**: Evitar duplicación de código

## Consideraciones de Performance

- **Singletons**: Instancia única reduce uso de memoria
- **Strategy Pattern**: Permite optimizaciones específicas por algoritmo
- **Observer Pattern**: Comunicación eficiente entre componentes
- **Cache en Facade**: Reduce llamadas repetitivas a servicios

Este conjunto de patrones de diseño proporciona una base sólida para el desarrollo continuo de la aplicación, facilitando la adición de nuevas características y el mantenimiento del código existente.