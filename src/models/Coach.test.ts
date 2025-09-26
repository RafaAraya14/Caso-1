// src/business/domain/Coach.test.ts
import { Coach } from './Coach';

describe('Coach Class', () => {

    test('canAcceptSession should return true for eligible coach', () => {
        // Creamos un coach que SÍ cumple las condiciones
        const eligibleCoach = new Coach('c01', 'Coach Available', 4.5, ['Life Coaching'], true, 3);
        expect(eligibleCoach.canAcceptSession()).toBe(true);
    });

    test('canAcceptSession should return false if rating is too low', () => {
        // Creamos un coach con bajo rating
        const lowRatingCoach = new Coach('c02', 'Coach LowRate', 3.0, ['Yoga'], true, 2);
        expect(lowRatingCoach.canAcceptSession()).toBe(false);
    });

    test('canAcceptSession should return false if sessions per day limit is reached', () => {
        // Creamos un coach que ya ha alcanzado el límite de sesiones
        const busyCoach = new Coach('c03', 'Coach Busy', 5.0, ['Programming'], true, 8);
        expect(busyCoach.canAcceptSession()).toBe(false);
    });

});