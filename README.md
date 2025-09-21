# 20minCoach - Frontend Architecture Design

## Course Information
- **Course**: Diseño de Software GR 2
- **Professor**: Rodrigo Nuñez Nuñez
- **Team Members**: 
  - Lee-Sang-cheol 2024081079
  - Rafael-Araya-Álvarez 2023029575  
  - [Member 3 Name]

## Project Description
20minCoach is a real-time coaching platform that connects users with experts across multiple fields through on-demand 20-minute video sessions. This repository contains the frontend architecture design and implementation for the platform.

## Case Resolution Tasks

### Core Tasks to Perform

#### 1. Proof of Concepts (PoCs)
- [ ] **Frontend Source Code Structure**
  - Complete project structure in `/src` folder
  - All PoC source code and requested classes
  - Templates and guidance files in correct layer folders

- [ ] **Testing Strategy**
  - Design testing strategy focusing on unit testing
  - Implement three unit tests for two different classes
  - Add testing scripts with pass/fail proof
  - Instructions for adding and running new unit tests

- [ ] **UX & Security**
  - Generate AI prototype screen for coach search and results
  - Conduct UX testing with 3-5 participants
  - Implement authentication and authorization with roles (BasicUser, PremiumUser)
  - Enable Two-Factor Authentication
  - Integrate login screen with role-based permissions

### Design Document Requirements

## 2. Technology Selection & Justification

### Frontend Framework
**Choice: React**  
- **Justification:** We selected React due to its popularity and versatility, enabling seamless integration with other libraries. It boasts an extensive ecosystem and large community support. Its component-based architecture perfectly aligns with the need to build a modular and reusable interface for our application.

### Styling Library
**Choice: Tailwind CSS**  
- **Justification:** We chose Tailwind CSS for its utility-first approach, which allows for rapid UI development directly within HTML/JSX. It is excellent for crafting custom designs and provides full control over the appearance, while also offering accessible interactive components.

### State Management
**Choice: Redux Toolkit & TanStack Query**  
- **Justification:** Redux Toolkit was selected for managing complex client-side state (user sessions, coach listings). TanStack Query was chosen to handle server-state, data fetching, and caching from APIs. Combining these technologies creates a powerful and scalable state management strategy.

### Real-Time Communication
**Choice: WebSocket (Socket.io) & WebRTC**  
- **Justification:** WebSockets (via Socket.io) are essential for real-time notifications. WebRTC enables peer-to-peer audio and video communication with low latency, critical for the core 20-minute coaching sessions.

### Testing Tools
**Choice: Jest & React Testing Library**  
- **Justification:** Jest serves as our test runner. React Testing Library tests components by simulating user behavior, ensuring tests are maintainable and user-centric.

### Authentication Provider
**Choice: Auth0**  
- **Justification:** Auth0 was selected for its robustness, professional feature set, and generous free tier. Its excellent documentation makes it ideal for implementing secure login and role-based authorization.

### Linter & Formatter
**Choice: ESLint & Prettier**  
- **Justification:** ESLint ensures code quality and consistency. Prettier automatically formats code, enforcing a consistent style and improving readability across the project.



## 3. N-Layer Architecture Design

# Overview
We have designed a layered architecture to ensure separation of concerns, maintainability, and scalability. The following diagram illustrates the high-level structure and flow between layers:

## Layer Details

### 1. UI Components Layer
- **Responsibility**: Maintain reusable and presentational UI components
- **Communication**: Receives props from controllers and emits events
- **Patterns**: Functional Components, Compound Components
- **Examples**: `CoachCard`, `SessionButton`, `VideoCallInterface`

### 2. Controllers Layer
- **Responsibility**: Mediates between UI and business logic, handles events
- **Communication**: Uses custom hooks to connect with business layer and state management
- **Patterns**: Custom Hooks, Container Components
- **Examples**: `useSessionController`, `useCoachSearch`

### 3. Model Layer
- **Responsibility**: Defines data structures and basic validation
- **Communication**: Used by all layers that manipulate data
- **Patterns**: TypeScript Interfaces, Validation Classes
- **Examples**: `User`, `Coach`, `Session` interfaces

### 4. Middleware Layer
- **Responsibility**: Intercepts requests and responses, validates permissions, handles errors
- **Communication**: Integrated into the API Client flow
- **Patterns**: Interceptor, Chain of Responsibility
- **Examples**: `authInterceptor`, `errorHandlerMiddleware`

### 5. Business Layer
- **Responsibility**: Contains business logic and specific domain rules
- **Communication**: Invoked by controllers, uses API Client and State Management
- **Patterns**: Services, Domain-Driven Design
- **Examples**: `SessionService`, `PaymentService`

### 6. API Client Layer
- **Responsibility**: Abstracts API calls to the backend
- **Communication**: Receives requests from business layer and returns data
- **Patterns**: Adapter, Singleton
- **Examples**: `apiClient` with methods for each endpoint

### 7. Background Jobs/Listeners Layer
- **Responsibility**: Handles real-time updates and periodic tasks
- **Communication**: Uses WebSockets, connects to State Management
- **Patterns**: Observer, Pub/Sub
- **Examples**: `notificationListener`, `dataRefreshScheduler`

### 8. Validators Layer
- **Responsibility**: Validates input data and models
- **Communication**: Used by Model Layer and Middleware
- **Patterns**: Strategy
- **Examples**: `userValidator`, `sessionValidator` using Zod

### 9. DTOs Layer
- **Responsibility**: Defines objects for data transfer to the backend
- **Communication**: Transforms between DTOs and Models
- **Patterns**: Data Transfer Object, Mapper
- **Examples**: `CreateSessionDTO`, `CoachResponseDTO`

### 10. State Management Layer
- **Responsibility**: Manages the entire application state
- **Communication**: Provides state to application components
- **Patterns**: Flux, Context API
- **Examples**: `authSlice`, `coachesSlice`

### 11. Styles Layer
- **Responsibility**: Manages CSS styles and responsive design
- **Communication**: Applied directly to components
- **Patterns**: Utility-First (Tailwind), CSS Modules
- **Examples**: Tailwind classes, `components/Button/styles.module.css`

### 12. Utilities Layer
- **Responsibility**: Reusable helper functions
- **Communication**: Used by multiple layers
- **Patterns**: Singleton
- **Examples**: `dateFormatter`, `urlHelper`

### 13. Exception Handling Layer
- **Responsibility**: Standard exception and error handling
- **Communication**: Captures errors and passes them to the Logging layer
- **Patterns**: Global Error Boundary, Custom Exception classes
- **Examples**: `AppErrorBoundary`, `CustomError` class

### 14. Logging Layer
- **Responsibility**: Structured logging of events and errors
- **Communication**: Used by Exception Handling and Middleware
- **Patterns**: Strategy
- **Examples**: `logger` with `info`, `warn`, `error` methods

### 15. Security Layer
- **Responsibility**: Authentication and authorization
- **Communication**: Integrates with Auth0, provides tokens to API Client
- **Patterns**: Adapter
- **Examples**: `authService`

## Architecture Validation

The communication flow between layers has been verified to ensure proper functionality:

1. **UI Components** → **Controllers**: Components use controller hooks for business logic
2. **Controllers** → **Business Layer**: Controllers invoke business services
3. **Business Layer** → **API Client**: Business logic makes API calls through the client
4. **API Client** ↔ **Middleware**: All API calls pass through middleware for interception
5. **Business Layer** ↔ **State Management**: Business logic reads/writes to global state
6. **Background Jobs** → **State Management**: Real-time updates modify application state
7. **Validators** → **Model/Middleware**: Validation used for data integrity and request validation
8. **DTOs** ↔ **API Client/Models**: Transformation between API and application models
9. **Exception Handling** → **Logging**: Errors are captured and logged
10. **Security** → **API Client**: Auth tokens are provided for API authentication

This architecture ensures:
- Clear separation of concerns
- Testability of individual components
- Scalability through modular design
- Maintainability with well-defined interfaces
- Reusability of components across the application

## Project Structure

src/
├── components/ # UI Components Layer 
│ ├── common/ # Reusable common components 
│ │ ├── Button/
│ │ │ ├── Button.tsx
│ │ │ ├── Button.test.tsx
│ │ │ └── index.ts
│ │ ├── Card/
│ │ │ ├── Card.tsx
│ │ │ ├── Card.test.tsx
│ │ │ └── index.ts
│ │ └── Modal/
│ │ ├── Modal.tsx
│ │ ├── Modal.test.tsx
│ │ └── index.ts
│ ├── coaches/ # Coach-specific components
│ │ ├── CoachCard/
│ │ │ ├── CoachCard.tsx
│ │ │ ├── CoachCard.test.tsx
│ │ │ └── index.ts
│ │ ├── CoachList/
│ │ │ ├── CoachList.tsx
│ │ │ ├── CoachList.test.tsx
│ │ │ └── index.ts
│ │ └── CoachProfile/
│ │ ├── CoachProfile.tsx
│ │ ├── CoachProfile.test.tsx
│ │ └── index.ts
│ └── sessions/ # Session-specific components
│ ├── SessionButton/
│ │ ├── SessionButton.tsx
│ │ ├── SessionButton.test.tsx
│ │ └── index.ts
│ ├── VideoCallInterface/
│ │ ├── VideoCallInterface.tsx
│ │ ├── VideoCallInterface.test.tsx
│ │ └── index.ts
│ └── SessionHistory/
│ ├── SessionHistory.tsx
│ ├── SessionHistory.test.tsx
│ └── index.ts
├── hooks/ # Controllers Layer - Custom hooks
│ ├── useSessionController.ts
│ ├── useCoachSearch.ts
│ ├── useAuth.ts
│ └── index.ts
├── models/ # Model Layer
│ ├── User.ts
│ ├── Coach.ts
│ ├── Session.ts
│ └── index.ts
├── middleware/ # Middleware Layer
│ ├── authInterceptor.ts
│ ├── errorHandlerMiddleware.ts
│ ├── requestLogger.ts
│ └── index.ts
├── services/ # Business Layer
│ ├── api/ # API Client Layer
│ │ ├── apiClient.ts
│ │ ├── coachApi.ts
│ │ ├── sessionApi.ts
│ │ └── index.ts
│ ├── realtime/ # Background Jobs/Listeners Layer
│ │ ├── notificationListener.ts
│ │ ├── dataRefreshScheduler.ts
│ │ └── index.ts
│ ├── SessionService.ts
│ ├── PaymentService.ts
│ └── index.ts
├── validators/ # Validators Layer
│ ├── userValidator.ts
│ ├── sessionValidator.ts
│ └── index.ts
├── types/ # DTOs Layer
│ ├── CreateSessionDTO.ts
│ ├── CoachResponseDTO.ts
│ └── index.ts
├── store/ # State Management Layer - Redux store
│ ├── slices/
│ │ ├── authSlice.ts
│ │ ├── coachesSlice.ts
│ │ └── sessionsSlice.ts
│ ├── index.ts
│ └── store.ts
├── styles/ # Styles Layer
│ ├── globals.css
│ ├── tailwind.css
│ └── components/
│ └── Button/
│ └── styles.module.css
├── utils/ # Utilities Layer
│ ├── dateFormatter.ts
│ ├── urlHelper.ts
│ └── index.ts
├── error-handling/ # Exception Handling Layer
│ ├── AppErrorBoundary.tsx
│ ├── CustomError.ts
│ └── index.ts
├── logging/ # Logging Layer
│ ├── logger.ts
│ └── index.ts
├── auth/ # Security Layer - Auth0 integration
│ ├── authService.ts
│ ├── AuthProvider.tsx
│ └── index.ts
└── index.ts


### Key File Descriptions

- **components/**: Contains all React components organized by feature
- **hooks/**: Custom React hooks for business logic and state management
- **models/**: TypeScript interfaces and classes for data structures
- **middleware/**: Request/response interceptors and error handling
- **services/**: Business logic services and API client implementation
- **validators/**: Data validation utilities using Zod
- **types/**: Data Transfer Object (DTO) definitions
- **store/**: Redux store configuration and slices
- **styles/**: Global styles and component-specific CSS modules
- **utils/**: Helper functions and utilities
- **error-handling/**: Custom error classes and error boundary component
- **logging/**: Structured logging implementation
- **auth/**: Authentication service and context provider

This structure follows the layered architecture design and ensures separation of concerns while maintaining a clean and organized codebase.

## Diagrams

### Diagram N-Layers
![alt text](<Architecture Diagram.jpg>)
### Diagram Classes
![alt text](<Classes Diagram.jpg>)

## 4. Visual Components Strategy
- [ ] Develop component organization strategy
- [ ] Design reusable component library structure
- [ ] Create component development workflow
- [ ] Establish component testing methodology

### Detailed Layer Design Requirements

The following layers must be implemented in the frontend architecture:

- [ ] **Visual Components** - Component hierarchy and reusable UI components
- [ ] **Controllers** - Business logic mediation and user input validation
- [ ] **Model** - Model classes with validation
- [x] **Middleware** - Request/response interceptors, permissions, error handling, logging *(See section below)*
- [ ] **Business** - Domain-driven design and business logic services
- [ ] **Proxy/Client/Services** - API client abstraction layer
- [ ] **Background/Jobs/Listeners** - Real-time updates and data refresh
- [ ] **Validators** - Input and data validation
- [ ] **DTOs** - Data Transfer Objects for API communication
- [ ] **State Management** - State management solution implementation
- [ ] **Styles** - CSS management and responsive design
- [ ] **Utilities** - Utility functions and helpers
- [ ] **Exception Handling** - Standardized exception handling
- [ ] **Logging** - Structured logging system
- [ ] **Security** - Authentication and authorization layers
- [ ] **Linter Configuration** - Code style rules and conventions
- [ ] **Build and Deployment Pipeline** - Build process for different environments

## Current Implementation Status

### ✅ Middleware Layer

The middleware layer has been designed and documented to handle cross-cutting concerns in the application. This layer provides:

1. **Request/Response Interceptors** - Automatic token attachment and header management
2. **Permissions Validation** - Role-based access control for protected routes
3. **Error Handling** - Centralized exception management with user-friendly messages
4. **Logging Events** - Strategy pattern implementation for flexible logging providers


### Project Structure
```
20minCoach/
├── README.md
├── docs/
│   └── middleware.md
├── src/
│   ├── middleware/
│   │   ├── interceptors.js
│   │   ├── permissionsMiddleware.js
│   │   ├── errorHandler.js
│   │   └── loggingMiddleware.js
│   └── [other layers to be implemented]
└── diagrams/
    └── [architecture diagrams]
```

## Deliverables

### Repository Requirements
- GitHub/GitLab repository with proper structure
- Comprehensive documentation in README.md
- Architecture diagrams in `/diagrams` folder
- Complete project structure in `/src` folder
- All proof of concepts implemented

### Documentation Requirements
- All sections from project brief documented
- Clear explanations and justifications
- Diagrams and visual aids
- Code snippets and examples

### Architecture Diagrams
- N-Layer architecture diagram
- Object design with design patterns
- Class responsibilities and interactions
- Full architecture diagram in PDF format

## Important Dates
- **Questions Deadline**: Monday, September 22nd
- **Final Commit**: Saturday, September 27th

---

*Note: Commits will be reviewed to validate participation from all team members throughout the 3-week work period. Penalties may apply for insufficient participation.*




