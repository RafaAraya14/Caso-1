// src/services/SessionService.ts

export class SessionService {
    // Method to create a session
    async createSession(userId: string, coachId: string): Promise<void> {
        // eslint-disable-next-line no-console
        console.log(`Creating session for user ${userId} with coach ${coachId}`);
        // Logic to create a session would go here if needed
        return Promise.resolve();
    }
}