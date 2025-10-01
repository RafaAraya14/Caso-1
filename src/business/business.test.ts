/**
 * Tests for Business Rules (CoachRules and SessionRules)
 */

import { Coach } from '../models/Coach';
import { User } from '../models/User';
import { CoachRules } from './rules/CoachRules';
import { SessionRules } from './rules/SessionRules';

describe('CoachRules', () => {
  describe('getCoachTier', () => {
    it('should return platinum for rating >= 4.8', () => {
      expect(CoachRules.getCoachTier(4.8)).toBe('platinum');
      expect(CoachRules.getCoachTier(4.9)).toBe('platinum');
      expect(CoachRules.getCoachTier(5.0)).toBe('platinum');
    });

    it('should return gold for rating >= 4.5 and < 4.8', () => {
      expect(CoachRules.getCoachTier(4.5)).toBe('gold');
      expect(CoachRules.getCoachTier(4.6)).toBe('gold');
      expect(CoachRules.getCoachTier(4.79)).toBe('gold');
    });

    it('should return silver for rating >= 4.0 and < 4.5', () => {
      expect(CoachRules.getCoachTier(4.0)).toBe('silver');
      expect(CoachRules.getCoachTier(4.2)).toBe('silver');
      expect(CoachRules.getCoachTier(4.49)).toBe('silver');
    });

    it('should return bronze for rating < 4.0', () => {
      expect(CoachRules.getCoachTier(3.5)).toBe('bronze');
      expect(CoachRules.getCoachTier(3.9)).toBe('bronze');
      expect(CoachRules.getCoachTier(0)).toBe('bronze');
    });

    it('should handle edge cases', () => {
      expect(CoachRules.getCoachTier(4.799999)).toBe('gold');
      expect(CoachRules.getCoachTier(4.8)).toBe('platinum');
    });
  });

  describe('getTierMultiplier', () => {
    it('should return correct multipliers for each tier', () => {
      expect(CoachRules.getTierMultiplier('bronze')).toBe(1.0);
      expect(CoachRules.getTierMultiplier('silver')).toBe(1.1);
      expect(CoachRules.getTierMultiplier('gold')).toBe(1.25);
      expect(CoachRules.getTierMultiplier('platinum')).toBe(1.5);
    });
  });

  describe('isQualifiedCoach', () => {
    it('should return qualified for coach with good rating and specialties', () => {
      const coach = new Coach('1', 'Test Coach', 4.0, ['Leadership', 'Communication'], true);

      const result = CoachRules.isQualifiedCoach(coach);
      expect(result.isQualified).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should return not qualified for coach with low rating', () => {
      const coach = new Coach('1', 'Low Rated Coach', 3.0, ['Leadership'], true);

      const result = CoachRules.isQualifiedCoach(coach);
      expect(result.isQualified).toBe(false);
      expect(result.reason).toContain('Rating insuficiente');
    });

    it('should return not qualified for coach without specialties', () => {
      const coach = new Coach('1', 'No Specialties Coach', 4.5, [], true);

      const result = CoachRules.isQualifiedCoach(coach);
      expect(result.isQualified).toBe(false);
      expect(result.reason).toContain('especialidad definida');
    });

    it('should handle null specialties', () => {
      const coach = new Coach('1', 'Null Specialties Coach', 4.5, null as any, true);

      const result = CoachRules.isQualifiedCoach(coach);
      expect(result.isQualified).toBe(false);
    });
  });

  describe('canAcceptMoreSessions', () => {
    it('should allow accepting sessions under the limit', () => {
      const result = CoachRules.canAcceptMoreSessions(5);
      expect(result.canAccept).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should not allow accepting sessions at the limit', () => {
      const result = CoachRules.canAcceptMoreSessions(8);
      expect(result.canAccept).toBe(false);
      expect(result.reason).toContain('Límite diario alcanzado');
    });

    it('should not allow accepting sessions above the limit', () => {
      const result = CoachRules.canAcceptMoreSessions(10);
      expect(result.canAccept).toBe(false);
      expect(result.reason).toContain('8 sesiones');
    });

    it('should handle zero sessions', () => {
      const result = CoachRules.canAcceptMoreSessions(0);
      expect(result.canAccept).toBe(true);
    });
  });

  describe('calculateExpectedEarnings', () => {
    it('should calculate earnings for bronze tier coach', () => {
      const coach = new Coach('1', 'Bronze Coach', 3.8, ['Leadership'], true);

      const result = CoachRules.calculateExpectedEarnings(coach, 5);
      expect(result.baseEarnings).toBe(125); // 5 * 25
      expect(result.tierBonus).toBe(0); // Bronze has 1.0 multiplier
      expect(result.totalEarnings).toBe(125);
    });

    it('should calculate earnings for silver tier coach', () => {
      const coach = new Coach('1', 'Silver Coach', 4.2, ['Leadership'], true);

      const result = CoachRules.calculateExpectedEarnings(coach, 4);
      expect(result.baseEarnings).toBe(100); // 4 * 25
      expect(result.tierBonus).toBeCloseTo(10, 1); // 100 * (1.1 - 1)
      expect(result.totalEarnings).toBeCloseTo(110, 1); // 100 * 1.1
    });

    it('should calculate earnings for gold tier coach', () => {
      const coach = new Coach('1', 'Gold Coach', 4.6, ['Leadership'], true);

      const result = CoachRules.calculateExpectedEarnings(coach, 3);
      expect(result.baseEarnings).toBe(75); // 3 * 25
      expect(result.tierBonus).toBe(18.75); // 75 * (1.25 - 1)
      expect(result.totalEarnings).toBe(93.75); // 75 * 1.25
    });

    it('should calculate earnings for platinum tier coach', () => {
      const coach = new Coach('1', 'Platinum Coach', 4.9, ['Leadership'], true);

      const result = CoachRules.calculateExpectedEarnings(coach, 2);
      expect(result.baseEarnings).toBe(50); // 2 * 25
      expect(result.tierBonus).toBe(25); // 50 * (1.5 - 1)
      expect(result.totalEarnings).toBe(75); // 50 * 1.5
    });
  });

  describe('needsTraining', () => {
    it('should recommend training for bronze tier coaches', () => {
      const coach = new Coach('1', 'Bronze Coach', 3.7, ['Leadership', 'Communication'], true);

      const result = CoachRules.needsTraining(coach);
      expect(result.needsTraining).toBe(true);
      expect(result.reason).toContain('Bronze');
    });

    it('should recommend training for coaches with few specialties', () => {
      const coach = new Coach('1', 'Limited Specialties Coach', 4.5, ['Leadership'], true);

      const result = CoachRules.needsTraining(coach);
      expect(result.needsTraining).toBe(true);
      expect(result.reason).toContain('especialidades');
    });

    it('should not recommend training for well-qualified coaches', () => {
      const coach = new Coach(
        '1',
        'Well Qualified Coach',
        4.5,
        ['Leadership', 'Communication', 'Strategy'],
        true
      );

      const result = CoachRules.needsTraining(coach);
      expect(result.needsTraining).toBe(false);
    });
  });

  describe('filterAvailableCoaches', () => {
    it('should filter coaches correctly by availability and qualification', () => {
      const coaches = [
        new Coach('1', 'Available Qualified', 4.0, ['Leadership'], true),
        new Coach('2', 'Unavailable', 4.0, ['Leadership'], false),
        new Coach('3', 'Low Rating', 3.0, ['Leadership'], true),
      ];

      // Mock canAcceptSession method
      coaches.forEach(coach => {
        coach.canAcceptSession = jest.fn().mockReturnValue(true);
      });

      const result = CoachRules.filterAvailableCoaches(coaches);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Available Qualified');
    });

    it('should filter by specialty when specified', () => {
      const coaches = [
        new Coach('1', 'Leadership Coach', 4.0, ['Leadership'], true),
        new Coach('2', 'Communication Coach', 4.0, ['Communication'], true),
      ];

      coaches.forEach(coach => {
        coach.canAcceptSession = jest.fn().mockReturnValue(true);
      });

      const result = CoachRules.filterAvailableCoaches(coaches, 'Leadership');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Leadership Coach');
    });
  });
});

describe('SessionRules', () => {
  describe('canUserBookSession', () => {
    it('should allow BasicUser with active subscription and credits', () => {
      const user = new User('1', 'test@example.com', 'Test User', 'BasicUser', true, 5);

      const result = SessionRules.canUserBookSession(user);
      expect(result.canBook).toBe(true);
    });

    it('should allow PremiumUser with active subscription and credits', () => {
      const user = new User('1', 'premium@example.com', 'Premium User', 'PremiumUser', true, 10);

      const result = SessionRules.canUserBookSession(user);
      expect(result.canBook).toBe(true);
    });

    it('should not allow Admin to book sessions', () => {
      const user = new User('1', 'admin@example.com', 'Admin User', 'AdminUser', true, 10);

      const result = SessionRules.canUserBookSession(user);
      expect(result.canBook).toBe(false);
      expect(result.reason).toContain('usuarios registrados');
    });

    it('should not allow users without active subscription', () => {
      const user = new User('1', 'test@example.com', 'Test User', 'BasicUser', false, 5);

      const result = SessionRules.canUserBookSession(user);
      expect(result.canBook).toBe(false);
      expect(result.reason).toContain('suscripción activa');
    });

    it('should not allow users without remaining sessions', () => {
      const user = new User('1', 'test@example.com', 'Test User', 'BasicUser', true, 0);

      const result = SessionRules.canUserBookSession(user);
      expect(result.canBook).toBe(false);
      expect(result.reason).toContain('sesiones disponibles');
    });
  });

  describe('canCoachAcceptSession', () => {
    it('should allow available qualified coach', () => {
      const coach = new Coach('1', 'Available Coach', 4.0, ['Leadership'], true);

      coach.canAcceptSession = jest.fn().mockReturnValue(true);

      const result = SessionRules.canCoachAcceptSession(coach);
      expect(result.canAccept).toBe(true);
    });

    it('should not allow unavailable coach', () => {
      const coach = new Coach('1', 'Unavailable Coach', 4.0, ['Leadership'], false);

      const result = SessionRules.canCoachAcceptSession(coach);
      expect(result.canAccept).toBe(false);
      expect(result.reason).toContain('no está disponible');
    });

    it('should not allow unqualified coach', () => {
      const coach = new Coach('1', 'Unqualified Coach', 4.0, ['Leadership'], true);

      coach.canAcceptSession = jest.fn().mockReturnValue(false);

      const result = SessionRules.canCoachAcceptSession(coach);
      expect(result.canAccept).toBe(false);
      expect(result.reason).toContain('requisitos mínimos');
    });
  });

  describe('isValidSessionTime', () => {
    it('should allow valid business hours with valid minutes', () => {
      expect(SessionRules.isValidSessionTime(8, 0).isValid).toBe(true);
      expect(SessionRules.isValidSessionTime(8, 30).isValid).toBe(true);
      expect(SessionRules.isValidSessionTime(15, 0).isValid).toBe(true);
      expect(SessionRules.isValidSessionTime(21, 30).isValid).toBe(true);
    });

    it('should not allow hours outside business hours', () => {
      expect(SessionRules.isValidSessionTime(7, 0).isValid).toBe(false);
      expect(SessionRules.isValidSessionTime(22, 0).isValid).toBe(false);
      expect(SessionRules.isValidSessionTime(23, 0).isValid).toBe(false);
    });

    it('should not allow invalid minutes', () => {
      expect(SessionRules.isValidSessionTime(15, 15).isValid).toBe(false);
      expect(SessionRules.isValidSessionTime(15, 45).isValid).toBe(false);
      expect(SessionRules.isValidSessionTime(15, 59).isValid).toBe(false);
    });

    it('should default to 0 minutes when not specified', () => {
      expect(SessionRules.isValidSessionTime(10).isValid).toBe(true);
    });
  });

  describe('calculateSessionCost', () => {
    it('should calculate correct cost for BasicUser', () => {
      expect(SessionRules.calculateSessionCost('BasicUser')).toBe(20);
    });

    it('should calculate discounted cost for PremiumUser', () => {
      expect(SessionRules.calculateSessionCost('PremiumUser')).toBe(15); // 20 * 0.75
    });
  });

  describe('getSessionDuration', () => {
    it('should return standard session duration', () => {
      expect(SessionRules.getSessionDuration()).toBe(20);
    });
  });

  describe('validateSessionCreation', () => {
    it('should validate successful session creation', () => {
      const user = new User('1', 'test@example.com', 'Test User', 'BasicUser', true, 5);
      const coach = new Coach('1', 'Test Coach', 4.0, ['Leadership'], true);

      coach.canAcceptSession = jest.fn().mockReturnValue(true);

      const result = SessionRules.validateSessionCreation(user, coach, 10);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid user', () => {
      const user = new User('1', 'admin@example.com', 'Admin', 'AdminUser', true, 10);
      const coach = new Coach('1', 'Test Coach', 4.0, ['Leadership'], true);

      const result = SessionRules.validateSessionCreation(user, coach, 10);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('usuarios registrados');
    });

    it('should reject invalid coach', () => {
      const user = new User('1', 'test@example.com', 'Test User', 'BasicUser', true, 5);
      const coach = new Coach('1', 'Unavailable Coach', 4.0, ['Leadership'], false);

      const result = SessionRules.validateSessionCreation(user, coach, 10);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('no está disponible');
    });

    it('should reject invalid time', () => {
      const user = new User('1', 'test@example.com', 'Test User', 'BasicUser', true, 5);
      const coach = new Coach('1', 'Test Coach', 4.0, ['Leadership'], true);

      coach.canAcceptSession = jest.fn().mockReturnValue(true);

      const result = SessionRules.validateSessionCreation(user, coach, 7); // Too early
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('8:00 a 22:00');
    });
  });
});
