// src/hooks/useCoachSearch.ts
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Coach } from '../models/Coach';
import { getAllCoachesWithFallback } from '../services/api/coachApi';
import { logger } from '../logging';
import { ErrorHandler } from '../error-handling';

export interface SearchFilters {
  name?: string;
  specialties?: string[];
  minRating?: number;
  availableOnly?: boolean;
  sortBy?: 'rating' | 'name' | 'experience';
  sortOrder?: 'asc' | 'desc';
}

export interface UseCoachSearchResult {
  coaches: Coach[];
  filteredCoaches: Coach[];
  loading: boolean;
  error: string | null;
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  totalCount: number;
  hasResults: boolean;
  refetch: () => void;
}

const defaultFilters: SearchFilters = {
  name: '',
  specialties: [],
  minRating: 0,
  availableOnly: true,
  sortBy: 'rating',
  sortOrder: 'desc'
};

export function useCoachSearch(initialFilters?: Partial<SearchFilters>): UseCoachSearchResult {
  const [filters, setFiltersState] = useState<SearchFilters>({
    ...defaultFilters,
    ...initialFilters
  });
  
  const [searchTerm, setSearchTerm] = useState(filters.name || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update filters when search term changes
  useEffect(() => {
    setFiltersState(prev => ({
      ...prev,
      name: debouncedSearchTerm
    }));
  }, [debouncedSearchTerm]);

  // Query para obtener todos los coaches
  const {
    data: allCoaches = [],
    isLoading,
    error: queryError,
    refetch
  } = useQuery<Coach[], Error>({
    queryKey: ['coaches'],
    queryFn: getAllCoachesWithFallback,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
    onError: (error: Error) => {
      logger.error('Failed to fetch coaches', error, {
        component: 'UseCoachSearch',
        action: 'FetchCoaches'
      });
    },
    onSuccess: (data: Coach[]) => {
      logger.info('Coaches fetched successfully', {
        component: 'UseCoachSearch',
        action: 'FetchCoaches',
        metadata: { count: data.length }
      });
    }
  });

  // Filtrar y ordenar coaches localmente
  const filteredCoaches = useMemo(() => {
    let result = [...(allCoaches || [])];

    // Filtro por nombre
    if (filters.name && filters.name.trim()) {
      const searchLower = filters.name.toLowerCase().trim();
      result = result.filter(coach => 
        coach.name.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por especialidades
    if (filters.specialties && filters.specialties.length > 0) {
      result = result.filter(coach => 
        filters.specialties!.some(specialty => 
          coach.specialties.includes(specialty)
        )
      );
    }

    // Filtro por rating mínimo
    if (filters.minRating && filters.minRating > 0) {
      result = result.filter(coach => coach.rating >= filters.minRating!);
    }

    // Filtro por disponibilidad
    if (filters.availableOnly) {
      result = result.filter(coach => coach.isAvailable);
    }

    // Ordenamiento
    if (filters.sortBy) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (filters.sortBy) {
          case 'rating':
            aValue = a.rating;
            bValue = b.rating;
            break;
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'experience':
            // Número de especialidades como indicador de experiencia
            aValue = a.specialties.length;
            bValue = b.specialties.length;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return filters.sortOrder === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return filters.sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [allCoaches, filters]);

  const setFilters = (newFilters: Partial<SearchFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    
    logger.debug('Coach search filters updated', {
      component: 'UseCoachSearch',
      action: 'UpdateFilters',
      metadata: { newFilters, currentFilters: filters }
    });
  };

  const resetFilters = () => {
    setFiltersState(defaultFilters);
    setSearchTerm('');
    
    logger.debug('Coach search filters reset', {
      component: 'UseCoachSearch',
      action: 'ResetFilters'
    });
  };

  const error = queryError ? 
    ErrorHandler.handle(queryError, {
      component: 'UseCoachSearch',
      action: 'FetchCoaches'
    }) : null;

  return {
    coaches: allCoaches || [],
    filteredCoaches,
    loading: isLoading,
    error,
    filters,
    setFilters,
    resetFilters,
    searchTerm,
    setSearchTerm,
    totalCount: filteredCoaches.length,
    hasResults: filteredCoaches.length > 0,
    refetch
  };
}

/**
 * Hook simplificado para búsqueda rápida por texto
 */
export function useQuickCoachSearch(searchTerm: string) {
  const { filteredCoaches, loading, error } = useCoachSearch({
    name: searchTerm,
    availableOnly: true
  });

  return {
    coaches: filteredCoaches,
    loading,
    error
  };
}

/**
 * Hook para obtener coaches por especialidad
 */
export function useCoachesBySpecialty(specialty: string) {
  const { filteredCoaches, loading, error } = useCoachSearch({
    specialties: [specialty],
    availableOnly: true,
    sortBy: 'rating',
    sortOrder: 'desc'
  });

  return {
    coaches: filteredCoaches,
    loading,
    error
  };
}

export default useCoachSearch;