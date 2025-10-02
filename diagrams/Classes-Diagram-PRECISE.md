# DIAGRAMA DE CLASES PRECISO - 20minCoach Platform

## Implementación Real Post-Desarrollo Completo

```mermaid
classDiagram
    %% ============ DOMAIN MODELS ============
    class User {
        +string id
        +string email
        +string name
        +UserRole role
        +boolean hasActiveSubscription
        +number sessionsRemaining
        +validateRole() boolean
    }

    class Coach {
        +string id
        +string name
        +number rating
        +string[] specialties
        +boolean isAvailable
        -number sessionsToday
        -number minimumRating
        -number maxSessionsPerDay
        +canAcceptSession() boolean
        +calculateEarnings(sessions, tierMultiplier) number
    }

    class Session {
        +string id
        +string coachId
        +string userId
        +Date scheduledAt
        +number duration
        +string status
        +book() void
        +cancel() void
        +complete() void
    }

    %% ============ BUSINESS LAYER ============
    class SessionRules {
        +canUserBookSession(user: User, coach: Coach) boolean
        +validateSessionTime(requestedTime: Date) boolean
        +calculateSessionCost(coach: Coach, duration: number) number
        +checkUserCredits(user: User, cost: number) boolean
        +validateCoachAvailability(coach: Coach) boolean
    }

    class CoachRules {
        +canUpdateProfile(coach: Coach) boolean
        +validateSpecialization(specialty: string) boolean
        +checkRating(rating: number) boolean
        +calculateTierMultiplier(rating: number) number
    }

    class BookSessionUseCase {
        +execute(request: BookSessionRequest) Promise~BookSessionResponse~
        -validateRequest(request) ValidationResult
        -createSession(coach, user, time) Session
        -processPayment(cost) PaymentResult
        -notifyParticipants(session) void
    }

    class SearchCoachUseCase {
        +execute(request: SearchCoachRequest) Promise~SearchCoachResponse~
        -buildCriteria(filters) SearchCriteria
        -filterByAvailability(coaches) Coach[]
        -sortByRelevance(coaches, criteria) Coach[]
        -transformToDTO(coaches) CoachSummaryDTO[]
    }

    %% ============ VALIDATORS (Strategy Pattern) ============
    class BaseValidator~T~ {
        <<interface>>
        +validate(data: T) ValidationResult
    }

    class CreateSessionValidator {
        +validate(dto: CreateSessionDTO) ValidationResult
        -validateCoachId(id: string) boolean
        -validateDateTime(date: Date) boolean
        -validateDuration(duration: number) boolean
        -validateNotes(notes: string) boolean
    }

    class SearchCoachValidator {
        +validate(dto: SearchCoachDTO) ValidationResult
        -validateRating(rating: number) boolean
        -validatePrice(price: number) boolean
        -validateSpecialization(spec: string) boolean
        -validateLocation(location: string) boolean
    }

    %% ============ TRANSFORMERS (Factory Pattern) ============
    class TransformerFactory {
        +createCoachTransformer() CoachTransformer
        +createSessionTransformer() SessionTransformer
        +createUserTransformer() UserTransformer
    }

    class CoachTransformer {
        +toDTO(coach: Coach) CoachSummaryDTO
        +fromDTO(dto: CoachDetailDTO) Coach
        +toListItem(coach: Coach) CoachListItemDTO
        +toProfileView(coach: Coach) CoachProfileDTO
    }

    class SessionTransformer {
        +toDTO(session: Session) SessionDTO
        +fromDTO(dto: CreateSessionDTO) Session
        +toCalendarItem(session: Session) CalendarItemDTO
        +toReceiptView(session: Session) ReceiptDTO
    }

    %% ============ SERVICES LAYER ============
    class PaymentService {
        +processPayment(amount: number, userId: string) Promise~PaymentResult~
        +refundPayment(sessionId: string) Promise~RefundResult~
        +validateCreditCard(cardData: CardData) ValidationResult
        +calculateTaxes(amount: number, region: string) number
    }

    class SessionService {
        +createSession(sessionData: CreateSessionDTO) Promise~Session~
        +updateSession(sessionId: string, updates: UpdateSessionDTO) Promise~Session~
        +cancelSession(sessionId: string) Promise~void~
        +getSessionHistory(userId: string) Promise~Session[]~
    }

    %% ============ HOOKS (Controllers) ============
    class UseAuth {
        +User user
        +boolean isLoading
        +boolean isAuthenticated
        +login(email: string, password: string) Promise~void~
        +logout() void
        +register(userData: RegisterData) Promise~void~
        +refreshToken() Promise~void~
    }

    class UseCoachSearch {
        +Coach[] coaches
        +boolean isLoading
        +SearchFilters searchCriteria
        +search(criteria: SearchCoachDTO) void
        +clearResults() void
        +filterBySpecialty(specialty: string) void
        +sortByRating() void
    }

    class UseSessionController {
        +Session[] sessions
        +boolean isLoading
        +createSession(data: CreateSessionDTO) Promise~Session~
        +cancelSession(sessionId: string) Promise~void~
        +getSessionHistory() Promise~Session[]~
        +refreshSessions() void
    }

    %% ============ BACKGROUND SERVICES (Singleton) ============
    class EventBus {
        -EventBus instance$
        -Map~string, EventListener[]~ listeners
        -Event[] eventHistory
        -number maxHistorySize
        +getInstance()$ EventBus
        +publish(eventType: string, payload: any) void
        +subscribe(eventType: string, callback: Function) string
        +unsubscribe(listenerId: string) void
        +clearAllListeners() void
        +getEventHistory() Event[]
    }

    class NotificationService {
        -NotificationService instance$
        -NotificationTemplate[] templates
        -INotificationProvider[] providers
        +getInstance()$ NotificationService
        +sendNotification(payload: NotificationPayload) Promise~void~
        +addTemplate(template: NotificationTemplate) void
        +addProvider(provider: INotificationProvider) void
    }

    %% ============ MIDDLEWARE ============
    class AuthInterceptor {
        +intercept(request: Request) Promise~Request~
        +handleResponse(response: Response) Promise~Response~
        -addAuthHeaders(request: Request) Request
        -validateToken(token: string) boolean
        -refreshToken() Promise~string~
    }

    class ErrorHandlerMiddleware {
        +handleError(error: Error) void
        +logError(error: Error) void
        +notifyError(error: Error) void
        +formatError(error: Error) ErrorResponse
        -determineErrorType(error: Error) ErrorType
        -shouldRetry(error: Error) boolean
    }

    class PermissionsMiddleware {
        +checkPermissions(user: User, action: string) boolean
        +hasRole(user: User, requiredRole: string) boolean
        +canAccessResource(user: User, resource: string) boolean
        -getUserPermissions(user: User) string[]
    }

    %% ============ UTILITIES (Singleton) ============
    class ConfigManager {
        -ConfigManager instance$
        -Map~string, any~ config
        +getInstance()$ ConfigManager
        +get(key: string) any
        +set(key: string, value: any) void
        +getEnvironment() string
        +isProduction() boolean
    }

    class CacheManager {
        -CacheManager instance$
        -Map~string, CacheItem~ cache
        +getInstance()$ CacheManager
        +set(key: string, value: any, ttl: number) void
        +get(key: string) any
        +delete(key: string) void
        +clear() void
        +size() number
    }

    %% ============ ERROR HANDLING ============
    class CustomError {
        +string message
        +string code
        +string friendlyMessage
        +ErrorMetadata metadata
        +static validation(message: string) CustomError
        +static database(message: string) CustomError
        +static businessLogic(message: string, friendlyMessage: string) CustomError
        +static externalService(message: string, serviceName: string) CustomError
        +shouldShowToUser() boolean
        +getUserMessage() string
        +toLogObject() object
    }

    %% ============ LOGGING (Strategy Pattern) ============
    class Logger {
        -ILogProvider[] providers
        +addProvider(provider: ILogProvider) void
        +info(message: string, context: LogContext) void
        +warn(message: string, context: LogContext) void
        +error(message: string, error: Error, context: LogContext) void
        +debug(message: string, context: LogContext) void
        -formatMessage(level: string, message: string, context: LogContext) LogEntry
    }

    class ConsoleLogProvider {
        +log(entry: LogEntry) void
        +formatForConsole(entry: LogEntry) string
    }

    class RemoteLogProvider {
        +log(entry: LogEntry) Promise~void~
        +batchLogs(entries: LogEntry[]) Promise~void~
        +formatForRemote(entry: LogEntry) object
    }

    %% ============ LISTENERS (Observer Pattern) ============
    class SessionListener {
        +handleSessionCreated(session: Session) void
        +handleSessionCancelled(session: Session) void
        +handleSessionCompleted(session: Session) void
        +subscribeToEvents() void
        +unsubscribeFromEvents() void
    }

    class CoachListener {
        +handleCoachAvailabilityChanged(coach: Coach) void
        +handleCoachRatingUpdated(coach: Coach) void
        +handleCoachProfileUpdated(coach: Coach) void
        +subscribeToEvents() void
        +notifyClientsOfAvailability(coach: Coach) void
    }

    %% ============ DTO INTERFACES ============
    class CreateSessionDTO {
        +string coachId
        +string userId
        +Date scheduledAt
        +number duration
        +string notes
        +validate() ValidationResult
    }

    class SearchCoachDTO {
        +string specialization
        +number minRating
        +number maxHourlyRate
        +boolean availability
        +string location
        +validate() ValidationResult
    }

    class CoachSummaryDTO {
        +string id
        +string name
        +number rating
        +string[] specialties
        +boolean isAvailable
        +number hourlyRate
    }

    %% ============ DESIGN PATTERNS RELATIONSHIPS ============

    %% Singleton Pattern
    EventBus --> EventBus : instance$
    NotificationService --> NotificationService : instance$
    ConfigManager --> ConfigManager : instance$
    CacheManager --> CacheManager : instance$

    %% Strategy Pattern
    BaseValidator <|-- CreateSessionValidator
    BaseValidator <|-- SearchCoachValidator
    ILogProvider <|-- ConsoleLogProvider
    ILogProvider <|-- RemoteLogProvider

    %% Observer Pattern
    EventBus --> SessionListener : notifies
    EventBus --> CoachListener : notifies
    SessionListener --> EventBus : subscribes
    CoachListener --> EventBus : subscribes

    %% Factory Pattern
    TransformerFactory --> CoachTransformer : creates
    TransformerFactory --> SessionTransformer : creates

    %% Command Pattern
    BookSessionUseCase --> SessionRules : uses
    BookSessionUseCase --> SessionService : executes
    SearchCoachUseCase --> CoachRules : uses

    %% Repository Pattern (Services as Repositories)
    SessionService --> Session : manages
    PaymentService --> PaymentResult : processes

    %% ============ DOMAIN RELATIONSHIPS ============
    User ||--o{ Session : books
    Coach ||--o{ Session : provides
    Session --> Coach : references
    Session --> User : references

    %% ============ BUSINESS LAYER RELATIONSHIPS ============
    BookSessionUseCase --> SessionRules : validates
    BookSessionUseCase --> PaymentService : processes payment
    BookSessionUseCase --> EventBus : publishes events
    SearchCoachUseCase --> CoachRules : applies rules
    SearchCoachUseCase --> CacheManager : caches results

    %% ============ CONTROLLER RELATIONSHIPS ============
    UseAuth --> User : manages
    UseCoachSearch --> Coach : searches
    UseCoachSearch --> SearchCoachUseCase : delegates
    UseSessionController --> Session : controls
    UseSessionController --> BookSessionUseCase : delegates

    %% ============ MIDDLEWARE RELATIONSHIPS ============
    AuthInterceptor --> User : authenticates
    PermissionsMiddleware --> User : authorizes
    ErrorHandlerMiddleware --> CustomError : handles
    ErrorHandlerMiddleware --> Logger : logs

    %% ============ TRANSFORMATION RELATIONSHIPS ============
    CoachTransformer --> Coach : transforms
    CoachTransformer --> CoachSummaryDTO : produces
    SessionTransformer --> Session : transforms
    SessionTransformer --> CreateSessionDTO : consumes

    %% ============ VALIDATION RELATIONSHIPS ============
    CreateSessionValidator --> CreateSessionDTO : validates
    SearchCoachValidator --> SearchCoachDTO : validates
    SessionRules --> CreateSessionValidator : uses
    CoachRules --> SearchCoachValidator : uses

    %% ============ LOGGING RELATIONSHIPS ============
    Logger --> ILogProvider : delegates
    Logger --> ConsoleLogProvider : uses
    Logger --> RemoteLogProvider : uses
    CustomError --> Logger : logs errors
    EventBus --> Logger : logs events

    %% ============ TYPE ENUMS ============
    class UserRole {
        <<enumeration>>
        BasicUser
        PremiumUser
        AdminUser
    }

    class ErrorSeverity {
        <<enumeration>>
        LOW
        MEDIUM
        HIGH
        CRITICAL
    }

    class EventTypes {
        <<enumeration>>
        SESSION_BOOKED
        SESSION_CANCELLED
        COACH_AVAILABLE
        USER_REGISTERED
        PAYMENT_PROCESSED
    }

    User --> UserRole : has
    CustomError --> ErrorSeverity : categorizes
    EventBus --> EventTypes : publishes
```

## IMPLEMENTACIÓN DE PATRONES DE DISEÑO

### 1. Singleton Pattern

- **EventBus**: Sistema global de eventos
- **NotificationService**: Servicio centralizado de notificaciones
- **ConfigManager**: Gestión global de configuración
- **CacheManager**: Cache centralizado de la aplicación

### 2. Strategy Pattern

- **BaseValidator**: Interface común para validadores
- **ILogProvider**: Estrategias de logging (Console, Remote)
- **CacheStrategy**: Diferentes estrategias de cache

### 3. Observer Pattern

- **EventBus + Listeners**: Pub/Sub para eventos del sistema
- **SessionListener**: Observer de eventos de sesión
- **CoachListener**: Observer de cambios de coach

### 4. Factory Pattern

- **TransformerFactory**: Crea transformadores de datos
- **UseCaseFactory**: Crea casos de uso del negocio

### 5. Command Pattern

- **BookSessionUseCase**: Comando para reservar sesión
- **SearchCoachUseCase**: Comando para buscar coaches

### 6. Repository Pattern

- **SessionService**: Repositorio de sesiones
- **PaymentService**: Repositorio de pagos

### 7. Builder Pattern

- **DTOBuilder**: Construcción de DTOs complejos
- **QueryBuilder**: Construcción de queries de búsqueda

### 8. Facade Pattern

- **AuthFacade**: Simplifica operaciones de autenticación
- **SessionFacade**: Simplifica gestión de sesiones

### 9. Decorator Pattern

- **LoggingDecorator**: Añade logging a servicios
- **CacheDecorator**: Añade cache a operaciones

### 10. Composite Pattern

- **Component Hierarchy**: Jerarquía de componentes UI
- **BusinessRules**: Composición de reglas de negocio

## RELACIONES CLAVE

### Flujo Principal de Negocio

1. **User** → **UseSessionController** → **BookSessionUseCase**
2. **BookSessionUseCase** → **SessionRules** → **CreateSessionValidator**
3. **BookSessionUseCase** → **PaymentService** → **SessionService**
4. **EventBus** notifica **SessionListener** y **CoachListener**

### Flujo de Búsqueda

1. **User** → **UseCoachSearch** → **SearchCoachUseCase**
2. **SearchCoachUseCase** → **CoachRules** → **SearchCoachValidator**
3. **CoachTransformer** → **CoachSummaryDTO** → **UI Components**

### Manejo de Errores

1. **Any Layer** → **CustomError** → **ErrorHandlerMiddleware**
2. **ErrorHandlerMiddleware** → **Logger** → **LogProvider**
3. **Logger** → **EventBus** → **NotificationService**

### Sistema de Eventos

1. **Business Layer** → **EventBus** → **Listeners**
2. **Listeners** → **NotificationService** → **UI Updates**
3. **CacheManager** invalida cache según eventos
