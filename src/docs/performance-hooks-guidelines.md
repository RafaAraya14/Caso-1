// src/docs/performance-hooks-guidelines.md

# Guías para Hooks de Performance (useCallback, useMemo, memo)

## ⚠️ Regla General: No los uses por defecto

Los hooks de performance como `useCallback` y `useMemo` **NO** deben usarse por defecto. Solo úsalos cuando tengas un problema de performance específico y medible.

## 🎯 Cuándo SÍ usar useCallback

### ✅ Caso 1: Función pasada a componentes memoizados
```tsx
const ExpensiveChild = memo(({ onClick }) => {
  // Componente costoso que se re-renderiza frecuentemente
  return <button onClick={onClick}>Click me</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  
  // ✅ CORRECTO: useCallback previene re-renders innecesarios de ExpensiveChild
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <ExpensiveChild onClick={handleClick} />
    </div>
  );
}
```

### ✅ Caso 2: Función en dependencias de useEffect
```tsx
function Component({ userId }) {
  const [data, setData] = useState(null);
  
  // ✅ CORRECTO: Evita que useEffect se ejecute en cada render
  const fetchUserData = useCallback(async () => {
    const response = await api.getUser(userId);
    setData(response);
  }, [userId]);
  
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
}
```

## 🚫 Cuándo NO usar useCallback

### ❌ Caso 1: Funciones que no se pasan a componentes hijos
```tsx
function Component() {
  const [loading, setLoading] = useState(false);
  
  // ❌ INCORRECTO: No hay beneficio de performance
  const handleSubmit = useCallback(async () => {
    setLoading(true);
    await submitForm();
    setLoading(false);
  }, []);
  
  // ✅ CORRECTO: Función simple sin useCallback
  const handleSubmit = async () => {
    setLoading(true);
    await submitForm();
    setLoading(false);
  };
  
  return <button onClick={handleSubmit}>Submit</button>;
}
```

### ❌ Caso 2: Dependencias que cambian frecuentemente
```tsx
function Component({ userId, filter, sortBy }) {
  // ❌ INCORRECTO: Las dependencias cambian frecuentemente, 
  // por lo que useCallback no aporta beneficio
  const fetchData = useCallback(async () => {
    return api.getData(userId, filter, sortBy);
  }, [userId, filter, sortBy]);
  
  // ✅ CORRECTO: Función normal es más simple y eficiente
  const fetchData = async () => {
    return api.getData(userId, filter, sortBy);
  };
}
```

## 🎯 Cuándo SÍ usar useMemo

### ✅ Caso 1: Cálculos costosos
```tsx
function Component({ items }) {
  // ✅ CORRECTO: Cálculo costoso que solo debe ejecutarse cuando items cambia
  const expensiveValue = useMemo(() => {
    return items.reduce((acc, item) => {
      // Cálculo muy costoso aquí
      return acc + heavyComputation(item);
    }, 0);
  }, [items]);
  
  return <div>{expensiveValue}</div>;
}
```

### ✅ Caso 2: Objetos/arrays en dependencias
```tsx
function Component({ userId }) {
  // ✅ CORRECTO: Evita que useEffect se ejecute innecesariamente
  const queryOptions = useMemo(() => ({
    userId,
    includeDeleted: false,
    sortBy: 'createdAt'
  }), [userId]);
  
  useEffect(() => {
    fetchData(queryOptions);
  }, [queryOptions]);
}
```

## 🚫 Cuándo NO usar useMemo

### ❌ Caso 1: Cálculos simples
```tsx
function Component({ a, b }) {
  // ❌ INCORRECTO: La suma es más rápida que la memoización
  const sum = useMemo(() => a + b, [a, b]);
  
  // ✅ CORRECTO: Cálculo directo
  const sum = a + b;
}
```

## 📏 Cómo medir si necesitas optimización

1. **Usa React DevTools Profiler**
2. **Mide tiempo de renderizado**
3. **Identifica componentes que se re-renderizan frecuentemente sin cambios**
4. **Solo entonces aplica optimizaciones**

## 🎯 Ejemplo corregido del proyecto

### ❌ Antes (innecesario):
```tsx
const hireCoach = useCallback(async (coachId, userId) => {
  // ... lógica
}, [queryClient]); // queryClient es estable, no cambia
```

### ✅ Después (correcto):
```tsx
const hireCoach = async (coachId, userId) => {
  // ... misma lógica, más simple
};
```

## 📝 Conclusión

- **Mide primero, optimiza después**
- **La mayoría de funciones NO necesitan useCallback/useMemo**
- **Solo úsalos cuando tengas un problema de performance real**
- **El código simple es mejor que el código "optimizado" innecesariamente**