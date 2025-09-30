// src/hooks/index.ts
// Central exports for all hooks

// Authentication hooks
export { useAuth } from './useAuth';

// Coach-related hooks
export { 
  default as useCoachSearch,
  useQuickCoachSearch,
  useCoachesBySpecialty,
  type SearchFilters,
  type UseCoachSearchResult
} from './useCoachSearch';

// Session management hooks
export { useSessionController } from './useSessionController';

// User management hooks
export { 
  useUserCredits,
  default as useUserCreditsDefault
} from './useUserCredits';

// UI/Theme hooks
export { useTheme } from './useTheme';