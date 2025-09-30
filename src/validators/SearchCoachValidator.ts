// src/validators/SearchCoachValidator.ts
import { BaseValidator } from './BaseValidator';

import type { ValidationResult } from './BaseValidator';
import type { SearchCoachDTO } from '../types/dtos/SearchCoachDTO';

/**
 * Validador para búsqueda de coaches
 */
export class SearchCoachValidator extends BaseValidator<SearchCoachDTO> {
  validate(data: SearchCoachDTO): ValidationResult {
    const errors = [];

    // Validar specialty (opcional)
    if (data.specialty !== undefined && data.specialty !== '') {
      const specialtyError = this.validateSpecialty(data.specialty);
      if (specialtyError) {
        errors.push(specialtyError);
      }
    }

    // Validar minRating
    if (data.minRating !== undefined) {
      const minRatingError = this.validateRange(data.minRating, 0, 5, 'minRating');
      if (minRatingError) {
        errors.push(minRatingError);
      }
    }

    // Validar maxRating
    if (data.maxRating !== undefined) {
      const maxRatingError = this.validateRange(data.maxRating, 0, 5, 'maxRating');
      if (maxRatingError) {
        errors.push(maxRatingError);
      }
    }

    // Validar que minRating <= maxRating
    if (data.minRating !== undefined && data.maxRating !== undefined) {
      if (data.minRating > data.maxRating) {
        errors.push(
          this.createError(
            'rating',
            'El rating mínimo no puede ser mayor que el máximo',
            'INVALID_RANGE'
          )
        );
      }
    }

    // Validar priceRange
    if (data.priceRange) {
      const priceRangeError = this.validatePriceRange(data.priceRange);
      if (priceRangeError) {
        errors.push(priceRangeError);
      }
    }

    // Validar page
    if (data.page !== undefined) {
      if (data.page < 1) {
        errors.push(
          this.createError('page', 'El número de página debe ser mayor que 0', 'INVALID_PAGE')
        );
      }
    }

    // Validar limit
    if (data.limit !== undefined) {
      const limitError = this.validateRange(data.limit, 1, 100, 'limit');
      if (limitError) {
        errors.push(limitError);
      }
    }

    // Validar sortBy
    if (data.sortBy !== undefined) {
      const sortByError = this.validateSortBy(data.sortBy);
      if (sortByError) {
        errors.push(sortByError);
      }
    }

    // Validar sortOrder
    if (data.sortOrder !== undefined) {
      const sortOrderError = this.validateSortOrder(data.sortOrder);
      if (sortOrderError) {
        errors.push(sortOrderError);
      }
    }

    // Validar location
    if (data.location !== undefined && data.location !== '') {
      const locationError = this.validateLength(data.location, 2, 100, 'location');
      if (locationError) {
        errors.push(locationError);
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.filter(Boolean),
    };
  }

  /**
   * Valida especialidades válidas
   */
  private validateSpecialty(specialty: string) {
    const validSpecialties = [
      'Psychology',
      'Programming',
      'Art',
      'Fitness',
      'Law',
      'Mechanics',
      'Agriculture',
      'Cloud Services',
      'Business',
      'Career Development',
      'Health',
      'Education',
      'Finance',
      'Design',
      'Marketing',
      'Writing',
      'Music',
      'Cooking',
      'Nutrition',
      'DevOps',
      'Data Science',
      'UX/UI Design',
    ];

    if (!validSpecialties.includes(specialty)) {
      return this.createError(
        'specialty',
        `Especialidad inválida. Opciones válidas: ${validSpecialties.join(', ')}`,
        'INVALID_SPECIALTY'
      );
    }

    return null;
  }

  /**
   * Valida rango de precios
   */
  private validatePriceRange(priceRange: { min: number; max: number }) {
    if (priceRange.min < 0) {
      return this.createError(
        'priceRange.min',
        'El precio mínimo no puede ser negativo',
        'NEGATIVE_PRICE'
      );
    }

    if (priceRange.max < 0) {
      return this.createError(
        'priceRange.max',
        'El precio máximo no puede ser negativo',
        'NEGATIVE_PRICE'
      );
    }

    if (priceRange.min > priceRange.max) {
      return this.createError(
        'priceRange',
        'El precio mínimo no puede ser mayor que el máximo',
        'INVALID_PRICE_RANGE'
      );
    }

    // Validar rango razonable (no más de $200 por sesión)
    if (priceRange.max > 200) {
      return this.createError(
        'priceRange.max',
        'El precio máximo no puede exceder $200',
        'PRICE_TOO_HIGH'
      );
    }

    return null;
  }

  /**
   * Valida criterios de ordenamiento
   */
  private validateSortBy(sortBy: string) {
    const validSortOptions = ['rating', 'name', 'price', 'availability'];

    if (!validSortOptions.includes(sortBy)) {
      return this.createError(
        'sortBy',
        `Criterio de ordenamiento inválido. Opciones: ${validSortOptions.join(', ')}`,
        'INVALID_SORT_BY'
      );
    }

    return null;
  }

  /**
   * Valida orden de clasificación
   */
  private validateSortOrder(sortOrder: string) {
    const validSortOrders = ['asc', 'desc'];

    if (!validSortOrders.includes(sortOrder)) {
      return this.createError(
        'sortOrder',
        'Orden de clasificación inválido. Usar: asc o desc',
        'INVALID_SORT_ORDER'
      );
    }

    return null;
  }

  /**
   * Validación rápida para búsqueda básica
   */
  static validateBasicSearch(specialty?: string, minRating?: number): ValidationResult {
    const validator = new SearchCoachValidator();
    const _data: SearchCoachDTO = { specialty, minRating };

    // Solo validar los campos proporcionados
    const errors = [];

    if (specialty) {
      const specialtyError = validator.validateSpecialty(specialty);
      if (specialtyError) {
        errors.push(specialtyError);
      }
    }

    if (minRating !== undefined) {
      const ratingError = validator.validateRange(minRating, 0, 5, 'minRating');
      if (ratingError) {
        errors.push(ratingError);
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.filter(Boolean),
    };
  }

  /**
   * Aplica valores por defecto para búsqueda
   */
  static applyDefaults(data: SearchCoachDTO): SearchCoachDTO {
    return {
      page: 1,
      limit: 20,
      sortBy: 'rating',
      sortOrder: 'desc',
      availableNow: true,
      ...data,
    };
  }
}
