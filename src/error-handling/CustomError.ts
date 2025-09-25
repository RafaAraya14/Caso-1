// src/error-handling/CustomError.ts

export class CustomError extends Error {
    code: string;
    friendlyMessage: string;

    constructor(message: string, code: string, friendlyMessage: string) {
        // 'message' technical errors for developers (saved in logs)
        super(message);
        this.name = 'CustomError';

        // 'code' unique code to identify the error 
        this.code = code;

        // 'friendlyMessage' safe and friendly message to show the user
        this.friendlyMessage = friendlyMessage;

        // Maintain proper stack trace
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}