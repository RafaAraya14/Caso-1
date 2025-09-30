/**
 * Utility Types
 *
 * Definiciones de tipos para las utilidades del proyecto.
 */

// Date utilities types
export type DateFormat = 'short' | 'medium' | 'long' | 'full' | 'custom';
export type TimeFormat = '12h' | '24h';

// Number utilities types
export interface CurrencyOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export type ValidationRule<T = any> = (value: T) => ValidationResult;

// Array utilities types
export type SortOrder = 'asc' | 'desc';

// Browser utilities types
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown';

// Application specific types
export interface CoachData {
  id: string;
  name: string;
  rating: number;
  skills: string[];
  hourlyRate: number;
  isAvailable: boolean;
}

export interface SessionData {
  id: string;
  coachId: string;
  userId: string;
  date: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  timezone: string;
}
