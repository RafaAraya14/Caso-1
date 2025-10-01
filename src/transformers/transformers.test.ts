/**
 * Tests for Transformers (CoachTransformer and SessionTransformer)
 */

import { Coach } from '../models/Coach';
import { User } from '../models/User';
import type { CreateSessionDTO } from '../types/dtos/CreateSessionDTO';
import { CoachTransformer } from './CoachTransformer';
import { SessionTransformer } from './SessionTransformer';

describe('CoachTransformer', () => {
  let mockCoach: Coach;

  beforeEach(() => {
    mockCoach = new Coach('1', 'John Doe', 4.5, ['Leadership', 'Programming'], true, 3);
  });

  describe('toSummaryDTO', () => {
    it('should convert coach to summary DTO', () => {
      const result = CoachTransformer.toSummaryDTO(mockCoach);

      expect(result.id).toBe('1');
      expect(result.name).toBe('John Doe');
      expect(result.rating).toBe(4.5);
      expect(result.specialties).toEqual(['Leadership', 'Programming']);
      expect(result.isAvailable).toBe(true);
      expect(result.tier).toBe('gold'); // 4.5 rating = gold tier
      expect(typeof result.basePrice).toBe('number');
      expect(result.basePrice).toBeGreaterThan(0);
    });

    it('should round rating to 1 decimal place', () => {
      const coach = new Coach('1', 'Test', 4.567, ['Leadership'], true);
      const result = CoachTransformer.toSummaryDTO(coach);

      expect(result.rating).toBe(4.6);
    });

    it('should create copy of specialties array', () => {
      const result = CoachTransformer.toSummaryDTO(mockCoach);

      expect(result.specialties).toEqual(mockCoach.specialties);
      expect(result.specialties).not.toBe(mockCoach.specialties); // Different reference
    });

    it('should generate review count based on rating', () => {
      const result = CoachTransformer.toSummaryDTO(mockCoach);

      expect(typeof result.reviewCount).toBe('number');
      expect(result.reviewCount).toBeGreaterThan(0);
    });

    it('should include profile image URL', () => {
      const result = CoachTransformer.toSummaryDTO(mockCoach);

      expect(typeof result.profileImageUrl).toBe('string');
      expect(result.profileImageUrl).toContain(mockCoach.id);
    });

    it('should generate short bio', () => {
      const result = CoachTransformer.toSummaryDTO(mockCoach);

      expect(result.shortBio).toBeDefined();
      expect(typeof result.shortBio).toBe('string');
      if (result.shortBio) {
        expect(result.shortBio.length).toBeGreaterThan(0);
      }
    });

    it('should handle different coach tiers', () => {
      const coaches = [
        new Coach('1', 'Bronze', 3.8, ['Leadership'], true),
        new Coach('2', 'Silver', 4.2, ['Leadership'], true),
        new Coach('3', 'Gold', 4.6, ['Leadership'], true),
        new Coach('4', 'Platinum', 4.9, ['Leadership'], true),
      ];

      const results = coaches.map(coach => CoachTransformer.toSummaryDTO(coach));

      expect(results[0].tier).toBe('bronze');
      expect(results[1].tier).toBe('silver');
      expect(results[2].tier).toBe('gold');
      expect(results[3].tier).toBe('platinum');
    });

    it('should set nextAvailableSlot for available coaches', () => {
      const availableCoach = new Coach('1', 'Available', 4.0, ['Leadership'], true);
      const unavailableCoach = new Coach('2', 'Unavailable', 4.0, ['Leadership'], false);

      const availableResult = CoachTransformer.toSummaryDTO(availableCoach);
      const unavailableResult = CoachTransformer.toSummaryDTO(unavailableCoach);

      expect(availableResult.nextAvailableSlot).toBeDefined();
      expect(unavailableResult.nextAvailableSlot).toBeUndefined();
    });
  });

  describe('toDetailDTO', () => {
    it('should convert coach to detailed DTO', () => {
      const result = CoachTransformer.toDetailDTO(mockCoach);

      // Should include all summary fields
      expect(result.id).toBe('1');
      expect(result.name).toBe('John Doe');
      expect(result.rating).toBe(4.5);
      expect(result.specialties).toEqual(['Leadership', 'Programming']);

      // Should include additional detail fields
      expect(typeof result.email).toBe('string');
      expect(typeof result.fullBio).toBe('string');
      expect(typeof result.experience).toBe('string');
      expect(Array.isArray(result.certifications)).toBe(true);
      expect(Array.isArray(result.languages)).toBe(true);
      expect(typeof result.sessionCount).toBe('number');
      expect(result.joinedDate).toBeDefined();
      expect(typeof result.joinedDate).toBe('string');
    });

    it('should include availability information', () => {
      const result = CoachTransformer.toDetailDTO(mockCoach);

      expect(result.availability).toBeDefined();
      expect(Array.isArray(result.availability.timeSlots)).toBe(true);
      expect(typeof result.availability.timezone).toBe('string');
    });

    it('should include pricing information', () => {
      const result = CoachTransformer.toDetailDTO(mockCoach);

      expect(result.pricing).toBeDefined();
      expect(typeof result.pricing.baseRate).toBe('number');
      expect(typeof result.pricing.tierMultiplier).toBe('number');
      expect(typeof result.pricing.specialtyRates).toBe('object');
    });

    it('should include stats information', () => {
      const result = CoachTransformer.toDetailDTO(mockCoach);

      expect(result.stats).toBeDefined();
      expect(typeof result.stats.totalSessions).toBe('number');
      expect(typeof result.stats.averageRating).toBe('number');
      expect(typeof result.stats.completionRate).toBe('number');
      expect(typeof result.stats.responseTime).toBe('number');
    });

    it('should set correct tier multiplier', () => {
      const platinumCoach = new Coach('1', 'Platinum', 4.9, ['Leadership'], true);
      const result = CoachTransformer.toDetailDTO(platinumCoach);

      expect(result.pricing.tierMultiplier).toBe(1.5); // Platinum multiplier
    });
  });

  describe('fromApiData', () => {
    it('should convert API data to Coach model', () => {
      const apiData = {
        id: 123,
        name: 'API Coach',
        rating: 4.2,
        specialties: ['Leadership', 'Strategy'],
        is_available: true,
        sessions_today: 2,
      };

      const result = CoachTransformer.fromApiData(apiData);

      expect(result).toBeInstanceOf(Coach);
      expect(result.id).toBe('123');
      expect(result.name).toBe('API Coach');
      expect(result.rating).toBe(4.2);
      expect(result.specialties).toEqual(['Leadership', 'Strategy']);
      expect(result.isAvailable).toBe(true);
    });

    it('should handle missing fields with defaults', () => {
      const apiData = {};

      const result = CoachTransformer.fromApiData(apiData);

      expect(result.id).toBe('0');
      expect(result.name).toBe('Unknown Coach');
      expect(result.rating).toBe(0);
      expect(result.specialties).toEqual([]);
      expect(result.isAvailable).toBe(false);
    });

    it('should convert numeric ID to string', () => {
      const apiData = { id: 456 };

      const result = CoachTransformer.fromApiData(apiData);

      expect(result.id).toBe('456');
      expect(typeof result.id).toBe('string');
    });
  });

  describe('fromApiDataArray', () => {
    it('should convert array of API data to Coach models', () => {
      const apiDataArray = [
        { id: 1, name: 'Coach 1', rating: 4.0, specialties: ['Leadership'], is_available: true },
        { id: 2, name: 'Coach 2', rating: 4.5, specialties: ['Programming'], is_available: false },
      ];

      const result = CoachTransformer.fromApiDataArray(apiDataArray);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Coach);
      expect(result[1]).toBeInstanceOf(Coach);
      expect(result[0].name).toBe('Coach 1');
      expect(result[1].name).toBe('Coach 2');
    });

    it('should handle empty array', () => {
      const result = CoachTransformer.fromApiDataArray([]);

      expect(result).toEqual([]);
    });
  });

  describe('toApiUpdateData', () => {
    it('should convert Coach model to API update format', () => {
      const result = CoachTransformer.toApiUpdateData(mockCoach);

      expect(result.name).toBe('John Doe');
      expect(result.rating).toBe(4.5);
      expect(result.specialties).toEqual(['Leadership', 'Programming']);
      expect(result.is_available).toBe(true);
      expect(typeof result.sessions_today).toBe('number');
    });
  });

  describe('filterBySearchCriteria', () => {
    let coaches: Coach[];

    beforeEach(() => {
      coaches = [
        new Coach('1', 'Leadership Coach', 4.0, ['Leadership'], true),
        new Coach('2', 'Programming Coach', 4.5, ['Programming'], true),
        new Coach('3', 'Multi Coach', 3.8, ['Leadership', 'Programming'], false),
        new Coach('4', 'Low Rating', 2.5, ['Leadership'], true), // Below minimum rating
      ];
    });

    it('should filter by specialty', () => {
      const result = CoachTransformer.filterBySearchCriteria(coaches, 'Programming');

      expect(result).toHaveLength(2);
      expect(result.every(coach => coach.specialties.includes('Programming'))).toBe(true);
    });

    it('should filter by minimum rating', () => {
      const result = CoachTransformer.filterBySearchCriteria(coaches, undefined, 4.0);

      expect(result.every(coach => coach.rating >= 4.0)).toBe(true);
    });

    it('should filter by availability', () => {
      const result = CoachTransformer.filterBySearchCriteria(coaches, undefined, undefined, true);

      expect(result.every(coach => coach.isAvailable)).toBe(true);
    });

    it('should apply business rules filtering', () => {
      const result = CoachTransformer.filterBySearchCriteria(coaches);

      // Should exclude coach with rating below 3.5 (business rule)
      expect(result.every(coach => coach.rating >= 3.5)).toBe(true);
    });

    it('should combine multiple filters', () => {
      const result = CoachTransformer.filterBySearchCriteria(coaches, 'Programming', 4.0, true);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Programming Coach');
    });
  });
});

describe('SessionTransformer', () => {
  let mockUser: User;
  let mockCoach: Coach;
  let mockCreateSessionDTO: CreateSessionDTO;

  beforeEach(() => {
    mockUser = new User('1', 'user@test.com', 'Test User', 'BasicUser', true, 5);
    mockCoach = new Coach('1', 'Test Coach', 4.5, ['Leadership'], true);
    mockCreateSessionDTO = {
      userId: '1',
      coachId: '1',
      scheduledDateTime: '2024-01-15T10:00:00Z',
      duration: 20,
      sessionType: 'video-call',
      scheduledTime: '2024-01-15T10:00:00Z',
      specialty: 'Leadership',
      notes: 'Test session',
      preferredDuration: 20,
    };
  });

  describe('toApiCreateData', () => {
    it('should convert DTO and entities to API format', () => {
      const result = SessionTransformer.toApiCreateData(mockCreateSessionDTO, mockUser, mockCoach);

      expect(result.user_id).toBe('1');
      expect(result.coach_id).toBe('1');
      expect(result.scheduled_time).toBe('2024-01-15T10:00:00Z');
      expect(result.specialty).toBe('Leadership');
      expect(result.notes).toBe('Test session');
      expect(result.duration).toBe(20);
      expect(result.status).toBe('pending');
      expect(typeof result.cost).toBe('number');
      expect(typeof result.created_at).toBe('string');
    });

    it('should use default duration when not specified', () => {
      const dtoWithoutDuration = { ...mockCreateSessionDTO };
      delete dtoWithoutDuration.preferredDuration;

      const result = SessionTransformer.toApiCreateData(dtoWithoutDuration, mockUser, mockCoach);

      expect(result.duration).toBe(20); // Default duration
    });

    it('should calculate different costs for different user types', () => {
      const basicUser = new User('1', 'basic@test.com', 'Basic', 'BasicUser', true, 5);
      const premiumUser = new User('2', 'premium@test.com', 'Premium', 'PremiumUser', true, 10);

      const basicResult = SessionTransformer.toApiCreateData(
        mockCreateSessionDTO,
        basicUser,
        mockCoach
      );
      const premiumResult = SessionTransformer.toApiCreateData(
        mockCreateSessionDTO,
        premiumUser,
        mockCoach
      );

      expect(basicResult.cost).toBe(20);
      expect(premiumResult.cost).toBe(15); // 25% discount for premium
    });
  });

  describe('fromApiCreateResponse', () => {
    it('should convert API response to CreateSessionResponseDTO', () => {
      const apiData = {
        id: 'session-123',
        user_id: '1',
        coach_id: '1',
        scheduled_time: '2024-01-15T10:00:00Z',
        status: 'confirmed',
        cost: 20,
        duration: 20,
        created_at: '2024-01-10T09:00:00Z',
      };

      const result = SessionTransformer.fromApiCreateResponse(apiData, mockCreateSessionDTO);

      expect(result.sessionId).toBe('session-123');
      expect(result.userId).toBe('1');
      expect(result.coachId).toBe('1');
      expect(result.scheduledTime).toBe('2024-01-15T10:00:00Z');
      expect(result.status).toBe('confirmed');
      expect(result.cost).toBe(20);
      expect(result.duration).toBe(20);
      expect(typeof result.meetingLink).toBe('string');
      expect(result.createdAt).toBe('2024-01-10T09:00:00Z');
    });

    it('should generate meeting link based on session ID', () => {
      const apiData = { id: 'test-session-456' };

      const result = SessionTransformer.fromApiCreateResponse(apiData, mockCreateSessionDTO);

      expect(result.meetingLink).toContain('test-session-456');
    });
  });

  describe('toListItemDTO', () => {
    it('should convert session and coach data to list item DTO', () => {
      const sessionData = {
        id: 'session-123',
        scheduled_time: '2024-01-15T10:00:00Z',
        status: 'confirmed',
        duration: 20,
        cost: 20,
      };

      const coachData = {
        name: 'Test Coach',
        specialties: ['Leadership', 'Programming'],
      };

      const result = SessionTransformer.toListItemDTO(sessionData, coachData);

      expect(result.sessionId).toBe('session-123');
      expect(result.coachName).toBe('Test Coach');
      expect(result.coachSpecialties).toEqual(['Leadership', 'Programming']);
      expect(result.scheduledTime).toBe('2024-01-15T10:00:00Z');
      expect(result.status).toBe('confirmed');
      expect(result.duration).toBe(20);
      expect(result.cost).toBe(20);
    });

    it('should handle missing coach data', () => {
      const sessionData = {
        id: 'session-123',
        scheduled_time: '2024-01-15T10:00:00Z',
        status: 'confirmed',
        duration: 20,
        cost: 20,
      };

      const result = SessionTransformer.toListItemDTO(sessionData);

      expect(result.coachName).toBe('Coach Desconocido');
      expect(result.coachSpecialties).toEqual([]);
    });
  });

  describe('toListItemDTOArray', () => {
    it('should convert multiple sessions to list item DTOs', () => {
      const sessionsData = [
        {
          id: 'session-1',
          coach_id: 'coach-1',
          scheduled_time: '2024-01-15T10:00:00Z',
          status: 'confirmed',
          duration: 20,
          cost: 20,
        },
        {
          id: 'session-2',
          coach_id: 'coach-2',
          scheduled_time: '2024-01-16T11:00:00Z',
          status: 'pending',
          duration: 20,
          cost: 15,
        },
      ];

      const coachesData = {
        'coach-1': { name: 'Coach One', specialties: ['Leadership'] },
        'coach-2': { name: 'Coach Two', specialties: ['Programming'] },
      };

      const result = SessionTransformer.toListItemDTOArray(sessionsData, coachesData);

      expect(result).toHaveLength(2);
      expect(result[0].sessionId).toBe('session-1');
      expect(result[0].coachName).toBe('Coach One');
      expect(result[1].sessionId).toBe('session-2');
      expect(result[1].coachName).toBe('Coach Two');
    });

    it('should handle sessions with missing coach data', () => {
      const sessionsData = [
        {
          id: 'session-1',
          coach_id: 'missing-coach',
          scheduled_time: '2024-01-15T10:00:00Z',
          status: 'confirmed',
          duration: 20,
          cost: 20,
        },
      ];

      const coachesData = {};

      const result = SessionTransformer.toListItemDTOArray(sessionsData, coachesData);

      expect(result).toHaveLength(1);
      expect(result[0].coachName).toBe('Coach Desconocido');
      expect(result[0].coachSpecialties).toEqual([]);
    });
  });

  describe('static helper methods', () => {
    it('should calculate session costs correctly', () => {
      // This tests the private calculateCost method indirectly
      const basicUser = new User('1', 'basic@test.com', 'Basic', 'BasicUser', true, 5);
      const premiumUser = new User('2', 'premium@test.com', 'Premium', 'PremiumUser', true, 10);

      const basicResult = SessionTransformer.toApiCreateData(
        mockCreateSessionDTO,
        basicUser,
        mockCoach
      );
      const premiumResult = SessionTransformer.toApiCreateData(
        mockCreateSessionDTO,
        premiumUser,
        mockCoach
      );

      expect(basicResult.cost).toBeGreaterThan(premiumResult.cost);
      expect(basicResult.cost).toBe(20);
      expect(premiumResult.cost).toBe(15);
    });
  });
});
