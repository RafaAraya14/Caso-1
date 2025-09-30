/**
 * Middleware Examples
 *
 * Example implementations showing how to use the middleware components
 */

import { User } from '../../models';
import { enhancedRequestLogger } from '../enhancedRequestLogger';
import { Permission, PermissionsMiddleware } from '../permissionsMiddleware';

/**
 * Create a mock user for testing
 */
function createMockUser(type: 'basic' | 'premium' | 'admin'): User {
  const hasActiveSubscription = type !== 'basic';
  let sessionsRemaining: number;
  if (type === 'basic') {
    sessionsRemaining = 1;
  } else if (type === 'premium') {
    sessionsRemaining = 10;
  } else {
    sessionsRemaining = 999;
  }

  switch (type) {
    case 'basic':
      return new User(
        `${type}-user-001`,
        `${type}@example.com`,
        `${type.charAt(0).toUpperCase() + type.slice(1)} User`,
        'BasicUser',
        hasActiveSubscription,
        sessionsRemaining
      );
    case 'premium':
      return new User(
        `${type}-user-001`,
        `${type}@example.com`,
        `${type.charAt(0).toUpperCase() + type.slice(1)} User`,
        'PremiumUser',
        hasActiveSubscription,
        sessionsRemaining
      );
    case 'admin':
      return new User(
        `${type}-user-001`,
        `${type}@example.com`,
        `${type.charAt(0).toUpperCase() + type.slice(1)} User`,
        'AdminUser',
        hasActiveSubscription,
        sessionsRemaining
      );
  }
}

/**
 * Example 1: Basic permissions check
 */
export function exampleBasicPermissions() {
  const basicUser = createMockUser('basic');

  // Check if user can create sessions
  const canCreate = PermissionsMiddleware.hasPermission(basicUser, Permission.CREATE_SESSION);

  if (canCreate.granted) {
    console.log('✅ User can create sessions');
  } else {
    console.log('❌ User cannot create sessions:', canCreate.reason);
  }
}

/**
 * Example 2: Permission decorator usage
 */
export class SessionController {
  static createSession(user: User, sessionData: Record<string, unknown>) {
    // Check permission first
    const hasPermission = PermissionsMiddleware.hasPermission(user, Permission.CREATE_SESSION);

    if (!hasPermission.granted) {
      throw new Error(`Permission denied: ${hasPermission.reason}`);
    }

    console.log('Creating session for user:', user.name);
    return { id: 'session-001', ...sessionData };
  }

  static deleteUser(user: User, targetUserId: string) {
    // Check permission first
    const hasPermission = PermissionsMiddleware.hasPermission(user, Permission.MANAGE_USERS);

    if (!hasPermission.granted) {
      throw new Error(`Permission denied: ${hasPermission.reason}`);
    }

    console.log('Deleting user:', targetUserId);
    return { success: true };
  }
}

/**
 * Example 3: Request logging
 */
export function exampleRequestLogging() {
  const user = createMockUser('premium');
  const additionalContext = {
    sessionId: 'sess-001',
    trackPerformance: true,
  };

  // Log a request
  enhancedRequestLogger.logRequest(
    'req-001',
    'POST',
    'https://api.example.com/coaches/search',
    user,
    additionalContext
  );

  // Simulate response
  setTimeout(() => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
    };

    enhancedRequestLogger.logResponse('req-001', mockResponse);
  }, 150);
}

/**
 * Example 4: Error logging
 */
export function exampleErrorLogging() {
  const user = createMockUser('basic');

  // Start request
  enhancedRequestLogger.logRequest(
    'req-error-001',
    'POST',
    'https://api.example.com/sessions/book',
    user
  );

  // Simulate error response
  setTimeout(() => {
    const errorResponse = {
      status: 500,
      statusText: 'Internal Server Error',
    };

    enhancedRequestLogger.logResponse('req-error-001', errorResponse, 'Database connection failed');
  }, 100);
}

/**
 * Example 5: Performance monitoring
 */
export function examplePerformanceMonitoring() {
  // Get performance statistics
  const stats = enhancedRequestLogger.getPerformanceStats();

  console.log('\\n=== Performance Stats ===');
  console.log('Average response time:', stats.averageResponseTime, 'ms');
  console.log('Slow requests count:', stats.slowRequestsCount);
  console.log('Active requests count:', stats.activeRequestsCount);
}

/**
 * Mock service for demonstration
 */
class MockCoachService {
  static async searchCoaches(
    user: User,
    searchParams: Record<string, unknown>
  ): Promise<Record<string, unknown>[]> {
    // Simulate permission check
    const hasPermission = PermissionsMiddleware.hasPermission(user, Permission.ADVANCED_SEARCH);

    if (!hasPermission.granted) {
      throw new Error('Insufficient permissions');
    } // Log the search request
    const requestId = `search-${Date.now()}`;
    enhancedRequestLogger.logRequest(requestId, 'GET', '/api/coaches/search', user);

    try {
      const results = await this.performSearch(searchParams);

      const response = {
        status: 200,
        statusText: 'OK',
      };

      enhancedRequestLogger.logResponse(requestId, response);
      return results;
    } catch (error) {
      const errorResponse = {
        status: 500,
        statusText: 'Internal Server Error',
      };

      enhancedRequestLogger.logResponse(
        requestId,
        errorResponse,
        error instanceof Error ? error.message : 'Search failed'
      );
      throw error;
    }
  }

  private static async performSearch(
    _params: Record<string, unknown>
  ): Promise<Record<string, unknown>[]> {
    // Mock search logic
    return [
      { id: '1', name: 'John Doe', speciality: 'Development' },
      { id: '2', name: 'Jane Smith', speciality: 'Design' },
    ];
  }
}

/**
 * Example 6: Integrated middleware usage
 */
export async function exampleIntegratedMiddleware() {
  const user = createMockUser('premium');

  // Check permissions first
  const canSearch = PermissionsMiddleware.hasPermission(user, Permission.ADVANCED_SEARCH);

  if (!canSearch.granted) {
    console.log('Permission denied:', canSearch.reason);
    return;
  }

  // Start request logging
  const requestId = 'req-integrated-001';
  enhancedRequestLogger.logRequest(
    requestId,
    'POST',
    'https://api.example.com/coaches/advanced-search',
    user
  );

  try {
    // Simulate API call
    const results = await MockCoachService.searchCoaches(user, {
      query: 'senior developer',
      location: 'remote',
      availability: 'immediate',
    });

    const response = {
      status: 200,
      statusText: 'OK',
    };

    enhancedRequestLogger.logResponse(requestId, response);
    console.log('Advanced search completed successfully');
    return results;
  } catch (error) {
    const errorResponse = {
      status: 500,
      statusText: 'Internal Server Error',
    };

    enhancedRequestLogger.logResponse(
      requestId,
      errorResponse,
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

/**
 * Helper function to get UI permissions for display logic
 */
export function getUIPermissions(user: User) {
  return {
    showCreateButton: PermissionsMiddleware.hasPermission(user, Permission.CREATE_SESSION).granted,
    showAdvancedSearch: PermissionsMiddleware.hasPermission(user, Permission.ADVANCED_SEARCH)
      .granted,
    showUpgradeOffer: user.role === 'BasicUser',
    showAdminPanel: PermissionsMiddleware.hasPermission(user, Permission.MANAGE_USERS).granted,
  };
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🚀 Running Middleware Examples...\\n');

  // Basic permissions
  exampleBasicPermissions();

  // Logging examples
  exampleRequestLogging();
  exampleErrorLogging();

  // Performance monitoring
  examplePerformanceMonitoring();

  // UI permissions for a basic user
  const basicUser = createMockUser('basic');
  const uiPermissions = getUIPermissions(basicUser);

  console.log('\\n=== UI Permissions for Basic User ===');
  console.log('Show create button:', uiPermissions.showCreateButton);
  console.log('Show advanced search:', uiPermissions.showAdvancedSearch);
  console.log('Show upgrade offer:', uiPermissions.showUpgradeOffer);
  console.log('Show admin panel:', uiPermissions.showAdminPanel);

  // Integrated middleware usage
  try {
    await exampleIntegratedMiddleware();
  } catch (error) {
    console.error('Integrated middleware example failed:', error);
  }

  console.log('\\n✅ All middleware examples completed!');
}

// Export for testing
if (require.main === module) {
  runAllExamples().catch(console.error);
}
