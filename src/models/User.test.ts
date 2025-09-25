// src/models/User.test.ts
import { User } from './User';

describe('User Class', () => {
    // Test 1: Verify that the constructor assigns properties correctly.
    test('should create a user with correct properties', () => {
        const userData = {
            id: '123',
            email: 'test@example.com',
            name: 'Test User',
            role: 'BasicUser',
        };
        const user = new User(userData.id, userData.email, userData.name, userData.role);

        expect(user.id).toBe('123');
        expect(user.email).toBe('test@example.com');
        expect(user.name).toBe('Test User');
        expect(user.role).toBe('BasicUser');
    });

    // Test 2: Verify a method (let's imagine a method that validates the role).
    test('validateRole should return true for a valid role', () => {
        const user = new User('123', 'test@example.com', 'Test User', 'PremiumUser');
        // Assuming the User class has a `validateRole` method
        // If it doesn't, you can add it or test another existing method.
        const isValid = user.validateRole();
        expect(isValid).toBe(true);
    });
});