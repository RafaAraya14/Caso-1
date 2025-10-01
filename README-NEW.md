# Coaching Platform - Developer Guide

**Architecture**: N-Layer with 10 Design Patterns  
**Stack**: React 18 + TypeScript + Tailwind + Supabase

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # UI Components
│   ├── ui/             # Reusable components (Button, Card, Modal)
│   ├── auth/           # Authentication components
│   ├── coaches/        # Coach-related components
│   └── sessions/       # Session management components
├── business/           # Business Logic Layer
│   ├── rules/          # Business validation rules
│   └── useCases/       # Application use cases
├── services/           # External API integrations
├── middleware/         # Request/response interceptors
├── utils/              # Utility functions and helpers
├── validators/         # Input validation logic
└── hooks/              # Custom React hooks
```

## 🏗️ Architecture Layers

### Frontend Layer (React Components)

- **Location**: `src/components/`
- **Purpose**: User interface and interactions
- **Patterns**: Component composition, Props drilling avoidance

### Business Logic Layer

- **Location**: `src/business/`
- **Purpose**: Core application logic and rules
- **Patterns**: Use Cases, Business Rules validation

**How to add a new use case**:

```typescript
// src/business/useCases/YourUseCase.ts
export class YourUseCase {
  constructor(
    private rules: YourRules,
    private service: YourService
  ) {}

  async execute(data: YourDTO): Promise<Result> {
    // 1. Validate business rules
    const validation = this.rules.validate(data);
    if (!validation.isValid) throw new Error(validation.errors);

    // 2. Execute logic
    return await this.service.process(data);
  }
}
```

### Services Layer

- **Location**: `src/services/`
- **Purpose**: External API communication
- **Patterns**: Repository pattern, API abstraction

### Utilities Layer

- **Location**: `src/utils/`
- **Purpose**: Shared functionality
- **Includes**: Formatters, Validators, Cache, Config

### Infrastructure Layer

- **Location**: `src/middleware/`, `src/error-handling/`, `src/logging/`
- **Purpose**: Cross-cutting concerns
- **Patterns**: Middleware pipeline, Error handling, Logging

## 🎨 Component Development Guide

### Creating New Components

**1. Create component structure**:

```
src/components/[category]/[ComponentName]/
├── ComponentName.tsx      # Main component
├── ComponentName.test.tsx # Unit tests
└── index.ts              # Exports
```

**2. Component template**:

```typescript
// ComponentName.tsx
import React from 'react';

interface ComponentNameProps {
  // Define props with clear types
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  // Props destructuring
}) => {
  return (
    <div className="component-styles">
      {/* Component JSX */}
    </div>
  );
};
```

**3. Export pattern**:

```typescript
// index.ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

### UI Components Guidelines

**Button Usage**:

```typescript
import { Button } from '@/components/ui';

// Basic usage
<Button variant="primary" size="md">
  Click me
</Button>

// With loading state
<Button variant="primary" isLoading>
  Processing...
</Button>
```

**Card Design Pattern**: All components follow card-based design:

```typescript
import { Card } from '@/components/ui';

<Card padding="md" className="custom-styles">
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

## 🔧 Development Patterns

### 1. Validation Pattern (Strategy)

```typescript
// Create validator
class YourValidator extends BaseValidator<YourDTO> {
  validate(data: YourDTO): ValidationResult {
    // Validation logic
  }
}

// Use validator
const validator = new YourValidator();
const result = validator.validate(data);
```

### 2. Event System (Observer)

```typescript
// Subscribe to events
EventBus.getInstance().subscribe('event-name', data => {
  // Handle event
});

// Publish events
EventBus.getInstance().publish('event-name', eventData);
```

### 3. Service Integration

```typescript
// Using AuthInterceptor
import { authenticatedFetch } from '@/middleware';

const response = await authenticatedFetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data),
});
```

## 🎯 Business Rules Implementation

### Adding Business Rules

```typescript
// src/business/rules/YourRules.ts
export class YourRules {
  static validate(data: YourData): ValidationResult {
    const errors: string[] = [];

    // Rule 1: Required fields
    if (!data.field) errors.push('Field is required');

    // Rule 2: Business logic
    if (data.amount > 1000) errors.push('Amount exceeds limit');

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
```

## 🚨 Error Handling

### Custom Error Usage

```typescript
import { CustomError } from '@/error-handling';

// Business logic errors
throw CustomError.businessLogic('Invalid operation', 'INVALID_OP');

// Authentication errors
throw CustomError.authentication('Session expired');

// Validation errors
throw CustomError.validation('Invalid input data', validationErrors);
```

### Global Error Handling

All errors are caught by the global error handler and logged with context.

## 📱 Responsive Design

### CSS Classes Available

```css
/* Mobile first approach */
.responsive-component {
  @apply w-full p-4;
  @apply md:w-1/2 md:p-6;
  @apply lg:w-1/3 lg:p-8;
}

/* Dark mode support */
.dark-mode-ready {
  @apply bg-white text-gray-900;
  @apply dark:bg-gray-900 dark:text-white;
}
```

### Testing Responsive Design

1. Use browser dev tools
2. Test breakpoints: 320px, 768px, 1024px, 1280px
3. Verify dark/light mode toggle

## 🧪 Testing Guidelines

### Component Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle interactions', () => {
    const handleClick = jest.fn();
    render(<YourComponent onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Business Logic Testing

```typescript
import { YourUseCase } from './YourUseCase';

describe('YourUseCase', () => {
  it('should execute successfully with valid data', async () => {
    const useCase = new YourUseCase(mockRules, mockService);
    const result = await useCase.execute(validData);

    expect(result.success).toBe(true);
  });
});
```

## 🔐 Authentication Flow

### Setup Auth

```typescript
// 1. Configure Supabase
const supabase = createClient(url, anonKey);

// 2. Use AuthProvider
<AuthProvider>
  <App />
</AuthProvider>

// 3. Access auth in components
const { user, login, logout } = useAuth();
```

## 📦 Deployment

### Environment Setup

```bash
# Development
cp .env.example .env.local
# Configure your variables

# Production build
npm run build
npm run preview
```

### Required Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 🤝 Contributing

### Code Standards

1. Use TypeScript strict mode
2. Follow component structure guidelines
3. Write tests for new features
4. Update documentation

### Pull Request Process

1. Create feature branch
2. Implement changes following patterns
3. Add/update tests
4. Update documentation
5. Submit PR with clear description

## 📚 Additional Resources

- [Design Patterns Documentation](docs/Design-Patterns-Documentation.md)
- [Architecture Diagrams](diagrams/)
- [API Documentation](docs/api/)
- [Testing Guidelines](TESTING_GUIDELINES.md)
