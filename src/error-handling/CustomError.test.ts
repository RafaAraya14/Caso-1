/**
 * Tests for CustomError class
 */

import { CustomError, ErrorCategory, ErrorSeverity, type ErrorMetadata } from './CustomError';

describe('CustomError', () => {
  describe('Constructor', () => {
    it('should create error with required parameters', () => {
      const error = new CustomError('Test error message', 'TEST_ERROR', 'User friendly message');

      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.friendlyMessage).toBe('User friendly message');
      expect(error.severity).toBe(ErrorSeverity.MEDIUM); // default
      expect(error.category).toBe(ErrorCategory.SYSTEM); // default
      expect(error.isRetryable).toBe(false); // default
      expect(error.statusCode).toBeUndefined();
    });

    it('should create error with all options', () => {
      const metadata: ErrorMetadata = {
        userId: 'user123',
        sessionId: 'session456',
        component: 'TestComponent',
      };

      const error = new CustomError('Test error message', 'TEST_ERROR', 'User friendly message', {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.AUTHENTICATION,
        metadata,
        isRetryable: true,
        statusCode: 401,
      });

      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.friendlyMessage).toBe('User friendly message');
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(error.metadata).toMatchObject(metadata);
      expect(error.isRetryable).toBe(true);
      expect(error.statusCode).toBe(401);
    });

    it('should inherit from Error', () => {
      const error = new CustomError('Test', 'TEST', 'Friendly');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(CustomError);
    });

    it('should preserve stack trace', () => {
      const error = new CustomError('Test', 'TEST', 'Friendly');
      expect(error.stack).toBeDefined();
    });
  });

  describe('Error Severity', () => {
    it('should handle all severity levels', () => {
      const severities = [
        ErrorSeverity.LOW,
        ErrorSeverity.MEDIUM,
        ErrorSeverity.HIGH,
        ErrorSeverity.CRITICAL,
      ];

      severities.forEach(severity => {
        const error = new CustomError('Test', 'TEST', 'Friendly', { severity });
        expect(error.severity).toBe(severity);
      });
    });
  });

  describe('Error Category', () => {
    it('should handle all category types', () => {
      const categories = [
        ErrorCategory.AUTHENTICATION,
        ErrorCategory.AUTHORIZATION,
        ErrorCategory.VALIDATION,
        ErrorCategory.NETWORK,
        ErrorCategory.DATABASE,
        ErrorCategory.BUSINESS_LOGIC,
        ErrorCategory.EXTERNAL_SERVICE,
        ErrorCategory.SYSTEM,
      ];

      categories.forEach(category => {
        const error = new CustomError('Test', 'TEST', 'Friendly', { category });
        expect(error.category).toBe(category);
      });
    });
  });

  describe('Metadata', () => {
    it('should handle empty metadata', () => {
      const error = new CustomError('Test', 'TEST', 'Friendly');
      expect(error.metadata).toBeDefined();
      expect(typeof error.metadata).toBe('object');
    });

    it('should handle complex metadata', () => {
      const metadata: ErrorMetadata = {
        userId: 'user123',
        sessionId: 'session456',
        component: 'TestComponent',
        action: 'testAction',
        timestamp: '2023-12-15T12:00:00Z',
        userAgent: 'Mozilla/5.0',
        url: 'https://example.com',
        customField: 'customValue',
        nestedObject: { key: 'value' },
      };

      const error = new CustomError('Test', 'TEST', 'Friendly', { metadata });

      expect(error.metadata).toEqual(metadata);
    });
  });

  describe('Retry Logic', () => {
    it('should default to non-retryable', () => {
      const error = new CustomError('Test', 'TEST', 'Friendly');
      expect(error.isRetryable).toBe(false);
    });

    it('should accept retryable flag', () => {
      const error = new CustomError('Test', 'TEST', 'Friendly', { isRetryable: true });
      expect(error.isRetryable).toBe(true);
    });
  });

  describe('Status Code', () => {
    it('should handle HTTP status codes', () => {
      const httpCodes = [400, 401, 403, 404, 500, 502, 503];

      httpCodes.forEach(statusCode => {
        const error = new CustomError('Test', 'TEST', 'Friendly', { statusCode });
        expect(error.statusCode).toBe(statusCode);
      });
    });
  });

  describe('Real World Scenarios', () => {
    it('should create authentication error', () => {
      const error = new CustomError(
        'Invalid credentials provided',
        'AUTH_INVALID_CREDENTIALS',
        'Please check your username and password',
        {
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.AUTHENTICATION,
          statusCode: 401,
          isRetryable: true,
          metadata: {
            userId: 'anonymous',
            action: 'login',
          },
        }
      );

      expect(error.code).toBe('AUTH_INVALID_CREDENTIALS');
      expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(error.statusCode).toBe(401);
    });

    it('should create validation error', () => {
      const error = new CustomError(
        'Required field missing: email',
        'VALIDATION_REQUIRED_FIELD',
        'Please fill in all required fields',
        {
          severity: ErrorSeverity.LOW,
          category: ErrorCategory.VALIDATION,
          statusCode: 400,
          metadata: {
            field: 'email',
            component: 'LoginForm',
          },
        }
      );

      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.severity).toBe(ErrorSeverity.LOW);
    });

    it('should create network error', () => {
      const error = new CustomError(
        'Network request timeout',
        'NETWORK_TIMEOUT',
        'Connection is slow. Please try again.',
        {
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.NETWORK,
          isRetryable: true,
          metadata: {
            url: 'https://api.example.com/users',
            timeout: 5000,
          },
        }
      );

      expect(error.category).toBe(ErrorCategory.NETWORK);
      expect(error.isRetryable).toBe(true);
    });

    it('should create system error', () => {
      const error = new CustomError(
        'Unexpected system error occurred',
        'SYSTEM_UNEXPECTED_ERROR',
        'Something went wrong. Our team has been notified.',
        {
          severity: ErrorSeverity.CRITICAL,
          category: ErrorCategory.SYSTEM,
          statusCode: 500,
          metadata: {
            stackTrace: 'Error: Something failed...',
            timestamp: new Date().toISOString(),
          },
        }
      );

      expect(error.severity).toBe(ErrorSeverity.CRITICAL);
      expect(error.statusCode).toBe(500);
    });
  });

  describe('Error Message Handling', () => {
    it('should preserve original error message', () => {
      const originalMessage = 'Database connection failed';
      const error = new CustomError(
        originalMessage,
        'DB_CONNECTION_FAILED',
        'Unable to connect to database'
      );

      expect(error.message).toBe(originalMessage);
    });

    it('should have different technical and user-friendly messages', () => {
      const error = new CustomError(
        'SQL error: Table users does not exist',
        'DB_TABLE_NOT_FOUND',
        'There was a problem with your request'
      );

      expect(error.message).not.toBe(error.friendlyMessage);
      expect(error.message).toContain('SQL error');
      expect(error.friendlyMessage).toContain('problem with your request');
    });
  });
});
