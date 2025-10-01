import { EventBus } from './EventBus';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    // Reset singleton for each test
    (EventBus as any).instance = undefined;
    eventBus = EventBus.getInstance();
  });

  afterEach(() => {
    // Clean up after each test
    eventBus.clearAllListeners();
    eventBus.clearHistory();
  });

  describe('Singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = EventBus.getInstance();
      const instance2 = EventBus.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should be a singleton', () => {
      expect(eventBus).toBeInstanceOf(EventBus);
    });
  });

  describe('Event subscription and publishing', () => {
    it('should allow subscribing to events', () => {
      const callback = jest.fn();
      const listenerId = eventBus.subscribe('test-event', callback);

      expect(typeof listenerId).toBe('string');
      expect(listenerId.length).toBeGreaterThan(0);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should publish events to subscribers', () => {
      const callback = jest.fn();
      eventBus.subscribe('test-event', callback);

      const testData = { message: 'Hello, World!' };
      eventBus.publish('test-event', testData);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test-event',
          payload: testData,
          timestamp: expect.any(Date),
        })
      );
    });

    it('should handle multiple subscribers for the same event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventBus.subscribe('test-event', callback1);
      eventBus.subscribe('test-event', callback2);

      const testData = { message: 'Hello!' };
      eventBus.publish('test-event', testData);

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should allow unsubscribing from events', () => {
      const callback = jest.fn();
      const listenerId = eventBus.subscribe('test-event', callback);

      // Publish event - should be received
      eventBus.publish('test-event', { test: 1 });
      expect(callback).toHaveBeenCalledTimes(1);

      // Unsubscribe
      const unsubscribed = eventBus.unsubscribe(listenerId);
      expect(unsubscribed).toBe(true);

      // Publish event again - should not be received
      eventBus.publish('test-event', { test: 2 });
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle events with no subscribers', () => {
      expect(() => {
        eventBus.publish('non-existent-event', { data: 'test' });
      }).not.toThrow();
    });

    it('should support once listeners', () => {
      const callback = jest.fn();
      eventBus.once('test-event', callback);

      // First event should trigger callback
      eventBus.publish('test-event', { test: 1 });
      expect(callback).toHaveBeenCalledTimes(1);

      // Second event should not trigger callback (auto-unsubscribed)
      eventBus.publish('test-event', { test: 2 });
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Coach-related events', () => {
    it('should handle coach availability changes', () => {
      const callback = jest.fn();
      eventBus.subscribe('coach:availability-changed', callback);

      const coachData = {
        coachId: '123',
        isAvailable: true,
        timestamp: new Date().toISOString(),
      };

      eventBus.publish('coach:availability-changed', coachData, {
        userId: 'coach-123',
      });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'coach:availability-changed',
          payload: coachData,
          userId: 'coach-123',
        })
      );
    });

    it('should handle coach profile updates', () => {
      const callback = jest.fn();
      eventBus.subscribe('coach:profile-updated', callback);

      const updateData = {
        coachId: '456',
        updatedFields: ['bio', 'skills'],
        timestamp: new Date().toISOString(),
      };

      eventBus.publish('coach:profile-updated', updateData);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'coach:profile-updated',
          payload: updateData,
        })
      );
    });
  });

  describe('Session-related events', () => {
    it('should handle session bookings', () => {
      const callback = jest.fn();
      eventBus.subscribe('session:booked', callback);

      const sessionData = {
        sessionId: 'sess-123',
        coachId: 'coach-456',
        userId: 'user-789',
        scheduledTime: new Date().toISOString(),
      };

      eventBus.publish('session:booked', sessionData, {
        userId: sessionData.userId,
        sessionId: sessionData.sessionId,
      });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'session:booked',
          payload: sessionData,
          userId: sessionData.userId,
          sessionId: sessionData.sessionId,
        })
      );
    });

    it('should handle session completions', () => {
      const callback = jest.fn();
      eventBus.subscribe('session:completed', callback);

      const completionData = {
        sessionId: 'sess-123',
        duration: 1200, // 20 minutes in seconds
        rating: 5,
      };

      eventBus.publish('session:completed', completionData);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'session:completed',
          payload: completionData,
        })
      );
    });

    it('should handle session cancellations', () => {
      const callback = jest.fn();
      eventBus.subscribe('session:cancelled', callback);

      const cancellationData = {
        sessionId: 'sess-123',
        reason: 'Coach unavailable',
        cancelledBy: 'coach',
      };

      eventBus.publish('session:cancelled', cancellationData);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'session:cancelled',
          payload: cancellationData,
        })
      );
    });
  });

  describe('User events', () => {
    it('should handle user registration', () => {
      const callback = jest.fn();
      eventBus.subscribe('user:registered', callback);

      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        userType: 'client',
      };

      eventBus.publish('user:registered', userData);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'user:registered',
          payload: userData,
        })
      );
    });

    it('should handle credit updates', () => {
      const callback = jest.fn();
      eventBus.subscribe('user:credits-updated', callback);

      const creditData = {
        userId: 'user-123',
        previousCredits: 5,
        newCredits: 3,
        changeReason: 'session_booked',
      };

      eventBus.publish('user:credits-updated', creditData);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'user:credits-updated',
          payload: creditData,
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should handle errors in callbacks gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Test error');
      });
      const normalCallback = jest.fn();

      eventBus.subscribe('test-event', errorCallback);
      eventBus.subscribe('test-event', normalCallback);

      expect(() => {
        eventBus.publish('test-event', { data: 'test' });
      }).not.toThrow();

      // Normal callback should still be called despite error in first callback
      expect(normalCallback).toHaveBeenCalled();
    });

    it('should return false when unsubscribing non-existent listener', () => {
      const result = eventBus.unsubscribe('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('Event history and debugging', () => {
    it('should track event history', () => {
      eventBus.publish('test-event', { data: 'test1' });
      eventBus.publish('another-event', { data: 'test2' });

      const history = eventBus.getEventHistory();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(2);
      expect(history[0].type).toBe('test-event');
      expect(history[1].type).toBe('another-event');
    });

    it('should filter event history by type', () => {
      eventBus.publish('test-event', { data: 'test1' });
      eventBus.publish('test-event', { data: 'test2' });
      eventBus.publish('another-event', { data: 'test3' });

      const filteredHistory = eventBus.getEventHistory('test-event');
      expect(filteredHistory.length).toBe(2);
      expect(filteredHistory.every(event => event.type === 'test-event')).toBe(true);
    });

    it('should limit event history', () => {
      eventBus.publish('test-event', { data: 'test1' });
      eventBus.publish('test-event', { data: 'test2' });
      eventBus.publish('test-event', { data: 'test3' });

      const limitedHistory = eventBus.getEventHistory('test-event', 2);
      expect(limitedHistory.length).toBe(2);
    });

    it('should provide event statistics', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventBus.subscribe('test-event', callback1);
      eventBus.subscribe('another-event', callback2);
      eventBus.publish('test-event', { data: 'test' });

      const stats = eventBus.getStats();
      expect(typeof stats).toBe('object');
      expect(stats.totalListeners).toBeGreaterThan(0);
      expect(Array.isArray(stats.eventTypes)).toBe(true);
      expect(typeof stats.historySize).toBe('number');
    });

    it('should get active listeners', () => {
      eventBus.subscribe('test-event', jest.fn());
      eventBus.subscribe('test-event', jest.fn());
      eventBus.subscribe('another-event', jest.fn());

      const activeListeners = eventBus.getActiveListeners();
      expect(activeListeners['test-event']).toBe(2);
      expect(activeListeners['another-event']).toBe(1);
    });
  });

  describe('Cleanup and management', () => {
    it('should clear all listeners', () => {
      eventBus.subscribe('test-event', jest.fn());
      eventBus.subscribe('another-event', jest.fn());

      eventBus.clearAllListeners();

      const activeListeners = eventBus.getActiveListeners();
      expect(Object.keys(activeListeners).length).toBe(0);
    });

    it('should clear event history', () => {
      eventBus.publish('test-event', { data: 'test' });
      expect(eventBus.getEventHistory().length).toBeGreaterThan(0);

      eventBus.clearHistory();
      expect(eventBus.getEventHistory().length).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should handle many subscribers efficiently', () => {
      const callbacks = [];

      // Subscribe 50 callbacks (reduced from 100 for test speed)
      for (let i = 0; i < 50; i++) {
        const callback = jest.fn();
        callbacks.push(callback);
        eventBus.subscribe('performance-test', callback);
      }

      const startTime = performance.now();
      eventBus.publish('performance-test', { data: 'test' });
      const endTime = performance.now();

      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(50);

      // All callbacks should have been called
      callbacks.forEach(callback => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle rapid event publishing', () => {
      const callback = jest.fn();
      eventBus.subscribe('rapid-test', callback);

      const startTime = performance.now();

      // Publish 100 events rapidly (reduced from 1000 for test speed)
      for (let i = 0; i < 100; i++) {
        eventBus.publish('rapid-test', { index: i });
      }

      const endTime = performance.now();

      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(100);
      expect(callback).toHaveBeenCalledTimes(100);
    });
  });
});
