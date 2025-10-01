# Design Patterns Documentation

## Overview

This document details all design patterns implemented in the Case #1 project. Design patterns are proven solutions to recurring problems in software development that improve maintainability, scalability, and code readability.

## Table of Implemented Patterns

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

**Purpose**: Ensure a class has only one instance and provide global access to it.

### Implementations

#### 1. EventBus (src/background/EventBus.ts)
```typescript
export class EventBus {
  private static instance: EventBus;
  
  private constructor() {
    // Private constructor to prevent direct instantiation
  }
  
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
}
```

**Usage in project**:
- Centralized event system for component communication
- Ensures all components use the same event bus
- Maintains global state of subscriptions and events

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

**Advantages**:
- Global notification service accessible from anywhere in the application
- Centralized configuration of templates and providers

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

**Benefits**:
- Global application configuration
- Single point of access to environment variables and settings

#### 4. CacheManager (src/utils/CacheManager.ts)
Similar implementation for centralized cache management.

### When to use Singleton
✅ **Use when**:
- You need exactly one instance (global config, logging, cache)
- You require global access to shared resources
- You need to control access to limited resources

❌ **Avoid when**:
- Global state is not necessary
- It may complicate unit testing
- It may create hidden dependencies

---

## Strategy Pattern

**Purpose**: Define a family of algorithms, encapsulate each one, and make them interchangeable.

### Implementations

#### 1. Validators (src/validators/)
```typescript
// Base strategy
export abstract class BaseValidator<T> {
  abstract validate(data: T): ValidationResult;
}

// Concrete strategies
export class CreateSessionValidator extends BaseValidator<CreateSessionDTO> {
  validate(data: CreateSessionDTO): ValidationResult {
    // Specific implementation for validating sessions
  }
}

export class SearchCoachValidator extends BaseValidator<SearchCoachDTO> {
  validate(data: SearchCoachDTO): ValidationResult {
    // Specific implementation for validating searches
  }
}
```

**Usage**:
```typescript
// Context that uses the strategies
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
  // In-memory implementation
}

class PersistentCacheStrategy extends CacheStrategy {
  // Persistent localStorage implementation
}
```

### Advantages of Strategy Pattern
- **Flexibility**: Allows changing algorithms at runtime
- **Extensibility**: Easy to add new strategies without modifying existing code
- **Testability**: Each strategy can be tested independently

---

## Observer Pattern

**Purpose**: Define a one-to-many dependency between objects so when one object changes state, all dependents are automatically notified.

### Implementations

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
    
    // Return unsubscribe function
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
    // React to session creation
  }
}
```

#### 2. NotificationService as Observer
```typescript
export class NotificationService {
  constructor() {
    // Subscribe to EventBus events
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

### Benefits of Observer Pattern
- **Decoupling**: Subjects don't know specific details of their observers
- **Dynamic communication**: Observers can subscribe/unsubscribe at runtime
- **Extensibility**: Easy to add new observers without modifying the subject

---

## Factory Pattern

**Purpose**: Create objects without specifying the exact class to create.

### Implementations

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

### Advantages of Factory Pattern
- **Encapsulation**: Creation logic is centralized
- **Flexibility**: Easy to change implementation of created objects
- **Reusability**: Creation logic can be reused

---

## Builder Pattern

**Purpose**: Build complex objects step by step.

### Implementations

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

// Usage:
const sessionDTO = new CreateSessionDTOBuilder()
  .setCoachId('coach-123')
  .setUserId('user-456')
  .setScheduledDate(new Date())
  .setDuration(60)
  .build();
```

#### 2. Query Builder for searches
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

### Benefits of Builder Pattern
- **Readability**: More readable and fluent code
- **Flexibility**: Optional step-by-step construction
- **Validation**: Validation at construction time

---

## Facade Pattern

**Purpose**: Provide a unified interface to a set of interfaces in a subsystem.

### Implementations

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
    // Coordinate multiple operations
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
    // Simplify search with cache
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

### Advantages of Facade Pattern
- **Simplicity**: Simple interface for complex operations
- **Decoupling**: Clients don't depend on internal subsystem classes
- **Maintainability**: Internal changes don't affect clients

---

## Repository Pattern

**Purpose**: Encapsulate data access logic and provide a more object-oriented interface.

### Implementations

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

### Benefits of Repository Pattern
- **Abstraction**: Abstracts data source (database, API, cache)
- **Testability**: Easy to create mocks for testing
- **Maintainability**: Changes in data access don't affect business logic

---

## Command Pattern

**Purpose**: Encapsulate a request as an object, allowing you to parameterize clients with different requests.

### Implementations

#### 1. Use Cases as Commands
```typescript
export interface Command<T, R> {
  execute(input: T): Promise<R>;
}

export class BookSessionUseCase implements Command<CreateSessionDTO, Session> {
  async execute(input: CreateSessionDTO): Promise<Session> {
    // Encapsulated business logic
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

### Advantages of Command Pattern
- **Decoupling**: Invoker doesn't know the receiver
- **Flexibility**: Easy to add new commands
- **Logging/Undo**: Possibility to implement logging and undo operations

---

## Decorator Pattern

**Purpose**: Add functionality to objects dynamically without altering their structure.

### Implementations

#### 1. Logging Decorator for Use Cases
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

// Usage:
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

### Benefits of Decorator Pattern
- **Composition**: Add functionality by composition, not inheritance
- **Flexibility**: Dynamic combinations of functionalities
- **Single Responsibility**: Each decorator has one specific responsibility

---

## Composite Pattern

**Purpose**: Compose objects into tree structures to represent hierarchies.

### Implementations

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

// Usage:
const formValidator = new ValidationComposite();
formValidator.add(new RequiredFieldValidator());
formValidator.add(new EmailValidator());
formValidator.add(new PasswordStrengthValidator());
```

### Benefits of Composite Pattern
- **Uniformity**: Uniform treatment of individual and composite objects
- **Flexibility**: Easy to add new types of components
- **Recursion**: Natural recursive structure

---

## Pattern Summary by File

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

## General Benefits of Implemented Patterns

### 1. **Maintainability**
- More organized and predictable code
- Clear separation of responsibilities
- Easy bug location and fixing

### 2. **Scalability**
- Easy to add new functionality
- Flexible structures that grow with the application
- Code reusability

### 3. **Testability**
- Clearly defined dependencies
- Easy to create mocks and stubs
- Simpler unit testing

### 4. **Readability**
- Self-documenting code
- Recognizable patterns for other developers
- Clear design intent

### 5. **Reusability**
- Reusable components
- Centralized logic
- Avoids code duplication

## Applied Best Practices

1. **Single Responsibility Principle**: Each class has one unique responsibility
2. **Open/Closed Principle**: Classes open for extension, closed for modification
3. **Dependency Inversion**: Dependency on abstractions, not concretions
4. **Interface Segregation**: Specific and cohesive interfaces
5. **Don't Repeat Yourself (DRY)**: Avoid code duplication

## Performance Considerations

- **Singletons**: Single instance reduces memory usage
- **Strategy Pattern**: Allows algorithm-specific optimizations
- **Observer Pattern**: Efficient communication between components
- **Facade Cache**: Reduces repetitive service calls

This set of design patterns provides a solid foundation for continued application development, facilitating the addition of new features and maintenance of existing code.