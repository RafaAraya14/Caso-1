// src/models/User.ts

export class User {
    constructor(
        public id: string,
        public email: string,
        public name: string,
        public role: string
    ) { }

    validateRole(): boolean {
        // True if role is non-empty string
        return this.role.trim().length > 0;
    }
}