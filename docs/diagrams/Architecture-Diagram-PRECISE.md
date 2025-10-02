# DIAGRAMA DE ARQUITECTURA PRECISO - 20minCoach Platform

## Arquitectura Real de 15 Layers Implementada

```mermaid
graph TB
    subgraph "🖥️ PRESENTATION LAYER (UI)"
        A1["`**Components Layer**
        📁 src/components/
        • ui/ (Button, Card, Input, Modal, ThemeToggle)
        • auth/ (LoginForm, AuthProvider)
        • coaches/ (CoachCard, CoachList, CoachProfile, CoachSearch)
        • sessions/ (HireCoachButton, VideoCall)
        • dashboard/ (Dashboard, Analytics)`"]

        A2["`**Pages Layer**
        📁 src/pages/
        • Home, CameraTestPage
        • CoachApp (Main Application)
        • Prototype screens`"]
    end

    subgraph "🎮 CONTROLLER LAYER"
        B1["`**Hooks Layer (React Controllers)**
        📁 src/hooks/
        • useAuth.ts (Authentication)
        • useCoachSearch.ts (Coach search)
        • useSessionController.ts (Session mgmt)
        • useWebRTC.ts (Video calls)
        • useUserCredits.tsx (Credits mgmt)
        • useTheme.ts (Theme control)
        • useVoiceSearch.ts (Voice search)`"]
    end

    subgraph "🏢 BUSINESS LAYER"
        C1["`**Business Rules**
        📁 src/business/rules/
        • SessionRules.ts
        • CoachRules.ts`"]

        C2["`**Use Cases (Command Pattern)**
        📁 src/business/useCases/
        • BookSessionUseCase.ts
        • SearchCoachUseCase.ts`"]
    end

    subgraph "🔄 DATA TRANSFORMATION LAYER"
        D1["`**Validators (Strategy Pattern)**
        📁 src/validators/
        • BaseValidator.ts (Interface)
        • CreateSessionValidator.ts
        • SearchCoachValidator.ts`"]

        D2["`**Transformers (Factory Pattern)**
        📁 src/transformers/
        • TransformerFactory.ts
        • CoachTransformer.ts
        • SessionTransformer.ts`"]

        D3["`**DTOs & Types**
        📁 src/types/
        • dtos/ (CreateSessionDTO, SearchCoachDTO)
        • supabase/database.types.ts
        • coach.ts, user.ts`"]
    end

    subgraph "🌐 SERVICE LAYER"
        E1["`**External Services**
        📁 src/services/
        • PaymentService.ts
        • SessionService.ts
        • webRTCSignaling.ts
        • api/coachApi.ts`"]

        E2["`**Security Layer**
        📁 src/lib/
        • supabase.ts (Auth client)
        • Two-Factor Authentication`"]
    end

    subgraph "⚙️ MIDDLEWARE LAYER"
        F1["`**Request/Response Middleware**
        📁 src/middleware/
        • authInterceptor.ts
        • errorHandlerMiddleware.ts
        • permissionsMiddleware.ts
        • enhancedRequestLogger.ts
        • examples/ (Usage templates)`"]
    end

    subgraph "🔄 BACKGROUND LAYER"
        G1["`**Event System (Singleton)**
        📁 src/background/
        • EventBus.ts (Pub/Sub system)
        • NotificationService.ts
        • index.ts (Exports)`"]

        G2["`**Event Listeners (Observer)**
        📁 src/listeners/
        • SessionListener.ts
        • CoachListener.ts
        • listeners.test.ts`"]
    end

    subgraph "📊 DOMAIN LAYER"
        H1["`**Domain Models**
        📁 src/models/
        • User.ts (User model + tests)
        • Coach.ts (Coach model + tests)
        • models.test.ts (Integration tests)
        • index.ts (Exports)`"]
    end

    subgraph "🛠️ INFRASTRUCTURE LAYER"
        I1["`**Utilities (Singleton)**
        📁 src/utils/
        • ConfigManager.ts
        • CacheManager.ts
        • dateFormatter.ts, stringFormatter.ts
        • arrayUtils.ts, objectUtils.ts
        • browserUtils.ts, validationUtils.ts`"]

        I2["`**Error Handling**
        📁 src/error-handling/
        • CustomError.ts (Custom errors)
        • errorHandler.ts
        • CustomError.test.ts`"]

        I3["`**Logging (Strategy)**
        📁 src/logging/
        • logger.ts (Logger with providers)
        • index.ts (Exports)`"]

        I4["`**Styles Layer**
        📁 src/styles/
        • globals.css
        • tailwind.css
        • Component-specific styles`"]
    end

    subgraph "🧪 TESTING LAYER"
        J1["`**Test Infrastructure**
        📁 src/
        • setupTests.ts
        • __mocks__/ (Mocks)
        • 21 test suites, 511 tests
        • Jest + React Testing Library`"]
    end

    subgraph "🏗️ BUILD & DEPLOYMENT"
        K1["`**Configuration**
        📁 Root files
        • vite.config.ts, tsconfig.json
        • .eslintrc.js, jest.config.js
        • .env files (dev/staging/prod)
        • package.json scripts`"]

        K2["`**CI/CD Pipeline**
        📁 .github/workflows/
        • complete-cicd.yml
        • quality-monitoring.yml
        • deploy.yml, ci.yml`"]
    end

    %% ============ LAYER CONNECTIONS ============
    A1 --> B1
    A2 --> B1
    B1 --> C1
    B1 --> C2
    C1 --> D1
    C2 --> D1
    C2 --> D2
    D1 --> D3
    D2 --> D3
    C2 --> E1
    B1 --> E2
    A1 --> F1
    B1 --> F1
    E1 --> F1
    F1 --> G1
    C2 --> G1
    G1 --> G2
    H1 --> C1
    H1 --> C2
    H1 --> D2
    B1 --> I1
    C2 --> I1
    F1 --> I2
    G1 --> I3
    I2 --> I3
    A1 --> I4
    A1 --> J1
    C2 --> J1
    H1 --> J1
    K1 --> A1
    K2 --> K1

    %% ============ DESIGN PATTERNS FLOW ============
    classDef singleton fill:#ff9999
    classDef strategy fill:#99ff99
    classDef observer fill:#9999ff
    classDef factory fill:#ffff99
    classDef command fill:#ff99ff

    class G1 singleton
    class I1 singleton
    class D1 strategy
    class I3 strategy
    class G2 observer
    class D2 factory
    class C2 command
```

## ANÁLISIS DE FLUJO DE DATOS

### 🔄 Flujo Principal de Interacción

1. **UI Components** (A1) → **React Hooks** (B1) → **Use Cases** (C2)
2. **Use Cases** (C2) → **Business Rules** (C1) → **Validators** (D1)
3. **Use Cases** (C2) → **Services** (E1) → **External APIs**
4. **Event System** (G1) → **Listeners** (G2) → **UI Updates** (A1)

### 🏗️ Arquitectura de Capas Detallada

| **Layer**              | **Ubicación**                                                      | **Responsabilidad**                | **Patrones**        |
| ---------------------- | ------------------------------------------------------------------ | ---------------------------------- | ------------------- |
| **1. UI Components**   | `src/components/`                                                  | Presentación React                 | Composite           |
| **2. Pages**           | `src/pages/`                                                       | Navegación y rutas                 | -                   |
| **3. Controllers**     | `src/hooks/`                                                       | Lógica de control                  | -                   |
| **4. Business Rules**  | `src/business/rules/`                                              | Reglas de negocio                  | -                   |
| **5. Use Cases**       | `src/business/useCases/`                                           | Casos de uso                       | Command             |
| **6. Validators**      | `src/validators/`                                                  | Validación de datos                | Strategy            |
| **7. Transformers**    | `src/transformers/`                                                | Transformación datos               | Factory             |
| **8. DTOs/Types**      | `src/types/`                                                       | Definiciones de tipos              | -                   |
| **9. Services**        | `src/services/`                                                    | Servicios externos                 | Repository          |
| **10. Security**       | `src/lib/`                                                         | Autenticación/Autorización         | -                   |
| **11. Middleware**     | `src/middleware/`                                                  | Interceptores                      | Decorator           |
| **12. Background**     | `src/background/`                                                  | Sistema de eventos                 | Singleton           |
| **13. Listeners**      | `src/listeners/`                                                   | Observadores de eventos            | Observer            |
| **14. Models**         | `src/models/`                                                      | Modelos de dominio                 | -                   |
| **15. Infrastructure** | `src/utils/`, `src/error-handling/`, `src/logging/`, `src/styles/` | Utilidades, errores, logs, estilos | Singleton, Strategy |

### 🔗 Dependencias Entre Capas

```
Components (1,2)
    ↓
Controllers (3)
    ↓
Business Logic (4,5)
    ↓
Data Layer (6,7,8)
    ↓
Services (9,10)
    ↓
Middleware (11)
    ↓
Background (12,13)
    ↓
Domain (14)
    ↓
Infrastructure (15)
```

### 📊 Métricas de Implementación

- **Total de Clases**: 25+ clases principales
- **Interfaces Definidas**: 15+ interfaces
- **Patrones Implementados**: 10 patrones
- **Tests Implementados**: 511 tests en 21 suites
- **Cobertura de Código**: 80%+
- **Archivos de Configuración**: 15+ archivos

### 🎯 Principios Arquitectónicos Aplicados

1. **Separation of Concerns**: Cada layer tiene responsabilidad única
2. **Dependency Inversion**: Layers superiores dependen de abstracciones
3. **Single Responsibility**: Cada clase tiene una razón para cambiar
4. **Open/Closed Principle**: Abierto para extensión, cerrado para modificación
5. **Interface Segregation**: Interfaces específicas por funcionalidad
