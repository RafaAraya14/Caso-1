// src/middleware/permissionsMiddleware.ts

import { logger } from '../logging/logger';

import type { User, UserRole } from '../models/User';

/**
 * Permissions map for different resources and actions
 */
export enum Permission {
  // Session permissions
  CREATE_SESSION = 'create_session',
  VIEW_SESSION = 'view_session',
  CANCEL_SESSION = 'cancel_session',

  // Coach permissions
  VIEW_COACH_PROFILE = 'view_coach_profile',
  BOOK_COACH = 'book_coach',
  RATE_COACH = 'rate_coach',

  // Admin permissions
  MANAGE_USERS = 'manage_users',
  VIEW_ANALYTICS = 'view_analytics',
  MODERATE_CONTENT = 'moderate_content',

  // Premium features
  UNLIMITED_SESSIONS = 'unlimited_sessions',
  PRIORITY_SUPPORT = 'priority_support',
  ADVANCED_SEARCH = 'advanced_search',
}

/**
 * Role-based permissions configuration
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  BasicUser: [
    Permission.CREATE_SESSION,
    Permission.VIEW_SESSION,
    Permission.CANCEL_SESSION,
    Permission.VIEW_COACH_PROFILE,
    Permission.BOOK_COACH,
    Permission.RATE_COACH,
  ],
  PremiumUser: [
    Permission.CREATE_SESSION,
    Permission.VIEW_SESSION,
    Permission.CANCEL_SESSION,
    Permission.VIEW_COACH_PROFILE,
    Permission.BOOK_COACH,
    Permission.RATE_COACH,
    Permission.UNLIMITED_SESSIONS,
    Permission.PRIORITY_SUPPORT,
    Permission.ADVANCED_SEARCH,
  ],
  AdminUser: [
    // Admin has all permissions
    ...Object.values(Permission),
  ],
};

/**
 * Permission validation result
 */
export interface PermissionResult {
  granted: boolean;
  reason?: string;
  requiredRole?: UserRole;
}

/**
 * Permissions middleware for role-based access control
 */
export class PermissionsMiddleware {
  /**
   * Check if user has specific permission
   */
  static hasPermission(user: User, permission: Permission): PermissionResult {
    try {
      // Check if user is valid
      if (!user || !user.role) {
        logger.warn('Permission check failed: Invalid user', {
          metadata: { permission },
        });
        return {
          granted: false,
          reason: 'Invalid user or missing role',
        };
      }

      // Get permissions for user role
      const rolePermissions = ROLE_PERMISSIONS[user.role];

      if (!rolePermissions) {
        logger.warn('Permission check failed: Unknown role', {
          userId: user.id,
          metadata: {
            role: user.role,
            permission,
          },
        });
        return {
          granted: false,
          reason: `Unknown role: ${user.role}`,
        };
      }

      // Check if permission is granted
      const hasPermission = rolePermissions.includes(permission);

      if (!hasPermission) {
        logger.info('Permission denied', {
          userId: user.id,
          metadata: {
            role: user.role,
            permission,
            reason: 'Insufficient privileges',
          },
        });

        return {
          granted: false,
          reason: 'Insufficient privileges for this action',
          requiredRole: this.getRequiredRole(permission),
        };
      }

      // Additional validation for session limits
      if (permission === Permission.CREATE_SESSION && user.role === 'BasicUser') {
        if (user.sessionsRemaining <= 0) {
          logger.info('Permission denied: No sessions remaining', {
            userId: user.id,
            metadata: {
              sessionsRemaining: user.sessionsRemaining,
            },
          });

          return {
            granted: false,
            reason: 'No sessions remaining. Upgrade to Premium for unlimited sessions.',
            requiredRole: 'PremiumUser',
          };
        }
      }

      logger.debug('Permission granted', {
        userId: user.id,
        metadata: {
          role: user.role,
          permission,
        },
      });

      return { granted: true };
    } catch (error) {
      logger.error('Error checking permissions', error as Error, {
        userId: user?.id,
        metadata: { permission },
      });
      return {
        granted: false,
        reason: 'Internal error during permission check',
      };
    }
  }

  /**
   * Check multiple permissions at once
   */
  static hasPermissions(user: User, permissions: Permission[]): PermissionResult {
    for (const permission of permissions) {
      const result = this.hasPermission(user, permission);
      if (!result.granted) {
        return result;
      }
    }
    return { granted: true };
  }

  /**
   * Get required role for a specific permission
   */
  private static getRequiredRole(permission: Permission): UserRole | undefined {
    for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      if (permissions.includes(permission)) {
        return role as UserRole;
      }
    }
    return undefined;
  }

  /**
   * Middleware function for Express-like frameworks
   */
  static requirePermission(permission: Permission) {
    return (user: User) => {
      const result = this.hasPermission(user, permission);

      if (!result.granted) {
        throw new Error(result.reason || 'Access denied');
      }

      return true;
    };
  }

  /**
   * Middleware function for multiple permissions
   */
  static requirePermissions(permissions: Permission[]) {
    return (user: User) => {
      const result = this.hasPermissions(user, permissions);

      if (!result.granted) {
        throw new Error(result.reason || 'Access denied');
      }

      return true;
    };
  }

  /**
   * Get all permissions for a user role
   */
  static getRolePermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Check if user can upgrade to access a feature
   */
  static getUpgradeInfo(
    user: User,
    permission: Permission
  ): {
    canUpgrade: boolean;
    targetRole?: UserRole;
    benefits?: string[];
  } {
    if (this.hasPermission(user, permission).granted) {
      return { canUpgrade: false };
    }

    // Check if upgrading to Premium would grant the permission
    if (user.role === 'BasicUser' && ROLE_PERMISSIONS.PremiumUser.includes(permission)) {
      return {
        canUpgrade: true,
        targetRole: 'PremiumUser',
        benefits: [
          'Unlimited sessions',
          'Priority support',
          'Advanced search features',
          'No session limits',
        ],
      };
    }

    return { canUpgrade: false };
  }
}

/**
 * Decorator for permission-based method protection
 */
export function RequirePermission(permission: Permission) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (user: User, ...args: any[]) {
      const result = PermissionsMiddleware.hasPermission(user, permission);

      if (!result.granted) {
        throw new Error(`Access denied: ${result.reason}`);
      }

      return originalMethod.apply(this, [user, ...args]);
    };

    return descriptor;
  };
}

export default PermissionsMiddleware;
