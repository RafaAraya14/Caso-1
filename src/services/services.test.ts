/**
 * Tests for PaymentService and SessionService
 */

import { PaymentService } from './PaymentService';
import { createSessionAndConsumeCredit } from './SessionService';

// Mock dependencies
jest.mock('../error-handling', () => ({
  ErrorHandler: {
    handle: jest.fn().mockReturnValue('Mocked error message'),
  },
  CustomError: jest.fn().mockImplementation((message, type) => {
    const error = new Error(message);
    error.name = 'CustomError';
    return error;
  }),
}));

// Configurar métodos estáticos del CustomError
const CustomErrorMock = require('../error-handling').CustomError;
CustomErrorMock.externalService = jest.fn().mockImplementation(message => {
  const error = new Error(message);
  error.name = 'CustomError';
  return error;
});
CustomErrorMock.database = jest.fn().mockImplementation(message => {
  const error = new Error(message);
  error.name = 'CustomError';
  return error;
});
CustomErrorMock.businessLogic = jest.fn().mockImplementation((message, friendly) => {
  const error = new Error(message) as Error & { friendlyMessage?: string };
  error.name = 'CustomError';
  if (friendly) error.friendlyMessage = friendly;
  return error;
});

jest.mock('../logging', () => ({
  logger: {
    payment: jest.fn(),
    session: jest.fn(),
  },
}));

jest.mock('../lib/supabase', () => {
  const mockSupabase = {
    from: jest.fn().mockImplementation(table => {
      // Reiniciar cadena en cada nueva consulta
      mockSupabase._queryChain = [table];
      return mockSupabase;
    }),
    select: jest.fn().mockImplementation(columns => {
      mockSupabase._queryChain = mockSupabase._queryChain || [];
      mockSupabase._queryChain.push('select');
      return mockSupabase;
    }),
    eq: jest.fn().mockImplementation((column, value) => {
      mockSupabase._queryChain = mockSupabase._queryChain || [];
      mockSupabase._queryChain.push('eq');
      return mockSupabase;
    }),
    gt: jest.fn().mockImplementation((column, value) => {
      mockSupabase._queryChain = mockSupabase._queryChain || [];
      mockSupabase._queryChain.push('gt');
      // Si estamos en una cadena de update y llegamos a gt, esta es la operación final
      if (mockSupabase._queryChain.includes('update')) {
        return Promise.resolve({ data: {}, error: null });
      }
      return mockSupabase;
    }),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    insert: jest.fn().mockImplementation(data => {
      mockSupabase._queryChain = mockSupabase._queryChain || [];
      mockSupabase._queryChain.push('insert');
      return mockSupabase;
    }),
    update: jest.fn().mockImplementation(data => {
      mockSupabase._queryChain = mockSupabase._queryChain || [];
      mockSupabase._queryChain.push('update');
      return mockSupabase;
    }),
    delete: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({
      data: { id: 1, creditsremaining: 5 },
      error: null,
    }),
    single: jest.fn().mockResolvedValue({
      data: { id: 'session-123' },
      error: null,
    }),
    _queryChain: [] as string[],
  };

  return { supabase: mockSupabase };
});

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService();
    jest.clearAllMocks();
  });

  describe('chargeSession', () => {
    it('should successfully charge a session', async () => {
      // Mock successful payment
      await expect(paymentService.chargeSession('user-123')).resolves.not.toThrow();
    });

    it('should log payment initiation', async () => {
      const { logger } = require('../logging');

      await paymentService.chargeSession('user-456');

      expect(logger.payment).toHaveBeenCalledWith('ChargeSession', 'Iniciando cobro de sesión', {
        userId: 'user-456',
        metadata: { amount: 'session_fee' },
      });
    });

    it('should log successful completion', async () => {
      const { logger } = require('../logging');

      await paymentService.chargeSession('user-789');

      expect(logger.payment).toHaveBeenCalledWith(
        'ChargeSession',
        'Cobro de sesión completado exitosamente',
        {
          userId: 'user-789',
          metadata: { status: 'completed' },
        }
      );
    });

    it('should handle payment errors gracefully', async () => {
      // Override the promise to reject
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn().mockImplementation(() => {
        throw new Error('Payment failed');
      }) as any;

      await expect(paymentService.chargeSession('user-error')).rejects.toThrow();

      global.setTimeout = originalSetTimeout;
    });

    it('should handle different user IDs', async () => {
      const userIds = ['user-1', 'user-2', 'user-3'];

      for (const userId of userIds) {
        await expect(paymentService.chargeSession(userId)).resolves.not.toThrow();
      }
    });

    it('should handle empty user ID', async () => {
      await expect(paymentService.chargeSession('')).resolves.not.toThrow();
    });

    it('should handle special characters in user ID', async () => {
      await expect(paymentService.chargeSession('user@123-test')).resolves.not.toThrow();
    });
  });

  describe('Error handling', () => {
    it('should use ErrorHandler when payment fails', async () => {
      const { ErrorHandler } = require('../error-handling');

      // Mock setTimeout to throw error
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn().mockImplementation(() => {
        throw new Error('Network error');
      }) as any;

      try {
        await paymentService.chargeSession('user-error');
      } catch (error) {
        // Expected to throw
      }

      expect(ErrorHandler.handle).toHaveBeenCalled();

      global.setTimeout = originalSetTimeout;
    });

    it('should create CustomError for payment failures', async () => {
      const { CustomError } = require('../error-handling');

      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn().mockImplementation(() => {
        throw new Error('Payment processing error');
      }) as any;

      try {
        await paymentService.chargeSession('user-fail');
      } catch (error) {
        // Expected to throw
      }

      expect(CustomError.externalService).toHaveBeenCalled();

      global.setTimeout = originalSetTimeout;
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple concurrent charges', async () => {
      const promises = [
        paymentService.chargeSession('user-1'),
        paymentService.chargeSession('user-2'),
        paymentService.chargeSession('user-3'),
      ];

      await expect(Promise.all(promises)).resolves.not.toThrow();
    });

    it('should maintain proper logging order', async () => {
      const { logger } = require('../logging');

      await paymentService.chargeSession('user-sequence');

      // Check that initiation is logged before completion
      const calls = logger.payment.mock.calls;
      expect(calls.length).toBeGreaterThanOrEqual(2);
      expect(calls[0][1]).toContain('Iniciando');
      expect(calls[calls.length - 1][1]).toContain('completado');
    });
  });
});

describe('SessionService', () => {
  const { supabase } = require('../lib/supabase');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSessionAndConsumeCredit', () => {
    it('should successfully create session when user has credits', async () => {
      // Mock user package with credits
      supabase.maybeSingle.mockResolvedValueOnce({
        data: { id: 'pkg-1', creditsremaining: 5 },
        error: null,
      });

      // Mock session creation
      supabase.single.mockResolvedValueOnce({
        data: { id: 'session-123' },
        error: null,
      });

      // Mock credit update - no necesita configurar porque ya está en el mock global
      // y debe retornar { error: null } para indicar éxito

      const result = await createSessionAndConsumeCredit('user-123', 456);
      expect(result).toBe('session-123');
    });

    it('should throw error when user has no packages', async () => {
      supabase.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await expect(createSessionAndConsumeCredit('user-no-pkg', 456)).rejects.toThrow();
    });

    it('should throw error when user has no credits', async () => {
      supabase.maybeSingle.mockResolvedValueOnce({
        data: { id: 'pkg-1', creditsremaining: 0 },
        error: null,
      });

      await expect(createSessionAndConsumeCredit('user-no-credits', 456)).rejects.toThrow();
    });

    it('should handle database errors when fetching packages', async () => {
      supabase.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      });

      await expect(createSessionAndConsumeCredit('user-db-error', 456)).rejects.toThrow();
    });

    it('should log session creation initiation', async () => {
      const { logger } = require('../logging');

      supabase.maybeSingle.mockResolvedValueOnce({
        data: { id: 'pkg-1', creditsremaining: 3 },
        error: null,
      });

      supabase.single.mockResolvedValueOnce({
        data: { id: 'session-456' },
        error: null,
      });

      supabase.single.mockResolvedValueOnce({
        data: { id: 'pkg-1', creditsremaining: 2 },
        error: null,
      });

      await createSessionAndConsumeCredit('user-logging', 789);

      expect(logger.session).toHaveBeenCalledWith('CreateSession', 'Iniciando creación de sesión', {
        userId: 'user-logging',
        metadata: { coachId: 789 },
      });
    });

    it('should handle edge case with null creditsremaining', async () => {
      supabase.maybeSingle.mockResolvedValueOnce({
        data: { id: 'pkg-1', creditsremaining: null },
        error: null,
      });

      await expect(createSessionAndConsumeCredit('user-null-credits', 456)).rejects.toThrow();
    });

    it('should handle different coach ID types', async () => {
      // Test different coach ID types in sequence with isolated mocks
      const testCases = [1, 999, 123456];

      for (let i = 0; i < testCases.length; i++) {
        const coachId = testCases[i];
        const expectedSessionId = `session-${coachId}`;

        // Reset all mocks before each test
        jest.clearAllMocks();

        // Configure mocks for this specific iteration
        supabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              order: jest.fn().mockReturnValueOnce({
                limit: jest.fn().mockReturnValueOnce({
                  maybeSingle: jest.fn().mockResolvedValueOnce({
                    data: { id: 'pkg-valid', creditsremaining: 1 },
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        });

        supabase.from.mockReturnValueOnce({
          insert: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({
                data: { id: expectedSessionId },
                error: null,
              }),
            }),
          }),
        });

        supabase.from.mockReturnValueOnce({
          update: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              gt: jest.fn().mockResolvedValueOnce({ error: null }),
            }),
          }),
        });

        const result = await createSessionAndConsumeCredit('user-test', coachId);
        expect(result).toBe(expectedSessionId);
      }
    });
  });

  describe('Database operations', () => {
    it('should query user packages correctly', async () => {
      supabase.maybeSingle.mockResolvedValueOnce({
        data: { id: 'pkg-1', creditsremaining: 2 },
        error: null,
      });

      supabase.single.mockResolvedValue({
        data: { id: 'session-db' },
        error: null,
      });

      await createSessionAndConsumeCredit('user-db-test', 123);

      expect(supabase.from).toHaveBeenCalledWith('userpackages');
      expect(supabase.select).toHaveBeenCalledWith('id, creditsremaining');
      expect(supabase.eq).toHaveBeenCalledWith('useridfk', 'user-db-test');
      expect(supabase.order).toHaveBeenCalledWith('purchasedat', { ascending: false });
      expect(supabase.limit).toHaveBeenCalledWith(1);
    });

    it('should handle session creation database operations', async () => {
      supabase.maybeSingle.mockResolvedValueOnce({
        data: { id: 'pkg-1', creditsremaining: 1 },
        error: null,
      });

      supabase.single.mockResolvedValueOnce({
        data: { id: 'session-creation' },
        error: null,
      });

      supabase.single.mockResolvedValueOnce({
        data: { id: 'pkg-1' },
        error: null,
      });

      await createSessionAndConsumeCredit('user-creation', 789);

      // Verify session insertion was called
      expect(supabase.from).toHaveBeenCalledWith('sessions');
      expect(supabase.insert).toHaveBeenCalled();
    });
  });

  describe('Error scenarios', () => {
    it('should use CustomError.database for database errors', async () => {
      const { CustomError } = require('../error-handling');

      supabase.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Connection timeout' },
      });

      try {
        await createSessionAndConsumeCredit('user-error', 123);
      } catch (error) {
        // Expected to throw
      }

      expect(CustomError.database).toHaveBeenCalledWith(
        'Error al cargar paquete: Connection timeout'
      );
    });

    it('should use CustomError.businessLogic for no packages', async () => {
      const { CustomError } = require('../error-handling');

      supabase.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      try {
        await createSessionAndConsumeCredit('user-no-pkg', 123);
      } catch (error) {
        // Expected to throw
      }

      expect(CustomError.businessLogic).toHaveBeenCalledWith(
        'No user packages found',
        'No tienes paquetes activos.'
      );
    });

    it('should use CustomError.businessLogic for no credits', async () => {
      const { CustomError } = require('../error-handling');

      supabase.maybeSingle.mockResolvedValueOnce({
        data: { id: 'pkg-1', creditsremaining: 0 },
        error: null,
      });

      try {
        await createSessionAndConsumeCredit('user-no-credits', 123);
      } catch (error) {
        // Expected to throw
      }

      expect(CustomError.businessLogic).toHaveBeenCalledWith(
        'No credits available',
        'No tienes créditos disponibles.'
      );
    });
  });
});
