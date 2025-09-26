// src/models/User.ts

export class User {
    constructor(
        public id: string,
        public email: string,
        public name: string,
        public role: string,
        public hasActiveSubscription: boolean,
        public sessionsRemaining: number
    ) { }

    validateRole(): boolean {
        return this.role.trim().length > 0;
    }
}