# Testing Guidelines - 20minCoach

## Guía para Desarrolladores: Cómo Agregar y Ejecutar Tests

### Estructura de Testing

El proyecto utiliza **Jest** como framework de testing con soporte para TypeScript y JSX. Todos los tests se encuentran junto a sus archivos fuente con la extensión `.test.ts` o `.test.tsx`.

```
src/
├── models/
│   ├── Coach.test.ts          ✅ Tests de modelos de dominio
│   └── User.test.ts           ✅ Tests de lógica de negocio
├── services/
│   └── SessionService.test.ts ✅ Tests de validadores
├── business/
│   ├── rules/
│   │   ├── SessionRules.test.ts    (recomendado)
│   │   └── CoachRules.test.ts      (recomendado)
│   └── useCases/
│       ├── BookSessionUseCase.test.ts    (recomendado)
│       └── SearchCoachUseCase.test.ts    (recomendado)
└── validators/
    ├── CreateSessionValidator.test.ts    (recomendado)
    └── SearchCoachValidator.test.ts      (recomendado)
```

## Comandos de Testing

### Ejecutar Tests
```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (recomendado para desarrollo)
npm test -- --watch

# Ejecutar tests con coverage
npm test -- --coverage

# Ejecutar un test específico
npm test Coach.test.ts

# Ejecutar tests que coincidan con un patrón
npm test -- --testNamePattern="validation"
```

### Comandos de Verificación
```bash
# Verificar que los tests pasan antes de commit
npm test -- --watchAll=false

# Verificar linting y tests
npm run lint && npm test
```

## Cómo Crear Nuevos Tests

### 1. Tests para Modelos de Dominio

**Ubicación**: `src/models/[ModelName].test.ts`

**Ejemplo**: Test para nuevo modelo `Payment.ts`
```typescript
// src/models/Payment.test.ts
import { Payment } from './Payment';

describe('Payment Model', () => {
  describe('constructor', () => {
    test('should create payment with valid data', () => {
      const payment = new Payment('pay123', 'user456', 20.00, 'completed');
      
      expect(payment.id).toBe('pay123');
      expect(payment.amount).toBe(20.00);
      expect(payment.status).toBe('completed');
    });
  });

  describe('business logic', () => {
    test('should validate payment amount', () => {
      const payment = new Payment('pay123', 'user456', 20.00, 'pending');
      
      expect(payment.isValidAmount()).toBe(true);
    });

    test('should reject negative amounts', () => {
      const payment = new Payment('pay123', 'user456', -5.00, 'pending');
      
      expect(payment.isValidAmount()).toBe(false);
    });
  });
});
```

### 2. Tests para Business Rules

**Ubicación**: `src/business/rules/[RuleName].test.ts`

**Ejemplo**: Test para regla de negocio
```typescript
// src/business/rules/PaymentRules.test.ts
import { PaymentRules } from './PaymentRules';
import { User } from '../../models/User';

describe('PaymentRules', () => {
  describe('canProcessPayment', () => {
    test('should allow payment for premium user', () => {
      const user = new User('u1', 'test@test.com', 'Test', 'PremiumUser', true, 5);
      
      const result = PaymentRules.canProcessPayment(user, 15.00);
      
      expect(result.canProcess).toBe(true);
    });

    test('should reject payment if user has no subscription', () => {
      const user = new User('u1', 'test@test.com', 'Test', 'BasicUser', false, 0);
      
      const result = PaymentRules.canProcessPayment(user, 20.00);
      
      expect(result.canProcess).toBe(false);
      expect(result.reason).toContain('subscription');
    });
  });
});
```

### 3. Tests para Validadores

**Ubicación**: `src/validators/[ValidatorName].test.ts`

**Ejemplo**: Test para validador
```typescript
// src/validators/PaymentValidator.test.ts
import { PaymentValidator } from './PaymentValidator';

describe('PaymentValidator', () => {
  describe('validate', () => {
    test('should pass validation for valid payment data', () => {
      const validData = {
        userId: 'user123',
        amount: 20.00,
        currency: 'USD'
      };

      const result = PaymentValidator.validate(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail validation for missing userId', () => {
      const invalidData = {
        amount: 20.00,
        currency: 'USD'
      };

      const result = PaymentValidator.validate(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'userId',
            code: 'REQUIRED'
          })
        ])
      );
    });
  });
});
```

## Patrones de Testing Recomendados

### 1. Estructura AAA (Arrange-Act-Assert)
```typescript
test('should calculate discount correctly', () => {
  // Arrange
  const user = new User('u1', 'test@test.com', 'Test', 'PremiumUser', true, 5);
  const originalPrice = 20.00;

  // Act
  const discountedPrice = calculateDiscount(user, originalPrice);

  // Assert
  expect(discountedPrice).toBe(15.00);
});
```

### 2. Tests Descriptivos con Context
```typescript
describe('SessionRules', () => {
  describe('when user is premium', () => {
    test('should allow booking during business hours', () => {
      // Test logic
    });

    test('should apply premium discount', () => {
      // Test logic
    });
  });

  describe('when user is basic', () => {
    test('should charge standard rate', () => {
      // Test logic
    });
  });
});
```

### 3. Tests de Edge Cases
```typescript
describe('boundary conditions', () => {
  test('should handle exactly 8 sessions per day limit', () => {
    const coach = new Coach('c1', 'Test Coach', 4.5, ['Programming'], true, 8);
    
    expect(coach.canAcceptSession()).toBe(false);
  });

  test('should handle exactly minimum rating threshold', () => {
    const coach = new Coach('c1', 'Test Coach', 3.5, ['Programming'], true, 0);
    
    expect(coach.canAcceptSession()).toBe(true);
  });
});
```

## Mocking y Test Doubles

### 1. Mocking Módulos Externos
```typescript
// Mock Supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({ data: mockData, error: null }))
      }))
    }))
  }
}));
```

### 2. Test Doubles para Dependencias
```typescript
describe('BookSessionUseCase', () => {
  const mockUserRepository = {
    findById: jest.fn(),
    update: jest.fn()
  };

  const mockCoachRepository = {
    findById: jest.fn(),
    findAvailable: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should book session successfully', async () => {
    // Setup mocks
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockCoachRepository.findById.mockResolvedValue(mockCoach);

    // Execute test
    const result = await BookSessionUseCase.execute(request);

    // Verify
    expect(result.success).toBe(true);
  });
});
```

## Configuración de Jest

El archivo `jest.config.js` está configurado para:
- **TypeScript support**: Transforma archivos `.ts` y `.tsx`
- **JSX support**: Para componentes React
- **Module mapping**: Para imports absolutos y CSS
- **Setup files**: Configuración de testing library

```javascript
// jest.config.js - Configuración actual
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^../logging$': '<rootDir>/src/__mocks__/logging.ts',
        '^../lib/supabase$': '<rootDir>/src/__mocks__/lib.ts'
    },
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
    }
};
```

## Checklist para Nuevos Tests

### ✅ Antes de escribir tests:
- [ ] Identificar el tipo de componente (modelo, service, validator, etc.)
- [ ] Definir los casos de prueba (happy path, edge cases, error cases)
- [ ] Verificar dependencias y si necesitan mocking

### ✅ Al escribir tests:
- [ ] Usar nombres descriptivos para tests y describe blocks
- [ ] Seguir patrón AAA (Arrange-Act-Assert)
- [ ] Incluir al menos un test que falle intencionalmente
- [ ] Probar casos límite y condiciones de error
- [ ] Verificar que el test falla cuando debería fallar

### ✅ Después de escribir tests:
- [ ] Ejecutar `npm test` para verificar que todos pasan
- [ ] Verificar coverage si es necesario
- [ ] Actualizar documentación si agregan nuevas convenciones

## Troubleshooting Común

### Error: "Cannot use import.meta outside module"
**Solución**: Usar mocks para módulos que usan `import.meta`
```typescript
jest.mock('../logging', () => ({
  logger: { info: jest.fn(), error: jest.fn() }
}));
```

### Error: "Transform files not found"
**Solución**: Verificar que `ts-jest` esté instalado y configurado

### Tests que no encuentran módulos
**Solución**: Verificar `moduleNameMapper` en `jest.config.js`

---

## Métricas de Testing

**Estado Actual**:
- ✅ 3 suites de tests implementadas
- ✅ 15 tests pasando
- ✅ 0 tests fallando
- ✅ Cobertura: Modelos y validadores básicos

**Objetivo**: 
- Alcanzar 80%+ cobertura de código
- Tests para todas las reglas de negocio críticas
- Tests de integración para use cases principales