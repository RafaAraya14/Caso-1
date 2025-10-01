import type { CreateSessionDTO } from '../types/dtos/CreateSessionDTO';
import type { SearchCoachDTO } from '../types/dtos/SearchCoachDTO';
import { CreateSessionValidator } from './CreateSessionValidator';
import { SearchCoachValidator } from './SearchCoachValidator';

describe('Validators', () => {
  describe('SearchCoachValidator', () => {
    let validator: SearchCoachValidator;

    beforeEach(() => {
      validator = new SearchCoachValidator();
    });

    describe('Query validation', () => {
      it('should validate complete search query', () => {
        const validQuery: SearchCoachDTO = {
          searchTerm: 'psychology',
          specialty: 'psychology',
          availableNow: true,
          location: 'remote',
          priceRange: { min: 10, max: 50 },
          minRating: 4.0,
          sortBy: 'rating',
          sortOrder: 'desc',
          limit: 10,
          offset: 0,
        };

        const result = validator.validate(validQuery);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate minimal search query', () => {
        const minimalQuery: SearchCoachDTO = {
          searchTerm: 'coach',
          sortBy: 'rating',
          sortOrder: 'desc',
          limit: 10,
          offset: 0,
        };

        const result = validator.validate(minimalQuery);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail validation for empty search term', () => {
        const invalidQuery: SearchCoachDTO = {
          searchTerm: '',
          sortBy: 'rating',
          sortOrder: 'desc',
          limit: 10,
          offset: 0,
        };

        const result = validator.validate(invalidQuery);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(e => e.field === 'searchTerm')).toBe(true);
      });

      it('should fail validation for invalid price range', () => {
        const invalidQuery: SearchCoachDTO = {
          searchTerm: 'coach',
          priceRange: { min: 100, max: 50 }, // min > max
          sortBy: 'rating',
          sortOrder: 'desc',
          limit: 10,
          offset: 0,
        };

        const result = validator.validate(invalidQuery);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'priceRange')).toBe(true);
      });

      it('should fail validation for invalid rating', () => {
        const invalidQuery: SearchCoachDTO = {
          searchTerm: 'coach',
          minRating: 6, // Rating should be 1-5
          sortBy: 'rating',
          sortOrder: 'desc',
          limit: 10,
          offset: 0,
        };

        const result = validator.validate(invalidQuery);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'minRating')).toBe(true);
      });

      it('should fail validation for negative limit', () => {
        const invalidQuery: SearchCoachDTO = {
          searchTerm: 'coach',
          limit: -5,
          offset: 0,
          sortBy: 'rating',
          sortOrder: 'desc',
        };

        const result = validator.validate(invalidQuery);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'limit')).toBe(true);
      });
    });

    describe('Specialty validation', () => {
      it('should accept valid specialties', () => {
        const validSpecialties = ['psychology', 'fitness', 'business', 'technology', 'arts'];

        validSpecialties.forEach(specialty => {
          const query: SearchCoachDTO = {
            searchTerm: 'coach',
            specialty,
            sortBy: 'rating',
            sortOrder: 'desc',
            limit: 10,
            offset: 0,
          };

          const result = validator.validate(query);
          expect(result.isValid).toBe(true);
        });
      });

      it('should reject invalid specialty', () => {
        const invalidQuery: SearchCoachDTO = {
          searchTerm: 'coach',
          specialty: 'invalid-specialty',
          sortBy: 'rating',
          sortOrder: 'desc',
          limit: 10,
          offset: 0,
        };

        const result = validator.validate(invalidQuery);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'specialty')).toBe(true);
      });
    });
  });

  describe('CreateSessionValidator', () => {
    let validator: CreateSessionValidator;

    beforeEach(() => {
      validator = new CreateSessionValidator();
    });

    describe('Session creation validation', () => {
      it('should validate complete session data', () => {
        const validSession: CreateSessionDTO = {
          coachId: 'coach-123',
          userId: 'user-456',
          scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 20,
          sessionType: 'video-call',
          topic: 'Career guidance',
          notes: 'Looking for advice on career transition',
          timezone: 'America/New_York',
        };

        const result = validator.validate(validSession);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate minimal session data', () => {
        const minimalSession: CreateSessionDTO = {
          coachId: 'coach-123',
          userId: 'user-456',
          scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 20,
          sessionType: 'video-call',
        };

        const result = validator.validate(minimalSession);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail validation for missing required fields', () => {
        const incompleteSession = {
          coachId: 'coach-123',
          // Missing required fields
        } as CreateSessionDTO;

        const result = validator.validate(incompleteSession);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('should fail validation for invalid coach ID format', () => {
        const invalidSession: CreateSessionDTO = {
          coachId: 'invalid-id',
          userId: 'user-456',
          scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 20,
          sessionType: 'video-call',
        };

        const result = validator.validate(invalidSession);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'coachId')).toBe(true);
      });

      it('should fail validation for past scheduled time', () => {
        const pastSession: CreateSessionDTO = {
          coachId: 'coach-123',
          userId: 'user-456',
          scheduledDateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          duration: 20,
          sessionType: 'video-call',
        };

        const result = validator.validate(pastSession);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'scheduledDateTime')).toBe(true);
      });

      it('should fail validation for invalid duration', () => {
        const invalidDuration: CreateSessionDTO = {
          coachId: 'coach-123',
          userId: 'user-456',
          scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 5, // Too short
          sessionType: 'video-call',
        };

        const result = validator.validate(invalidDuration);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'duration')).toBe(true);
      });

      it('should fail validation for invalid session type', () => {
        const invalidType: CreateSessionDTO = {
          coachId: 'coach-123',
          userId: 'user-456',
          scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 20,
          sessionType: 'invalid-type' as any,
        };

        const result = validator.validate(invalidType);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'sessionType')).toBe(true);
      });
    });

    describe('Business rules validation', () => {
      it('should fail validation for session too close to current time', () => {
        const tooSoonSession: CreateSessionDTO = {
          coachId: 'coach-123',
          userId: 'user-456',
          scheduledDateTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
          duration: 20,
          sessionType: 'video-call',
        };

        const result = validator.validate(tooSoonSession);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'scheduledDateTime')).toBe(true);
      });

      it('should fail validation for topic too long', () => {
        const longTopic: CreateSessionDTO = {
          coachId: 'coach-123',
          userId: 'user-456',
          scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 20,
          sessionType: 'video-call',
          topic: 'a'.repeat(201), // Too long
        };

        const result = validator.validate(longTopic);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'topic')).toBe(true);
      });

      it('should fail validation for notes too long', () => {
        const longNotes: CreateSessionDTO = {
          coachId: 'coach-123',
          userId: 'user-456',
          scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 20,
          sessionType: 'video-call',
          notes: 'a'.repeat(1001), // Too long
        };

        const result = validator.validate(longNotes);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'notes')).toBe(true);
      });
    });

    describe('Edge cases', () => {
      it('should validate maximum allowed duration', () => {
        const maxDurationSession: CreateSessionDTO = {
          coachId: 'coach-123',
          userId: 'user-456',
          scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 60, // Maximum duration
          sessionType: 'video-call',
        };

        const result = validator.validate(maxDurationSession);
        expect(result.isValid).toBe(true);
      });

      it('should fail validation for duration too long', () => {
        const tooLongSession: CreateSessionDTO = {
          coachId: 'coach-123',
          userId: 'user-456',
          scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 120, // Too long
          sessionType: 'video-call',
        };

        const result = validator.validate(tooLongSession);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'duration')).toBe(true);
      });

      it('should validate empty optional fields', () => {
        const sessionWithEmptyOptionals: CreateSessionDTO = {
          coachId: 'coach-123',
          userId: 'user-456',
          scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 20,
          sessionType: 'video-call',
          topic: '',
          notes: '',
        };

        const result = validator.validate(sessionWithEmptyOptionals);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('Validation error structure', () => {
    it('should return proper error structure', () => {
      const validator = new SearchCoachValidator();
      const invalidQuery: SearchCoachDTO = {
        searchTerm: '',
        minRating: 10,
        sortBy: 'rating',
        sortOrder: 'desc',
        limit: -1,
        offset: 0,
      };

      const result = validator.validate(invalidQuery);

      expect(result.isValid).toBe(false);
      expect(Array.isArray(result.errors)).toBe(true);

      result.errors.forEach(error => {
        expect(error).toHaveProperty('field');
        expect(error).toHaveProperty('message');
        expect(error).toHaveProperty('code');
        expect(typeof error.field).toBe('string');
        expect(typeof error.message).toBe('string');
        expect(typeof error.code).toBe('string');
      });
    });

    it('should provide meaningful error messages', () => {
      const validator = new CreateSessionValidator();
      const invalidSession = {
        coachId: 'invalid',
      } as CreateSessionDTO;

      const result = validator.validate(invalidSession);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

      result.errors.forEach(error => {
        expect(error.message.length).toBeGreaterThan(5);
        expect(error.message).not.toBe('Invalid');
      });
    });
  });

  describe('Validator integration', () => {
    it('should work together in validation workflows', () => {
      const searchValidator = new SearchCoachValidator();
      const sessionValidator = new CreateSessionValidator();

      // Simulate search -> booking workflow
      const searchQuery: SearchCoachDTO = {
        searchTerm: 'psychology coach',
        specialty: 'psychology',
        sortBy: 'rating',
        sortOrder: 'desc',
        limit: 10,
        offset: 0,
      };

      const sessionData: CreateSessionDTO = {
        coachId: 'coach-123', // Would come from search results
        userId: 'user-456',
        scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: 20,
        sessionType: 'video-call',
        topic: 'Mental health consultation',
      };

      const searchResult = searchValidator.validate(searchQuery);
      const sessionResult = sessionValidator.validate(sessionData);

      expect(searchResult.isValid).toBe(true);
      expect(sessionResult.isValid).toBe(true);
    });
  });
});
