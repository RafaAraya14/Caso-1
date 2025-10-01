/**
 * Tests for Use Cases (BookSessionUseCase and SearchCoachUseCase)
 */

import { Coach } from '../models/Coach';
import { BookSessionRequest, BookSessionUseCase } from './useCases/BookSessionUseCase';
import { SearchCoachRequest, SearchCoachUseCase } from './useCases/SearchCoachUseCase';

// Mock console.log to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('BookSessionUseCase', () => {
  beforeEach(() => {
    consoleSpy.mockClear();
  });

  describe('execute', () => {
    it('should successfully book a session with valid request', async () => {
      const request: BookSessionRequest = {
        userId: 'user123',
        coachId: 'coach456',
        requestedHour: 10,
        specialty: 'Programming',
      };

      const result = await BookSessionUseCase.execute(request);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
      expect(result.cost).toBe(20); // BasicUser cost
      expect(result.scheduledTime).toBeInstanceOf(Date);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should fail with empty userId', async () => {
      const request: BookSessionRequest = {
        userId: '',
        coachId: 'coach456',
        requestedHour: 10,
      };

      const result = await BookSessionUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('ID de usuario requerido');
      expect(result.sessionId).toBeUndefined();
    });

    it('should fail with empty coachId', async () => {
      const request: BookSessionRequest = {
        userId: 'user123',
        coachId: '',
        requestedHour: 10,
      };

      const result = await BookSessionUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('ID de coach requerido');
    });

    it('should fail with invalid hour', async () => {
      const request: BookSessionRequest = {
        userId: 'user123',
        coachId: 'coach456',
        requestedHour: 25, // Invalid hour
      };

      const result = await BookSessionUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Hora inválida');
    });

    it('should fail with negative hour', async () => {
      const request: BookSessionRequest = {
        userId: 'user123',
        coachId: 'coach456',
        requestedHour: -1,
      };

      const result = await BookSessionUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Hora inválida');
    });

    it('should handle edge case hours', async () => {
      const validHours = [0, 23];

      for (const hour of validHours) {
        const request: BookSessionRequest = {
          userId: 'user123',
          coachId: 'coach456',
          requestedHour: hour,
        };

        const result = await BookSessionUseCase.execute(request);

        // These might fail on business rules but should pass validation
        expect(result.errorMessage).not.toContain('Hora inválida');
      }
    });

    it('should calculate correct cost for different user types', async () => {
      const request: BookSessionRequest = {
        userId: 'user123',
        coachId: 'coach456',
        requestedHour: 15,
      };

      const result = await BookSessionUseCase.execute(request);

      expect(result.success).toBe(true);
      expect(result.cost).toBe(20); // BasicUser default cost
    });

    it('should generate unique session IDs', async () => {
      const request: BookSessionRequest = {
        userId: 'user123',
        coachId: 'coach456',
        requestedHour: 14,
      };

      const results = await Promise.all([
        BookSessionUseCase.execute(request),
        BookSessionUseCase.execute(request),
        BookSessionUseCase.execute(request),
      ]);

      const sessionIds = results.map(r => r.sessionId).filter(Boolean);
      const uniqueIds = new Set(sessionIds);

      expect(uniqueIds.size).toBe(sessionIds.length); // All IDs should be unique
    });

    it('should set correct scheduled time', async () => {
      const requestedHour = 16;
      const request: BookSessionRequest = {
        userId: 'user123',
        coachId: 'coach456',
        requestedHour,
      };

      const result = await BookSessionUseCase.execute(request);

      expect(result.success).toBe(true);
      expect(result.scheduledTime).toBeDefined();
      expect(result.scheduledTime!.getHours()).toBe(requestedHour);
      expect(result.scheduledTime!.getMinutes()).toBe(0);
      expect(result.scheduledTime!.getSeconds()).toBe(0);
      expect(result.scheduledTime!.getMilliseconds()).toBe(0);
    });

    it('should log session creation', async () => {
      const request: BookSessionRequest = {
        userId: 'user123',
        coachId: 'coach456',
        requestedHour: 12,
      };

      await BookSessionUseCase.execute(request);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Creating session:'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('user123'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('coach456'));
    });

    it('should log credit updates', async () => {
      const request: BookSessionRequest = {
        userId: 'user123',
        coachId: 'coach456',
        requestedHour: 13,
      };

      await BookSessionUseCase.execute(request);

      expect(consoleSpy).toHaveBeenCalledWith('Updating credits for user: user123');
    });

    it('should log coach notifications', async () => {
      const request: BookSessionRequest = {
        userId: 'user123',
        coachId: 'coach456',
        requestedHour: 11,
      };

      const result = await BookSessionUseCase.execute(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notifying coach coach456 about new session:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(result.sessionId!));
    });

    it('should handle whitespace in user ID', async () => {
      const request: BookSessionRequest = {
        userId: '   ',
        coachId: 'coach456',
        requestedHour: 10,
      };

      const result = await BookSessionUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('ID de usuario requerido');
    });

    it('should handle whitespace in coach ID', async () => {
      const request: BookSessionRequest = {
        userId: 'user123',
        coachId: '   ',
        requestedHour: 10,
      };

      const result = await BookSessionUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('ID de coach requerido');
    });

    it('should include specialty in request when provided', async () => {
      const request: BookSessionRequest = {
        userId: 'user123',
        coachId: 'coach456',
        requestedHour: 10,
        specialty: 'Leadership',
      };

      const result = await BookSessionUseCase.execute(request);

      expect(result.success).toBe(true);
      // Specialty doesn't affect the booking directly but should be processed
    });
  });
});

describe('SearchCoachUseCase', () => {
  describe('execute', () => {
    it('should successfully search coaches with empty criteria', async () => {
      const request: SearchCoachRequest = {};

      const result = await SearchCoachUseCase.execute(request);

      expect(result.success).toBe(true);
      expect(result.coaches).toBeInstanceOf(Array);
      expect(result.totalFound).toBeGreaterThanOrEqual(0);
      expect(result.searchCriteria).toEqual(request);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should search coaches by specialty', async () => {
      const request: SearchCoachRequest = {
        specialty: 'Programming',
      };

      const result = await SearchCoachUseCase.execute(request);

      expect(result.success).toBe(true);
      expect(result.searchCriteria.specialty).toBe('Programming');

      // All returned coaches should have the specialty if any are returned
      if (result.coaches.length > 0) {
        result.coaches.forEach(coach => {
          expect(coach.specialties).toContain('Programming');
        });
      }
    });

    it('should search coaches by minimum rating', async () => {
      const minRating = 4.0;
      const request: SearchCoachRequest = {
        minRating,
      };

      const result = await SearchCoachUseCase.execute(request);

      expect(result.success).toBe(true);
      expect(result.searchCriteria.minRating).toBe(minRating);

      // All returned coaches should meet minimum rating
      result.coaches.forEach(coach => {
        expect(coach.rating).toBeGreaterThanOrEqual(minRating);
      });
    });

    it('should limit results when maxResults is specified', async () => {
      const maxResults = 2;
      const request: SearchCoachRequest = {
        maxResults,
      };

      const result = await SearchCoachUseCase.execute(request);

      expect(result.success).toBe(true);
      expect(result.coaches.length).toBeLessThanOrEqual(maxResults);
      expect(result.searchCriteria.maxResults).toBe(maxResults);
    });

    it('should search by location', async () => {
      const location = 'New York';
      const request: SearchCoachRequest = {
        location,
      };

      const result = await SearchCoachUseCase.execute(request);

      expect(result.success).toBe(true);
      expect(result.searchCriteria.location).toBe(location);
      // Location filtering logic would be tested here in real implementation
    });

    it('should filter by availability when requested', async () => {
      const request: SearchCoachRequest = {
        availableNow: true,
      };

      const result = await SearchCoachUseCase.execute(request);

      expect(result.success).toBe(true);
      expect(result.searchCriteria.availableNow).toBe(true);

      // All returned coaches should be available
      result.coaches.forEach(coach => {
        expect(coach.isAvailable).toBe(true);
      });
    });

    it('should handle combined search criteria', async () => {
      const request: SearchCoachRequest = {
        specialty: 'Career',
        minRating: 4.0,
        maxResults: 3,
        availableNow: true,
      };

      const result = await SearchCoachUseCase.execute(request);

      expect(result.success).toBe(true);
      expect(result.coaches.length).toBeLessThanOrEqual(3);
      expect(result.searchCriteria).toEqual(request);

      result.coaches.forEach(coach => {
        expect(coach.specialties).toContain('Career');
        expect(coach.rating).toBeGreaterThanOrEqual(4.0);
        expect(coach.isAvailable).toBe(true);
      });
    });

    it('should handle negative minimum rating gracefully', async () => {
      const request: SearchCoachRequest = {
        minRating: -1,
      };

      const result = await SearchCoachUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Rating mínimo debe estar entre 0 y 5');
    });

    it('should handle excessive minimum rating gracefully', async () => {
      const request: SearchCoachRequest = {
        minRating: 6.0, // Above maximum possible rating
      };

      const result = await SearchCoachUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Rating mínimo debe estar entre 0 y 5');
    });

    it('should handle negative maxResults', async () => {
      const request: SearchCoachRequest = {
        maxResults: -1,
      };

      const result = await SearchCoachUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Máximo de resultados debe ser mayor que 0');
    });

    it('should handle zero maxResults', async () => {
      const request: SearchCoachRequest = {
        maxResults: 0,
      };

      const result = await SearchCoachUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Máximo de resultados debe ser mayor que 0');
    });

    it('should return coaches with proper structure', async () => {
      const request: SearchCoachRequest = {};

      const result = await SearchCoachUseCase.execute(request);

      expect(result.success).toBe(true);

      result.coaches.forEach(coach => {
        expect(coach).toBeInstanceOf(Coach);
        expect(typeof coach.id).toBe('string');
        expect(typeof coach.name).toBe('string');
        expect(typeof coach.rating).toBe('number');
        expect(Array.isArray(coach.specialties)).toBe(true);
        expect(typeof coach.isAvailable).toBe('boolean');
      });
    });

    it('should maintain search criteria in response', async () => {
      const request: SearchCoachRequest = {
        specialty: 'Leadership',
        minRating: 3.5,
        maxResults: 5,
        location: 'Seattle',
        availableNow: false,
      };

      const result = await SearchCoachUseCase.execute(request);

      expect(result.searchCriteria).toEqual(request);
    });

    it('should return correct totalFound count', async () => {
      const request: SearchCoachRequest = {};

      const result = await SearchCoachUseCase.execute(request);

      expect(result.success).toBe(true);
      expect(result.totalFound).toBe(result.coaches.length);
      expect(typeof result.totalFound).toBe('number');
      expect(result.totalFound).toBeGreaterThanOrEqual(0);
    });
  });
});
