// src/business/domain/Coach.test.ts
import { Coach } from './Coach';

describe('CoachDomain Class', () => {
    // Test 3: Verify that the method for accepting sessions works.
    test('canAcceptSession should return false if rating is too low', () => {
        const coach = new Coach('c01', 'Coach LowRate', 3.0, ['Yoga'], 2);
        expect(coach.canAcceptSession()).toBe(false);
    });
});