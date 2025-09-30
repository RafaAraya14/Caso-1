// src/types/dtos/SearchCoachDTO.ts

/**
 * DTO para buscar coaches
 */
export interface SearchCoachDTO {
  specialty?: string;
  minRating?: number;
  maxRating?: number;
  availableNow?: boolean;
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'name' | 'price' | 'availability';
  sortOrder?: 'asc' | 'desc';
}

/**
 * DTO de respuesta para la búsqueda de coaches
 */
export interface SearchCoachResponseDTO {
  coaches: CoachSummaryDTO[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  filters: SearchCoachDTO;
  searchStats: {
    totalAvailable: number;
    averageRating: number;
    priceRange: {
      min: number;
      max: number;
    };
  };
}

/**
 * DTO resumido de coach para listados
 */
export interface CoachSummaryDTO {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  isAvailable: boolean;
  nextAvailableSlot?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  basePrice: number;
  location?: string;
  profileImageUrl?: string;
  shortBio?: string;
}

/**
 * DTO completo de coach para perfil detallado
 */
export interface CoachDetailDTO extends CoachSummaryDTO {
  email: string;
  fullBio: string;
  experience: string;
  certifications: string[];
  languages: string[];
  sessionCount: number;
  joinedDate: string;
  availability: {
    timeSlots: {
      dayOfWeek: number; // 0-6 (Sunday-Saturday)
      startTime: string; // HH:MM format
      endTime: string; // HH:MM format
    }[];
    timezone: string;
  };
  pricing: {
    baseRate: number;
    tierMultiplier: number;
    specialtyRates?: { [specialty: string]: number };
  };
  stats: {
    totalSessions: number;
    averageRating: number;
    completionRate: number;
    responseTime: number; // En minutos
  };
}

/**
 * DTO para filtros avanzados de búsqueda
 */
export interface AdvancedSearchFiltersDTO {
  specialties: string[];
  minExperience?: number; // En años
  languages?: string[];
  certifications?: string[];
  availability?: {
    dayOfWeek: number;
    timeRange: {
      start: string;
      end: string;
    };
  };
  sessionTypes?: ('video' | 'audio' | 'chat')[];
}
