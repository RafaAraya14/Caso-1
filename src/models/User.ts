// src/models/User.ts

export class User {
    constructor(
        public id: string,
        public email: string,
        public name: string,
        public role: string
    ) { }

    validateRole(): boolean {
        // Un ejemplo de validación simple: devuelve true si el rol no está vacío.
        return this.role.trim().length > 0;
    }
}