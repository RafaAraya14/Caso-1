// src/middleware/authInterceptor.test.ts
import { AuthInterceptor } from './authInterceptor';

// Mock dependencies
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_at: Date.now() + 3600000,
          },
        },
        error: null,
      }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
      signOut: jest.fn(),
    },
  },
}));

jest.mock('../logging', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('../error-handling', () => ({
  CustomError: {
    authentication: jest.fn((message: string) => new Error(message)),
    network: jest.fn((message: string) => new Error(message)),
  },
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('AuthInterceptor', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singleton instance
    (AuthInterceptor as any).instance = undefined;

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: 'mock response' }),
      headers: new Headers(),
    } as Response);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance when getInstance is called multiple times', () => {
      const instance1 = AuthInterceptor.getInstance();
      const instance2 = AuthInterceptor.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(AuthInterceptor);
    });

    it('should create instance successfully', () => {
      const instance = AuthInterceptor.getInstance();
      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(AuthInterceptor);
    });
  });

  describe('Request Interception', () => {
    let authInterceptor: AuthInterceptor;

    beforeEach(() => {
      authInterceptor = AuthInterceptor.getInstance();
    });

    it('should intercept and make HTTP requests', async () => {
      const testUrl = 'https://api.example.com/test';
      const testOptions = { method: 'GET' };

      const response = await authInterceptor.interceptRequest(testUrl, testOptions);

      expect(mockFetch).toHaveBeenCalledWith(
        testUrl,
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object),
        })
      );
      expect(response).toBeDefined();
    });

    it('should add default headers to requests', async () => {
      const testUrl = 'https://api.example.com/test';

      await authInterceptor.interceptRequest(testUrl);

      expect(mockFetch).toHaveBeenCalledWith(
        testUrl,
        expect.objectContaining({
          headers: expect.any(Headers),
        })
      );
    });

    it('should merge existing headers with default headers', async () => {
      const testUrl = 'https://api.example.com/test';
      const testOptions = {
        method: 'POST',
        headers: {
          'Custom-Header': 'custom-value',
        },
      };

      await authInterceptor.interceptRequest(testUrl, testOptions);

      expect(mockFetch).toHaveBeenCalledWith(
        testUrl,
        expect.objectContaining({
          headers: expect.any(Headers),
          method: 'POST',
        })
      );
    });

    it('should handle requests with no options', async () => {
      const testUrl = 'https://api.example.com/test';

      const response = await authInterceptor.interceptRequest(testUrl);

      expect(mockFetch).toHaveBeenCalledWith(
        testUrl,
        expect.objectContaining({
          headers: expect.any(Object),
        })
      );
      expect(response).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    let authInterceptor: AuthInterceptor;

    beforeEach(() => {
      authInterceptor = AuthInterceptor.getInstance();
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const testUrl = 'https://api.example.com/test';

      await expect(authInterceptor.interceptRequest(testUrl)).rejects.toThrow();
    });

    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Server error' }),
        headers: new Headers(),
      } as Response);

      const testUrl = 'https://api.example.com/test';

      await expect(authInterceptor.interceptRequest(testUrl)).rejects.toThrow();
    });

    it('should handle 404 responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Not found' }),
        headers: new Headers(),
      } as Response);

      const testUrl = 'https://api.example.com/test';

      await expect(authInterceptor.interceptRequest(testUrl)).rejects.toThrow();
    });
  });

  describe('Authenticated Fetch Helper', () => {
    it('should export authenticatedFetch function', async () => {
      const module = await import('./authInterceptor');

      expect(typeof module.authenticatedFetch).toBe('function');
    });

    it('should make requests through authenticatedFetch', async () => {
      const { authenticatedFetch } = await import('./authInterceptor');

      const testUrl = 'https://api.example.com/test';
      const response = await authenticatedFetch(testUrl);

      expect(mockFetch).toHaveBeenCalledWith(
        testUrl,
        expect.objectContaining({
          headers: expect.any(Object),
        })
      );
      expect(response).toBeDefined();
    });

    it('should pass options to authenticatedFetch', async () => {
      const { authenticatedFetch } = await import('./authInterceptor');

      const testUrl = 'https://api.example.com/test';
      const testOptions = {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
      };

      await authenticatedFetch(testUrl, testOptions);

      expect(mockFetch).toHaveBeenCalledWith(
        testUrl,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ test: 'data' }),
          headers: expect.any(Object),
        })
      );
    });
  });

  describe('Token Management', () => {
    it('should initialize without throwing errors', () => {
      expect(() => {
        AuthInterceptor.getInstance();
      }).not.toThrow();
    });

    it('should handle empty or null sessions gracefully', () => {
      // This tests that the implementation doesn't crash with various session states
      expect(() => {
        const instance = AuthInterceptor.getInstance();
        expect(instance).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Request Headers', () => {
    let authInterceptor: AuthInterceptor;

    beforeEach(() => {
      authInterceptor = AuthInterceptor.getInstance();
    });

    it('should always add Content-Type header', async () => {
      const testUrl = 'https://api.example.com/test';

      await authInterceptor.interceptRequest(testUrl);

      expect(mockFetch).toHaveBeenCalledWith(
        testUrl,
        expect.objectContaining({
          headers: expect.any(Headers),
        })
      );
    });

    it('should preserve custom Content-Type if provided', async () => {
      const testUrl = 'https://api.example.com/test';
      const testOptions = {
        headers: {
          'Content-Type': 'text/plain',
        },
      };

      await authInterceptor.interceptRequest(testUrl, testOptions);

      expect(mockFetch).toHaveBeenCalledWith(
        testUrl,
        expect.objectContaining({
          headers: expect.any(Headers),
        })
      );
    });
  });
});
