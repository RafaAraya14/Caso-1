/**
 * Tests for Listeners (CoachListener and SessionListener)
 */

import { EventBus, EventTypes } from '../background/EventBus';
import { CoachListener } from './CoachListener';
import { SessionListener } from './SessionListener';

// Mock dependencies
jest.mock('../background/NotificationService', () => ({
  notificationService: {
    notifyUsers: jest.fn().mockResolvedValue(undefined),
    notifyCoach: jest.fn().mockResolvedValue(undefined),
    notifyUser: jest.fn().mockResolvedValue(undefined),
    sendNotification: jest.fn().mockResolvedValue(undefined),
    sendTemplatedNotification: jest
      .fn()
      .mockImplementation((userId, template, data, meta) => Promise.resolve()),
  },
}));

jest.mock('../logging', () => ({
  logger: {
    info: jest.fn(),
    auth: jest.fn(),
    session: jest.fn(),
    error: jest.fn(),
    api: jest.fn(),
  },
}));

describe('CoachListener', () => {
  let coachListener: CoachListener;
  let eventBus: EventBus;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    eventBus = EventBus.getInstance();
    eventBus.clearAllListeners();
    eventBus.clearHistory();
    coachListener = new CoachListener();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    coachListener.stop();
    consoleSpy.mockRestore();
  });

  describe('start', () => {
    it('should start listening to coach events', () => {
      const { logger } = require('../logging');

      coachListener.start();

      expect(logger.info).toHaveBeenCalledWith('[CoachListener] Started listening to coach events');
    });

    it('should not start twice', () => {
      const warnSpy = jest.spyOn(console, 'warn');

      coachListener.start();
      coachListener.start(); // Second call

      expect(warnSpy).toHaveBeenCalledWith('[CoachListener] Already active');
    });

    it('should subscribe to coach events', () => {
      const subscribeSpy = jest.spyOn(eventBus, 'subscribe');

      coachListener.start();

      expect(subscribeSpy).toHaveBeenCalledWith(EventTypes.COACH_AVAILABLE, expect.any(Function));
      expect(subscribeSpy).toHaveBeenCalledWith(EventTypes.COACH_UNAVAILABLE, expect.any(Function));
      expect(subscribeSpy).toHaveBeenCalledWith(
        EventTypes.COACH_RATING_UPDATED,
        expect.any(Function)
      );
    });
  });

  describe('stop', () => {
    it('should stop listening to events', () => {
      const { logger } = require('../logging');

      coachListener.start();
      coachListener.stop();

      expect(logger.info).toHaveBeenCalledWith('[CoachListener] Stopped listening to coach events');
    });

    it('should unsubscribe from all events', () => {
      const unsubscribeSpy = jest.spyOn(eventBus, 'unsubscribe');

      coachListener.start();
      const initialSubscriptions = unsubscribeSpy.mock.calls.length;

      coachListener.stop();

      expect(unsubscribeSpy.mock.calls.length).toBeGreaterThan(initialSubscriptions);
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      coachListener.start();
    });

    it('should handle COACH_AVAILABLE event', async () => {
      const { logger } = require('../logging');
      const payload = {
        coachId: 'coach-123',
        coachName: 'John Doe',
        specialties: ['Leadership'],
        location: 'New York',
      };

      eventBus.publish(EventTypes.COACH_AVAILABLE, payload);

      await new Promise(resolve => setTimeout(resolve, 50)); // Más tiempo para procesar

      expect(consoleSpy).toHaveBeenCalledWith(
        '[CoachListener] Coach coach-123 availability processed'
      );
      // Verifica que el logger fue llamado al menos una vez
      expect(logger.auth).toHaveBeenCalled();
    });

    it('should handle COACH_UNAVAILABLE event', async () => {
      const payload = {
        coachId: 'coach-456',
        coachName: 'Jane Smith',
        reason: 'break',
      };

      eventBus.publish(EventTypes.COACH_UNAVAILABLE, payload);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(consoleSpy).toHaveBeenCalledWith(
        '[CoachListener] Coach coach-456 unavailability processed'
      );
    });

    it('should handle COACH_RATING_UPDATED event', async () => {
      const payload = {
        coachId: 'coach-789',
        oldRating: 4.2,
        newRating: 4.5,
        reviewCount: 150,
      };

      // Nota: Este evento no produce console.log, por eso solo verificamos que no falle
      expect(() => {
        eventBus.publish(EventTypes.COACH_RATING_UPDATED, payload);
      }).not.toThrow();

      await new Promise(resolve => setTimeout(resolve, 50));
    });

    it('should handle multiple events in sequence', async () => {
      const payloads = [
        { coachId: 'coach-1', coachName: 'Coach 1', specialties: ['Leadership'], location: 'NYC' },
        { coachId: 'coach-2', coachName: 'Coach 2', reason: 'lunch' },
      ];

      eventBus.publish(EventTypes.COACH_AVAILABLE, payloads[0]);
      eventBus.publish(EventTypes.COACH_UNAVAILABLE, payloads[1]);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(consoleSpy).toHaveBeenCalledWith(
        '[CoachListener] Coach coach-1 availability processed'
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        '[CoachListener] Coach coach-2 unavailability processed'
      );
    });
  });

  describe('integration with EventBus', () => {
    it('should work with EventBus singleton', () => {
      const eventBus1 = EventBus.getInstance();
      const eventBus2 = EventBus.getInstance();

      expect(eventBus1).toBe(eventBus2);
      expect(eventBus1).toBe(eventBus);
    });

    it('should maintain listener state correctly', () => {
      expect(coachListener['isActive']).toBe(false);

      coachListener.start();
      expect(coachListener['isActive']).toBe(true);

      coachListener.stop();
      expect(coachListener['isActive']).toBe(false);
    });

    it('should track listener IDs', () => {
      coachListener.start();
      expect(coachListener['listenerIds'].length).toBe(3); // Three event types

      coachListener.stop();
      expect(coachListener['listenerIds'].length).toBe(0);
    });
  });
});

describe('SessionListener', () => {
  let sessionListener: SessionListener;
  let eventBus: EventBus;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    eventBus = EventBus.getInstance();
    eventBus.clearAllListeners();
    eventBus.clearHistory();
    sessionListener = new SessionListener();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    sessionListener.stop();
    consoleSpy.mockRestore();
  });

  describe('start', () => {
    it('should start listening to session events', () => {
      const { logger } = require('../logging');

      sessionListener.start();

      expect(logger.info).toHaveBeenCalledWith(
        '[SessionListener] Started listening to session events'
      );
    });

    it('should not start twice', () => {
      const warnSpy = jest.spyOn(console, 'warn');

      sessionListener.start();
      sessionListener.start(); // Second call

      expect(warnSpy).toHaveBeenCalledWith('[SessionListener] Already active');
    });

    it('should subscribe to session events', () => {
      const subscribeSpy = jest.spyOn(eventBus, 'subscribe');

      sessionListener.start();

      expect(subscribeSpy).toHaveBeenCalledWith(EventTypes.SESSION_CREATED, expect.any(Function));
      expect(subscribeSpy).toHaveBeenCalledWith(EventTypes.SESSION_STARTED, expect.any(Function));
      expect(subscribeSpy).toHaveBeenCalledWith(EventTypes.SESSION_ENDED, expect.any(Function));
      expect(subscribeSpy).toHaveBeenCalledWith(EventTypes.SESSION_CANCELLED, expect.any(Function));
    });
  });

  describe('stop', () => {
    it('should stop listening to events', () => {
      const { logger } = require('../logging');

      sessionListener.start();
      sessionListener.stop();

      expect(logger.info).toHaveBeenCalledWith(
        '[SessionListener] Stopped listening to session events'
      );
    });

    it('should unsubscribe from all events', () => {
      const unsubscribeSpy = jest.spyOn(eventBus, 'unsubscribe');

      sessionListener.start();
      const initialUnsubscriptions = unsubscribeSpy.mock.calls.length;

      sessionListener.stop();

      expect(unsubscribeSpy.mock.calls.length).toBeGreaterThan(initialUnsubscriptions);
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      sessionListener.start();
    });

    it('should handle SESSION_CREATED event', async () => {
      const payload = {
        sessionId: 'session-123',
        userId: 'user-456',
        coachId: 'coach-789',
        scheduledTime: '2024-01-15T10:00:00Z',
        cost: 20,
      };

      eventBus.publish(EventTypes.SESSION_CREATED, payload);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SessionListener] Session session-123 creation processed'
      );
    });

    it('should handle SESSION_STARTED event', async () => {
      const payload = {
        sessionId: 'session-456',
        userId: 'user-123',
        coachId: 'coach-456',
        _meetingLink: undefined,
      };

      eventBus.publish(EventTypes.SESSION_STARTED, payload);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SessionListener] Session session-456 start processed'
      );
    });

    it('should handle SESSION_ENDED event', async () => {
      const { logger } = require('../logging');
      const payload = {
        sessionId: 'session-789',
        userId: 'user-789',
        coachId: 'coach-123',
        endTime: '2024-01-15T10:20:00Z',
        duration: 18,
        status: 'completed',
      };

      eventBus.publish(EventTypes.SESSION_ENDED, payload);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(logger.session).toHaveBeenCalledWith('SessionEnded', 'Processing session completion', {
        sessionId: 'session-789',
        userId: 'user-789',
        metadata: { coachId: 'coach-123', duration: 18, rating: undefined },
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SessionListener] Session session-789 completion processed'
      );
    });

    it('should handle SESSION_CANCELLED event', async () => {
      const payload = {
        sessionId: 'session-cancelled',
        userId: 'user-cancel',
        coachId: 'coach-cancel',
        reason: 'user_requested',
        cancelledBy: undefined,
      };

      eventBus.publish(EventTypes.SESSION_CANCELLED, payload);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SessionListener] Session session-cancelled cancellation processed'
      );
    });

    it('should handle multiple session events', async () => {
      const createPayload = {
        sessionId: 'session-multi-1',
        userId: 'user-multi',
        coachId: 'coach-multi',
        scheduledTime: '2024-01-15T10:00:00Z',
        cost: 15,
      };

      const startPayload = {
        sessionId: 'session-multi-2',
        userId: 'user-multi-2',
        coachId: 'coach-multi-2',
        _meetingLink: undefined,
      };

      eventBus.publish(EventTypes.SESSION_CREATED, createPayload);
      eventBus.publish(EventTypes.SESSION_STARTED, startPayload);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SessionListener] Session session-multi-1 creation processed'
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        '[SessionListener] Session session-multi-2 start processed'
      );
    });
  });

  describe('listener lifecycle', () => {
    it('should maintain correct state through start/stop cycles', () => {
      expect(sessionListener['isActive']).toBe(false);

      sessionListener.start();
      expect(sessionListener['isActive']).toBe(true);
      expect(sessionListener['listenerIds'].length).toBe(4); // Four event types

      sessionListener.stop();
      expect(sessionListener['isActive']).toBe(false);
      expect(sessionListener['listenerIds'].length).toBe(0);

      // Should be able to start again
      sessionListener.start();
      expect(sessionListener['isActive']).toBe(true);
      expect(sessionListener['listenerIds'].length).toBe(4);
    });

    it('should handle events only when active', async () => {
      const { logger } = require('../logging');

      // Publish event when not active
      eventBus.publish(EventTypes.SESSION_CREATED, {
        sessionId: 'test-inactive',
        userId: 'user-test',
        coachId: 'coach-test',
        scheduledTime: '2024-01-15T10:00:00Z',
        cost: 20,
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      // Should not be processed
      expect(logger.session).not.toHaveBeenCalled();

      // Start and publish again
      sessionListener.start();

      eventBus.publish(EventTypes.SESSION_CREATED, {
        sessionId: 'test-active',
        userId: 'user-test-2',
        coachId: 'coach-test-2',
        scheduledTime: '2024-01-15T11:00:00Z',
        cost: 20,
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      // Should be processed now
      expect(logger.session).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      sessionListener.start();
    });

    it('should handle malformed event payloads gracefully', async () => {
      const { logger } = require('../logging');

      // Publish event with missing required fields
      eventBus.publish(EventTypes.SESSION_CREATED, {
        sessionId: 'incomplete-session',
        // Missing userId, coachId, etc.
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      // Should still log the event (with undefined values)
      expect(logger.session).toHaveBeenCalledWith('SessionCreated', 'Processing session creation', {
        sessionId: 'incomplete-session',
        userId: undefined,
        metadata: { coachId: undefined, scheduledTime: undefined, cost: undefined },
      });
    });
  });
});
