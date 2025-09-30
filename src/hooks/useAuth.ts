// src/hooks/useAuth.ts
// Re-export del hook useAuth del AuthProvider para mayor conveniencia
export { useAuth } from '../components/auth/AuthProvider/AuthProvider';

// Podemos agregar helpers adicionales relacionados con auth aquí
export { default as useSessionController } from './useSessionController';
export { default as useUserCredits } from './useUserCredits';