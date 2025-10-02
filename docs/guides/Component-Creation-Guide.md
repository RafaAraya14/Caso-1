# Component Creation Guide

This guide provides detailed templates and patterns for creating new components
in the 20minCoach platform.

## Component Structure

All components follow a consistent folder structure for maintainability and
discoverability:

```
src/components/[category]/[ComponentName]/
├── ComponentName.tsx          # Main component implementation
├── ComponentName.test.tsx     # Unit tests
├── ComponentName.stories.tsx  # Storybook stories (optional)
├── index.ts                   # Export declarations
└── types.ts                   # Component-specific types (optional)
```

### Categories

- `ui/` - Reusable UI atoms (Button, Input, Card, Modal)
- `auth/` - Authentication-related components
- `coaches/` - Coach-specific components
- `sessions/` - Session management components
- `dashboard/` - Dashboard-specific components

## Component Templates

### Basic UI Component Template

```typescript
// ComponentName.tsx
import React from 'react';
import { cn } from '@/utils';

export interface ComponentNameProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  'data-testid'?: string;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  'data-testid': testId,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors';

  const variantClasses = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600',
    ghost: 'bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-slate-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      disabled={disabled}
      onClick={onClick}
      data-testid={testId}
      {...props}
    >
      {children}
    </button>
  );
};
```

### Test Template

```typescript
// ComponentName.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders children correctly', () => {
    render(<ComponentName>Test Content</ComponentName>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    render(
      <ComponentName variant="secondary" data-testid="component">
        Test
      </ComponentName>
    );
    const component = screen.getByTestId('component');
    expect(component).toHaveClass('bg-slate-800');
  });

  it('applies size classes correctly', () => {
    render(
      <ComponentName size="lg" data-testid="component">
        Test
      </ComponentName>
    );
    const component = screen.getByTestId('component');
    expect(component).toHaveClass('px-6', 'py-3');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(
      <ComponentName onClick={handleClick} data-testid="component">
        Click me
      </ComponentName>
    );

    fireEvent.click(screen.getByTestId('component'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables interaction when disabled', () => {
    const handleClick = jest.fn();
    render(
      <ComponentName disabled onClick={handleClick} data-testid="component">
        Disabled
      </ComponentName>
    );

    const component = screen.getByTestId('component');
    expect(component).toBeDisabled();
    expect(component).toHaveClass('opacity-50', 'pointer-events-none');
  });

  it('applies custom className', () => {
    render(
      <ComponentName className="custom-class" data-testid="component">
        Test
      </ComponentName>
    );
    expect(screen.getByTestId('component')).toHaveClass('custom-class');
  });
});
```

### Index File Template

```typescript
// index.ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

## Business Logic Component Template

For components that interact with business logic:

```typescript
// BusinessComponent.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SomeUseCase } from '@/business/useCases';
import { SomeValidator } from '@/validators';
import { CustomError } from '@/error-handling';
import { logger } from '@/logging';

export interface BusinessComponentProps {
  onSuccess?: (data: SomeData) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export const BusinessComponent: React.FC<BusinessComponentProps> = ({
  onSuccess,
  onError,
  className
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<SomeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useCase = new SomeUseCase();
  const validator = new SomeValidator();

  const handleAction = async (input: SomeInput) => {
    try {
      setLoading(true);
      setError(null);

      // Validate input
      const validation = validator.validate(input);
      if (!validation.isValid) {
        throw CustomError.validation('Invalid input', validation.errors);
      }

      // Execute business logic
      const result = await useCase.execute(input);
      setData(result);

      onSuccess?.(result);

      logger.info('Action completed successfully', {
        component: 'BusinessComponent',
        userId: user?.id,
      });
    } catch (err) {
      const errorMessage = err instanceof CustomError
        ? err.friendlyMessage
        : 'An unexpected error occurred';

      setError(errorMessage);
      onError?.(err as Error);

      logger.error('Action failed', err as Error, {
        component: 'BusinessComponent',
        userId: user?.id,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      {error && (
        <div className="toast toast-error">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading-spinner" />
      )}

      {data && (
        <div className="card">
          {/* Render data */}
        </div>
      )}
    </div>
  );
};
```

## Form Component Template

For components with form handling:

```typescript
// FormComponent.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { SomeValidator } from '@/validators';

export interface FormComponentProps {
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<FormData>;
  disabled?: boolean;
}

interface FormData {
  field1: string;
  field2: string;
}

export const FormComponent: React.FC<FormComponentProps> = ({
  onSubmit,
  initialData = {},
  disabled = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    field1: initialData.field1 || '',
    field2: initialData.field2 || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validator = new SomeValidator();

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = validator.validate(formData);
    if (!validation.isValid) {
      const newErrors: Record<string, string> = {};
      validation.errors.forEach(error => {
        newErrors[error.field] = error.message;
      });
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      // Handle submission error
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-group space-y-4">
      <div className="form-group">
        <label htmlFor="field1" className="label label-required">
          Field 1
        </label>
        <input
          id="field1"
          type="text"
          value={formData.field1}
          onChange={(e) => handleChange('field1', e.target.value)}
          className={`input ${errors.field1 ? 'input-error' : ''}`}
          disabled={disabled || isSubmitting}
        />
        {errors.field1 && (
          <div className="form-error">{errors.field1}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="field2" className="label">
          Field 2
        </label>
        <input
          id="field2"
          type="text"
          value={formData.field2}
          onChange={(e) => handleChange('field2', e.target.value)}
          className={`input ${errors.field2 ? 'input-error' : ''}`}
          disabled={disabled || isSubmitting}
        />
        {errors.field2 && (
          <div className="form-error">{errors.field2}</div>
        )}
      </div>

      <Button
        type="submit"
        loading={isSubmitting}
        disabled={disabled || isSubmitting}
        className="w-full"
      >
        Submit
      </Button>
    </form>
  );
};
```

## Component Best Practices

### 1. Props Interface Design

```typescript
// ✅ Good: Clear, descriptive props with defaults
interface ComponentProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

// ❌ Bad: Unclear props without types
interface ComponentProps {
  content: any;
  type: string;
  styles: object;
}
```

### 2. CSS Classes and Styling

```typescript
// ✅ Good: Using utility classes with meaningful combinations
const buttonClasses = cn(
  'btn',
  'btn-primary',
  'hover:bg-brand-700',
  disabled && 'opacity-50',
  className
);

// ❌ Bad: Inline styles or unclear class names
const buttonClasses = `button ${type} ${disabled ? 'disabled' : ''}`;
```

### 3. Event Handling

```typescript
// ✅ Good: Descriptive event handlers with proper typing
const handleUserSelection = (userId: string) => {
  onUserSelect?.(userId);
};

const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // Handle submission
};

// ❌ Bad: Generic event handlers
const handleClick = (e: any) => {
  // Unclear what this does
};
```

### 4. Error Handling

```typescript
// ✅ Good: Proper error handling with user feedback
try {
  await performAction();
} catch (error) {
  const message =
    error instanceof CustomError
      ? error.friendlyMessage
      : 'Something went wrong';
  setError(message);
  logger.error('Action failed', error);
}

// ❌ Bad: Silent failures or unclear error messages
try {
  await performAction();
} catch (error) {
  console.log(error);
}
```

### 5. Accessibility

```typescript
// ✅ Good: Proper accessibility attributes
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  data-testid="close-button"
  onClick={onClose}
>
  <CloseIcon aria-hidden="true" />
</button>

// ❌ Bad: Missing accessibility attributes
<button onClick={onClose}>
  <CloseIcon />
</button>
```

## Integration with Architecture

### Using Business Layer

```typescript
// Import business logic
import { BookSessionUseCase } from '@/business/useCases';
import { SessionRules } from '@/business/rules';

// Use in component
const bookSessionUseCase = new BookSessionUseCase();
const sessionRules = new SessionRules();

const canBook = sessionRules.canUserBookSession(user, coach);
if (canBook) {
  await bookSessionUseCase.execute(sessionData);
}
```

### Using Event System

```typescript
// Import event system
import { EventBus } from '@/background';

// Subscribe to events
useEffect(() => {
  const unsubscribe = EventBus.getInstance().subscribe(
    'session-booked',
    data => {
      // Handle session booked event
      updateSessionsList(data);
    }
  );

  return unsubscribe;
}, []);

// Publish events
const handleSessionCreated = (session: Session) => {
  EventBus.getInstance().publish('session-created', session);
};
```

### Using Validators

```typescript
// Import validators
import { CreateSessionValidator } from '@/validators';

// Validate data
const validator = new CreateSessionValidator();
const validation = validator.validate(formData);

if (!validation.isValid) {
  // Handle validation errors
  setErrors(validation.errors);
  return;
}
```

## Storybook Integration

```typescript
// ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'UI/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Button',
    variant: 'secondary',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Button',
    disabled: true,
  },
};
```

This guide provides comprehensive templates and patterns for creating
maintainable, tested, and accessible components that integrate seamlessly with
the platform's architecture.
