// src/middleware/errorHandlerMiddleware.test.ts
import { handleApiError } from './errorHandlerMiddleware';

// Mock dependencies
jest.mock('../logging/logger', () => ({
  logger: {
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('../error-handling/CustomError', () => ({
  CustomError: class CustomError extends Error {
    friendlyMessage: string;
    constructor(message: string, friendlyMessage: string) {
      super(message);
      this.name = 'CustomError';
      this.friendlyMessage = friendlyMessage;
    }
  },
}));

describe('errorHandlerMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleApiError', () => {
    it('should handle Error instances with default message', () => {
      const genericError = new Error('Generic error message');
      const userMessage = 'Custom user message';

      const result = handleApiError(genericError, userMessage);

      expect(result).toBe(userMessage);
    });

    it('should use default user message when none provided', () => {
      const genericError = new Error('Test error');

      const result = handleApiError(genericError);

      expect(result).toBe('Ocurrió un error inesperado.');
    });

    it('should handle null or undefined errors', () => {
      const result1 = handleApiError(null);
      const result2 = handleApiError(undefined);

      expect(result1).toBe('Ocurrió un error inesperado.');
      expect(result2).toBe('Ocurrió un error inesperado.');
    });

    it('should handle string errors', () => {
      const stringError = 'String error message';
      const userMessage = 'Something went wrong';

      const result = handleApiError(stringError, userMessage);

      expect(result).toBe(userMessage);
    });

    it('should be callable multiple times', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      const result1 = handleApiError(error1, 'Message 1');
      const result2 = handleApiError(error2, 'Message 2');

      expect(result1).toBe('Message 1');
      expect(result2).toBe('Message 2');
    });
  });

  describe('integration scenarios', () => {
    it('should work with typical API error flow', () => {
      try {
        throw new Error('API request failed');
      } catch (error) {
        const userMessage = handleApiError(error, 'Failed to load data');
        expect(userMessage).toBe('Failed to load data');
      }
    });

    it('should work in error handling pipeline', () => {
      const errors = [new Error('Error 1'), new Error('Error 2'), 'String error'];

      const results = errors.map(error => handleApiError(error, 'Handled error'));

      results.forEach(result => {
        expect(result).toBe('Handled error');
      });
    });
  });
});
