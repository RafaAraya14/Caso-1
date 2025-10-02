// src/hooks/index.ts
// Central exports for all hooks

// Authentication hooks
export { useAuth } from './useAuth';

// Voice search hooks
export { useVoiceSearch } from './useVoiceSearch';

// WebRTC and video call hooks
export { useWebRTC } from './useWebRTC';
export { useWebRTC as useWebRTCWithSignaling } from './useWebRTCWithSignaling';

// Coach-related hooks
export {
  default as useCoachSearch,
  useCoachesBySpecialty,
  useQuickCoachSearch,
  type SearchFilters,
  type UseCoachSearchResult,
} from './useCoachSearch';

// Session management hooks
export { useSessionController } from './useSessionController';

// User management hooks
export { useUserCredits, default as useUserCreditsDefault } from './useUserCredits';

// UI/Theme hooks
export { useTheme } from './useTheme';
