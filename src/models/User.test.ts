// src/models/User.test.ts
import { User } from './User';

describe('User Class', () => {
  test('should create a user with correct properties', () => {
    const user = new User(
      '123',
      'test@example.com',
      'Test User',
      'BasicUser',
      true, // hasActiveSubscription
      5 // sessionsRemaining
    );

    expect(user.id).toBe('123');
    expect(user.email).toBe('test@example.com');
    expect(user.hasActiveSubscription).toBe(true);
  });

  test('validateRole should return true for a valid role', () => {
    const user = new User('456', 'test2@example.com', 'Test User 2', 'PremiumUser', false, 0);
    const isValid = user.validateRole();
    expect(isValid).toBe(true);
  });
});
