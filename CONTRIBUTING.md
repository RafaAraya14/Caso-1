# Guía de Contribución - 20minCoach

## Bienvenido

¡Gracias por tu interés en contribuir al proyecto 20minCoach! Esta guía te ayudará a configurar tu entorno de desarrollo y seguir las mejores prácticas del proyecto.

## Configuración Inicial

### 1. Prerequisitos

- **Node.js**: v18.0.0 o superior
- **npm**: v8.0.0 o superior
- **Git**: Última versión
- **VSCode**: Editor recomendado

### 2. Clonar y Configurar

```bash
# Clonar el repositorio
git clone <repository-url>
cd Caso-1

# Instalar dependencias
npm install

# Configurar git hooks
npm run prepare

# Verificar configuración
npm run lint
npm run type-check
```

### 3. Extensiones de VSCode

El proyecto incluye configuración automática para VSCode. Las extensiones recomendadas se instalarán automáticamente:

- **ESLint**: Linting en tiempo real
- **Prettier**: Formato automático
- **TypeScript Hero**: Organización de imports
- **Tailwind CSS IntelliSense**: Autocompletado CSS

## Estándares de Código

### Arquitectura

El proyecto sigue arquitectura hexagonal con separación clara de responsabilidades:

```
src/
├── components/          # Componentes React reutilizables
├── business/           # Lógica de negocio (Use Cases, Rules)
├── services/           # Servicios externos (API, Base de datos)
├── hooks/              # Hooks personalizados de React
├── utils/              # Utilidades y helpers
├── types/              # Definiciones de tipos TypeScript
├── middleware/         # Middleware de la aplicación
└── background/         # Servicios en segundo plano
```

### Convenciones de Nomenclatura

```typescript
// Componentes: PascalCase
export const UserProfile = () => { ... }

// Hooks: camelCase con prefijo 'use'
export const useAuthState = () => { ... }

// Servicios: PascalCase
export class AuthService { ... }

// Utilidades: camelCase
export const formatDate = () => { ... }

// Constantes: UPPER_SNAKE_CASE
export const API_BASE_URL = 'https://api.example.com';

// Tipos: PascalCase
export interface UserData { ... }
export type SessionStatus = 'active' | 'pending' | 'completed';
```

### Estructura de Archivos

```typescript
// Cada carpeta debe incluir index.ts para exports centralizados
// components/ui/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';

// Componentes con múltiples archivos
components/
├── Button/
│   ├── Button.tsx          # Componente principal
│   ├── Button.test.tsx     # Tests unitarios
│   ├── Button.stories.tsx  # Storybook (futuro)
│   └── index.ts           # Exports
```

## Flujo de Desarrollo

### 1. Workflow de Git

```bash
# Crear nueva rama desde main
git checkout main
git pull origin main
git checkout -b feature/nueva-funcionalidad

# Desarrollo con commits pequeños
git add .
git commit -m "feat: agregar componente de búsqueda"

# Push y crear PR
git push origin feature/nueva-funcionalidad
```

### 2. Convenciones de Commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Tipos permitidos:
feat:     # Nueva funcionalidad
fix:      # Corrección de bug
docs:     # Documentación
style:    # Cambios de formato (no afectan lógica)
refactor: # Refactorización de código
test:     # Agregar o modificar tests
chore:    # Tareas de mantenimiento

# Ejemplos:
feat: agregar autenticación con Supabase
fix: corregir bug en búsqueda de coaches
docs: actualizar guía de instalación
refactor: mejorar rendimiento de componente Coach
```

### 3. Pull Requests

#### Checklist antes de crear PR:

- [ ] ✅ Código pasa todos los lints (`npm run lint`)
- [ ] ✅ Types checker sin errores (`npm run type-check`)
- [ ] ✅ Código formateado (`npm run format`)
- [ ] ✅ Tests existentes siguen pasando
- [ ] ✅ Documentación actualizada si es necesario
- [ ] ✅ PR tiene descripción clara del cambio

#### Template de PR:

```markdown
## Descripción
Breve descripción del cambio y por qué es necesario.

## Tipo de cambio
- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Documentación

## Testing
- [ ] Tests unitarios agregados/actualizados
- [ ] Tests manuales realizados
- [ ] Verificado en diferentes navegadores

## Screenshots (si aplica)
Agregar screenshots del cambio visual.
```

## Mejores Prácticas

### 1. Componentes React

```typescript
// ✅ Buenas prácticas
interface Props {
  title: string;
  isLoading?: boolean;
  onSubmit: (data: FormData) => void;
}

export const SearchForm = ({ title, isLoading = false, onSubmit }: Props) => {
  // Hooks al inicio
  const [query, setQuery] = useState('');
  const { user } = useAuth();

  // Event handlers
  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  }, [onSubmit]);

  // Early returns
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // JSX limpio y accesible
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label htmlFor="search" className="block text-sm font-medium">
        {title}
      </label>
      <input
        id="search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-3 py-2 border rounded-md"
      />
    </form>
  );
};
```

### 2. Hooks Personalizados

```typescript
// ✅ Hook bien estructurado
export const useCoachSearch = (initialFilters: SearchFilters) => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCoaches = useCallback(async (filters: SearchFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await coachService.search(filters);
      setCoaches(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    coaches,
    loading,
    error,
    searchCoaches,
  };
};
```

### 3. Manejo de Errores

```typescript
// ✅ Manejo consistente de errores
export class CoachService {
  async findById(id: string): Promise<Coach> {
    try {
      const response = await api.get(`/coaches/${id}`);
      return CoachTransformer.fromAPI(response.data);
    } catch (error) {
      // Log error para debugging
      logger.error('Error fetching coach', { id, error });
      
      // Throw error específico para UI
      if (error instanceof ApiError && error.status === 404) {
        throw new Error(`Coach con ID ${id} no encontrado`);
      }
      
      throw new Error('Error al cargar información del coach');
    }
  }
}
```

## Testing

### 1. Tests Unitarios

```typescript
// Usar Jest + React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchForm } from './SearchForm';

describe('SearchForm', () => {
  it('should call onSubmit with form data', () => {
    const mockSubmit = jest.fn();
    
    render(<SearchForm title="Buscar" onSubmit={mockSubmit} />);
    
    const input = screen.getByLabelText('Buscar');
    const form = screen.getByRole('form');
    
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.submit(form);
    
    expect(mockSubmit).toHaveBeenCalledWith(expect.any(FormData));
  });
});
```

### 2. Tests de Integración

```typescript
// Tests de hooks con contexto
import { renderHook, act } from '@testing-library/react';
import { useCoachSearch } from './useCoachSearch';

describe('useCoachSearch', () => {
  it('should fetch and return coaches', async () => {
    const { result } = renderHook(() => useCoachSearch({}));
    
    await act(async () => {
      await result.current.searchCoaches({ specialty: 'fitness' });
    });
    
    expect(result.current.coaches).toHaveLength(2);
    expect(result.current.loading).toBe(false);
  });
});
```

## Documentación

### 1. Comentarios en Código

```typescript
/**
 * Servicio para gestionar sesiones de coaching
 * Implementa patrón Repository para abstracción de datos
 */
export class SessionService {
  /**
   * Crea una nueva sesión y consume créditos del usuario
   * @param userId - ID del usuario que solicita la sesión
   * @param coachId - ID del coach seleccionado
   * @param sessionData - Datos de la sesión (fecha, duración, etc.)
   * @param cost - Costo en créditos de la sesión
   * @throws {InsufficientCreditsError} Si el usuario no tiene créditos suficientes
   * @throws {CoachUnavailableError} Si el coach no está disponible
   */
  async createSession(
    userId: string,
    coachId: string,
    sessionData: SessionData,
    cost: number
  ): Promise<Session> {
    // Implementation...
  }
}
```

### 2. README de Módulos

Cada módulo importante debe tener su README:

```markdown
# Módulo de Autenticación

## Descripción
Maneja la autenticación de usuarios usando Supabase Auth.

## Componentes
- `AuthProvider`: Context provider para estado de autenticación
- `LoginForm`: Formulario de inicio de sesión
- `useAuth`: Hook para acceder al estado de auth

## Uso
\`\`\`tsx
import { useAuth } from './auth';

const { user, login, logout } = useAuth();
\`\`\`
```

## Resolución de Problemas

### 1. Errores Comunes

```bash
# Error de dependencias
rm -rf node_modules package-lock.json
npm install

# Error de tipos TypeScript
npm run type-check

# Error de linting
npm run lint:fix

# Error de git hooks
npx husky install
```

### 2. Performance

- **Lazy loading**: Usar `React.lazy()` para rutas
- **Memo**: Usar `React.memo()` para componentes pesados
- **Callbacks**: Usar `useCallback()` para funciones en props
- **Effects**: Minimizar dependencias en `useEffect()`

### 3. Debugging

```typescript
// Usar logger en lugar de console.log
import { logger } from '../logging';

logger.debug('Usuario logueado', { userId: user.id });
logger.error('Error en API', { error, context: 'fetchCoaches' });
```

## Contacto y Soporte

- **Issues**: Crear issue en GitHub para bugs o features
- **Discussions**: Usar GitHub Discussions para preguntas
- **Code Review**: Todos los PRs requieren review antes de merge

## Recursos

- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

¡Gracias por contribuir a 20minCoach! 🚀