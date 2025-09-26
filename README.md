# 20minCoach - Frontend Architecture Design

## Course Information
- **Course**: Diseño de Software GR 2
- **Professor**: Rodrigo Nuñez Nuñez
- **Team Members**: 
  - Lee-Sang-cheol 2024081079
  - Rafael-Araya-Álvarez 2023029575  
  - Kenneth-Rojas-Jiménez 2021466579
  - Otto Segura Ruiz 2020426226

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
### Technology Comparison Table

| Aspect | React (Selected) ✅ | Vue.js | Angular |
|--------|-------------------|---------|----------|
| **Learning Curve** | Moderate - JSX requires learning | Easy - Template syntax familiar | Steep - Full framework |
| **Performance** | Virtual DOM, Fast with optimization | Virtual DOM, Slightly faster | Real DOM manipulation, heavier |
| **Ecosystem** | Massive - NPM packages, community | Growing rapidly | Complete built-in solutions |
| **Real-time Support** | Excellent with Socket.io/WebRTC | Good support | Good support |
| **State Management** | Redux, Context API, Zustand | Vuex, Pinia | Built-in RxJS |
| **TypeScript Support** | Excellent | Good | Native (built with TS) |
| **Component Reusability** | High - Functional components | High - SFC | High - But more complex |
| **Bundle Size** | ~42KB | ~34KB | ~130KB |
| **Job Market** | Highest demand | Growing | Enterprise focused |
| **Testing** | Jest, RTL mature ecosystem | Vue Test Utils | Jasmine/Karma built-in |

**Decision:** React was chosen for its mature ecosystem, extensive community support, and alignment with our team's expertise.

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
```
src/
├── components/                 # UI Components Layer
│   ├── ui/                    # Componentes de UI reutilizables
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   │   ├── Input.tsx
│   │   │   ├── Input.test.tsx
│   │   │   ├── Input.stories.tsx
│   │   │   └── index.ts
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   ├── Card.test.tsx
│   │   │   ├── Card.stories.tsx
│   │   │   └── index.ts
│   │   └── Modal/
│   │       ├── Modal.tsx
│   │       ├── Modal.test.tsx
│   │       ├── Modal.stories.tsx
│   │       └── index.ts
│   ├── layout/                # Componentes de layout
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.test.tsx
│   │   │   └── index.ts
│   │   ├── Footer/
│   │   │   ├── Footer.tsx
│   │   │   ├── Footer.test.tsx
│   │   │   └── index.ts
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Sidebar.test.tsx
│   │   │   └── index.ts
│   │   └── PageContainer/
│   │       ├── PageContainer.tsx
│   │       ├── PageContainer.test.tsx
│   │       └── index.ts
│   ├── coaches/               # Componentes específicos de coaches
│   │   ├── CoachCard/
│   │   │   ├── CoachCard.tsx
│   │   │   ├── CoachCard.test.tsx
│   │   │   └── index.ts
│   │   ├── CoachList/
│   │   │   ├── CoachList.tsx
│   │   │   ├── CoachList.test.tsx
│   │   │   └── index.ts
│   │   ├── CoachProfile/
│   │   │   ├── CoachProfile.tsx
│   │   │   ├── CoachProfile.test.tsx
│   │   │   └── index.ts
│   │   └── CoachSearch/
│   │       ├── CoachSearch.tsx
│   │       ├── CoachSearch.test.tsx
│   │       └── index.ts
│   ├── sessions/              # Componentes específicos de sesiones
│   │   ├── SessionButton/
│   │   │   ├── SessionButton.tsx
│   │   │   ├── SessionButton.test.tsx
│   │   │   └── index.ts
│   │   ├── SessionHistory/
│   │   │   ├── SessionHistory.tsx
│   │   │   ├── SessionHistory.test.tsx
│   │   │   └── index.ts
│   │   ├── SessionScheduler/
│   │   │   ├── SessionScheduler.tsx
│   │   │   ├── SessionScheduler.test.tsx
│   │   │   └── index.ts
│   │   └── VideoCallInterface/
│   │       ├── VideoCallInterface.tsx
│   │       ├── VideoCallInterface.test.tsx
│   │       └── index.ts
│   └── auth/                  # Componentes de autenticación
│       ├── LoginForm/
│       │   ├── LoginForm.tsx
│       │   ├── LoginForm.test.tsx
│       │   └── index.ts
│       ├── RegisterForm/
│       │   ├── RegisterForm.tsx
│       │   ├── RegisterForm.test.tsx
│       │   └── index.ts
│       └── AuthProvider/
│           ├── AuthProvider.tsx
│           ├── AuthProvider.test.tsx
│           └── index.ts
├── hooks/                     # Controllers Layer - Custom hooks
│   ├── useSessionController.ts
│   ├── useCoachSearch.ts
│   ├── useAuth.ts
│   └── index.ts
├── models/                    # Model Layer
│   ├── User.ts
│   ├── Coach.ts
│   ├── Session.ts
│   └── index.ts
├── middleware/                # Middleware Layer
│   ├── authInterceptor.ts
│   ├── errorHandlerMiddleware.ts
│   ├── requestLogger.ts
│   └── index.ts
├── services/                  # Business Layer
│   ├── api/                  # API Client Layer
│   │   ├── supabase/         # Servicio de Supabase
│   │   │   ├── supabaseService.ts
│   │   │   └── index.ts
│   │   ├── coachApi.ts
│   │   ├── sessionApi.ts
│   │   └── index.ts
│   ├── realtime/             # Background Jobs/Listeners Layer
│   │   ├── notificationListener.ts
│   │   ├── dataRefreshScheduler.ts
│   │   └── index.ts
│   ├── SessionService.ts
│   ├── PaymentService.ts
│   └── index.ts
├── validators/               # Validators Layer
│   ├── userValidator.ts
│   ├── sessionValidator.ts
│   └── index.ts
├── types/                    # DTOs Layer
│   ├── supabase/            # Tipos de Supabase
│   │   └── database.types.ts
│   ├── CreateSessionDTO.ts
│   ├── CoachResponseDTO.ts
│   └── index.ts
├── store/                    # State Management Layer - Redux store
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── coachesSlice.ts
│   │   └── sessionsSlice.ts
│   ├── index.ts
│   └── store.ts
├── styles/                   # Styles Layer
│   ├── globals.css
│   ├── tailwind.css
│   └── components/
│       └── Button/
│           └── styles.module.css
├── utils/                    # Utilities Layer
│   ├── dateFormatter.ts
│   ├── urlHelper.ts
│   └── index.ts
├── error-handling/           # Exception Handling Layer
│   ├── AppErrorBoundary.tsx
│   ├── CustomError.ts
│   └── index.ts
├── logging/                  # Logging Layer
│   ├── logger.ts
│   └── index.ts
├── auth/                     # Security Layer - Supabase integration
│   ├── authService.ts
│   ├── AuthProvider.tsx
│   └── index.ts
├── App.tsx
├── index.tsx
└── react-app-env.d.ts
```
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

### Design Patterns Applied

| Pattern | Implementation | Purpose |
|---------|---------------|----------|
| **Singleton** | `SessionService`, `SupabaseService`, `Logger` | Ensure single instance for global services |
| **Observer** | `SupabaseService` with realtime listeners | Handle real-time updates |
| **Strategy** | `Logger` with multiple providers | Switch logging providers without changing code |
| **Adapter** | `AuthService` wrapping Auth0 | Abstract authentication provider |
| **Interceptor** | Middleware layer | Process requests/responses |
| **Factory** | Component creation in UI layer | Dynamic component instantiation |

## 4. Visual Components Strategy

### 4.1 Atomic Design Methodology

We implement the **Atomic Design** methodology to create a scalable and maintainable component architecture using five distinct levels:

#### Atomic Levels

- **Atoms**: Basic UI elements  
  _Examples: `Button`, `Input`, `Icon`_

- **Molecules**: Combinations of atoms  
  _Examples: `SearchBar`, `UserCard`_

- **Organisms**: Complex components composed of molecules and atoms  
  _Examples: `Header`, `SessionList`_

- **Templates**: Page layouts with placeholders  
  _Examples: `DashboardTemplate`, `AuthTemplate`_

- **Pages**: Complete views with actual content  
  _Examples: `Login`, `Profile`_

---

### 4.2 Project Structure

```
src/
├── components/
│   ├── ui/                 # Atoms
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Avatar/
│   │   └── Icon/
│   ├── molecules/          # Molecules
│   │   ├── SearchBar/
│   │   ├── UserCard/
│   │   ├── FormField/
│   │   └── Rating/
│   ├── organisms/          # Organisms
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Sidebar/
│   │   ├── SessionCard/
│   │   └── CoachGrid/
│   ├── templates/          # Templates
│   │   ├── DashboardTemplate/
│   │   ├── AuthTemplate/
│   │   └── ProfileTemplate/
│   └── layout/             # Layout components
│       ├── AppLayout/
│       ├── AuthLayout/
│       └── DashboardLayout/
├── pages/                  # Pages
│   ├── Home/
│   ├── Login/
│   ├── Register/
│   ├── Coaches/
│   ├── Sessions/
│   └── Profile/
└── hooks/                  # Custom hooks
    ├── useAuth.ts
    ├── useSessionController.ts
    └── useCoachSearch.ts
```

---

### 4.3 Component Implementation Standards

#### `Button` Component (Atom)

**File:** `src/components/ui/Button/Button.tsx`

```tsx
import React from 'react';
import clsx from 'clsx';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};
```

**Export File:** `src/components/ui/Button/index.ts`

```ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

---

### 4.4 Development Workflow

#### Component Creation Process

1. **Analysis**: Define component purpose and props  
2. **Design**: Create mockups and define variants  
3. **Implementation**: Code with TypeScript  
4. **Testing**: Write unit + accessibility tests  
5. **Documentation**: Add Storybook stories  
6. **Review**: Peer code review

#### Standard Component Structure

```
ComponentName/
├── ComponentName.tsx      # Component implementation
├── ComponentName.test.tsx # Unit tests
├── ComponentName.stories.tsx # Storybook stories
├── index.ts              # Exports
└── types.ts              # Type definitions (optional)
```

---

### 4.5 Testing Strategy

**Testing Configuration**

**File:** `jest.config.js`

```js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};
```

**File:** `src/setupTests.ts`

```ts
import '@testing-library/jest-dom';
```

**Button Component Tests**

**File:** `src/components/ui/Button/Button.test.tsx`

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });

  test('shows loading state when loading prop is true', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

---

### 4.6 Accessibility Standards

We follow **WCAG 2.1 AA** standards:

- ✅ Keyboard navigation
- ✅ Minimum color contrast (4.5:1)
- ✅ ARIA attributes
- ✅ Semantic HTML
- ✅ Screen reader compatibility

**Accessible Input Example:**

```tsx
<input
  aria-describedby="input-helper"
  aria-invalid={!!error}
  required
  className="border px-3 py-2"
/>
```

---

### 4.7 Responsive Design

**Approach:** Mobile-First Design

**Breakpoints:**

- `sm`: 640px  
- `md`: 768px  
- `lg`: 1024px  
- `xl`: 1280px  
- `2xl`: 1536px

**Responsive Header Example:**

```tsx
<nav className="hidden md:flex space-x-8">
  <a className="text-gray-700 hover:text-blue-600">Find Coaches</a>
</nav>
<Button className="hidden sm:block">Login</Button>
```

---

### 4.8 Storybook Configuration

**File:** `.storybook/main.ts`

```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
};

export default config;
```

Run Storybook locally with:

```bash
npm run storybook
```
## 5. Business Layer Implementation

### Domain-Driven Design Approach

The business layer implements Domain-Driven Design principles to encapsulate business logic separate from infrastructure concerns.

### Structure
```
src/business/
├── domain/      # Domain entities with business logic
├── rules/       # Business rules and validations
└── useCases/    # Application services orchestrating business operations
```
### Key Responsibilities

- **Domain Models**: Encapsulate business logic and rules within domain entities
- **Business Rules**: Centralized validation and business constraints
- **Use Cases**: Orchestrate complex business operations across multiple services

### Implementation Examples

Domain models and business rules are implemented in `/src/business/` following DDD patterns. Each domain entity contains its own business logic, while use cases orchestrate operations across multiple domains.

**Pattern Usage:**
- **Domain Model Pattern**: Rich domain objects with behavior
- **Use Case Pattern**: Application services for complex operations
- **Specification Pattern**: Business rules validation

See `/src/business/` for complete implementation.
---

## 6. Testing Strategy

Our testing strategy focuses on unit tests to ensure the reliability of individual components and business logic. We use **Jest** as our test runner and **React Testing Library** for testing components from a user's perspective.

### How to Run Tests

To run all the unit tests in the project, simply execute the following command in your terminal:

```bash
npm test
```

This strategy ensures reusable, testable, and accessible components, improving scalability and maintainability of the 20minCoach platform.


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




