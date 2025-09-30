// src/auth/twoFactorAuth.ts

import { logger } from '../logging';

import type { User } from '../models/User';

export interface TwoFactorConfig {
  enabled: boolean;
  method: '2fa_app' | 'sms' | 'email';
  secret?: string;
  backupCodes?: string[];
  lastUsed?: Date;
}

export interface TwoFactorSetupResult {
  success: boolean;
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  error?: string;
}

export interface TwoFactorVerificationResult {
  success: boolean;
  error?: string;
  remainingAttempts?: number;
}

export interface TwoFactorStatus {
  enabled: boolean;
  method?: string;
  setupComplete: boolean;
  backupCodesRemaining: number;
}

/**
 * Two Factor Authentication service for enhanced security
 */
export class TwoFactorAuthService {
  private static instance: TwoFactorAuthService;
  private userConfigs = new Map<string, TwoFactorConfig>();
  private verificationAttempts = new Map<string, { count: number; lastAttempt: Date }>();
  private maxAttempts = 5;
  private lockoutDuration = 15 * 60 * 1000; // 15 minutes

  private constructor() {}

  static getInstance(): TwoFactorAuthService {
    if (!TwoFactorAuthService.instance) {
      TwoFactorAuthService.instance = new TwoFactorAuthService();
    }
    return TwoFactorAuthService.instance;
  }

  /**
   * Setup 2FA for a user
   */
  async setup2FA(
    user: User,
    method: '2fa_app' | 'sms' | 'email' = '2fa_app'
  ): Promise<TwoFactorSetupResult> {
    try {
      logger.info('Setting up 2FA', {
        userId: user.id,
        metadata: { method },
      });

      // Generate secret for 2FA app
      const secret = this.generateSecret();
      const backupCodes = this.generateBackupCodes();

      // For demo purposes, we'll simulate QR code generation
      const qrCode = this.generateQRCode(user.email, secret);

      const config: TwoFactorConfig = {
        enabled: false, // Will be enabled after verification
        method,
        secret,
        backupCodes,
      };

      // Store temporary config (in real app, this would be in database)
      this.userConfigs.set(user.id, config);

      logger.info('2FA setup initiated', {
        userId: user.id,
        metadata: {
          method,
          backupCodesGenerated: backupCodes.length,
        },
      });

      return {
        success: true,
        secret,
        qrCode,
        backupCodes,
      };
    } catch (error) {
      logger.error('Failed to setup 2FA', error as Error, {
        userId: user.id,
      });
      return {
        success: false,
        error: 'Failed to setup 2FA. Please try again.',
      };
    }
  }

  /**
   * Verify 2FA code and enable 2FA for user
   */
  async verify2FASetup(user: User, code: string): Promise<TwoFactorVerificationResult> {
    try {
      const config = this.userConfigs.get(user.id);
      if (!config) {
        return {
          success: false,
          error: '2FA setup not found. Please restart setup process.',
        };
      }

      const isValid = this.verifyTOTP(config.secret || '', code);

      if (isValid) {
        // Enable 2FA
        config.enabled = true;
        config.lastUsed = new Date();
        this.userConfigs.set(user.id, config);

        logger.info('2FA setup completed', { userId: user.id });

        return { success: true };
      } else {
        logger.warn('Invalid 2FA code during setup', { userId: user.id });
        return {
          success: false,
          error: 'Invalid verification code. Please try again.',
        };
      }
    } catch (error) {
      logger.error('2FA setup verification failed', error as Error, {
        userId: user.id,
      });
      return {
        success: false,
        error: 'Verification failed. Please try again.',
      };
    }
  }

  /**
   * Verify 2FA code during login
   */
  async verifyLogin2FA(user: User, code: string): Promise<TwoFactorVerificationResult> {
    try {
      // Check if user is locked out
      if (this.isUserLockedOut(user.id)) {
        const lockoutMinutes = Math.ceil(this.lockoutDuration / 60000);
        return {
          success: false,
          error: `Too many failed attempts. Please try again in ${lockoutMinutes} minutes.`,
        };
      }

      const config = this.userConfigs.get(user.id);
      if (!config || !config.enabled) {
        return {
          success: false,
          error: '2FA is not enabled for this user.',
        };
      }

      let isValid = false;

      // Check if it's a backup code
      if (this.isBackupCode(code)) {
        isValid = this.verifyBackupCode(user.id, code);
      } else {
        // Verify TOTP code
        isValid = this.verifyTOTP(config.secret || '', code);
      }

      if (isValid) {
        // Reset failed attempts
        this.verificationAttempts.delete(user.id);
        config.lastUsed = new Date();

        logger.info('2FA verification successful', { userId: user.id });
        return { success: true };
      } else {
        // Track failed attempt
        this.trackFailedAttempt(user.id);
        const attempts = this.verificationAttempts.get(user.id);
        const remaining = this.maxAttempts - (attempts?.count || 0);

        logger.warn('2FA verification failed', {
          userId: user.id,
          metadata: {
            attemptsRemaining: remaining,
          },
        });

        return {
          success: false,
          error: 'Invalid verification code.',
          remainingAttempts: remaining,
        };
      }
    } catch (error) {
      logger.error('2FA login verification failed', error as Error, {
        userId: user.id,
      });
      return {
        success: false,
        error: 'Verification failed. Please try again.',
      };
    }
  }

  /**
   * Disable 2FA for a user
   */
  async disable2FA(user: User, password: string): Promise<TwoFactorVerificationResult> {
    try {
      // In real app, verify password first
      if (!this.verifyPassword(user, password)) {
        return {
          success: false,
          error: 'Invalid password. Cannot disable 2FA.',
        };
      }

      this.userConfigs.delete(user.id);
      this.verificationAttempts.delete(user.id);

      logger.info('2FA disabled', { userId: user.id });

      return { success: true };
    } catch (error) {
      logger.error('Failed to disable 2FA', error as Error, {
        userId: user.id,
      });
      return {
        success: false,
        error: 'Failed to disable 2FA. Please try again.',
      };
    }
  }

  /**
   * Get 2FA status for a user
   */
  get2FAStatus(user: User): TwoFactorStatus {
    const config = this.userConfigs.get(user.id);

    return {
      enabled: config?.enabled || false,
      method: config?.method,
      setupComplete: config?.enabled || false,
      backupCodesRemaining: config?.backupCodes?.length || 0,
    };
  }

  /**
   * Generate new backup codes
   */
  async generateNewBackupCodes(user: User): Promise<string[]> {
    const config = this.userConfigs.get(user.id);
    if (!config || !config.enabled) {
      throw new Error('2FA is not enabled for this user');
    }

    const newBackupCodes = this.generateBackupCodes();
    config.backupCodes = newBackupCodes;
    this.userConfigs.set(user.id, config);

    logger.info('New backup codes generated', { userId: user.id });

    return newBackupCodes;
  }

  // ===============================
  // PRIVATE HELPER METHODS
  // ===============================

  /**
   * Generate a random secret for TOTP
   */
  private generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-digit backup codes
      const code = Math.random().toString().substr(2, 8);
      codes.push(code);
    }
    return codes;
  }

  /**
   * Generate QR code URL (simplified for demo)
   */
  private generateQRCode(email: string, secret: string): string {
    const issuer = '20MinCoach';
    const otpAuthUrl = `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}`;

    // In real app, use a QR code library
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;
  }

  /**
   * Verify TOTP code (simplified implementation)
   */
  private verifyTOTP(secret: string, code: string): boolean {
    // Simplified TOTP verification for demo
    // In real app, use a proper TOTP library like 'speakeasy'
    const timeWindow = Math.floor(Date.now() / 30000);
    const expectedCode = this.generateTOTP(secret, timeWindow);

    // Also check previous and next time windows for clock drift
    const prevCode = this.generateTOTP(secret, timeWindow - 1);
    const nextCode = this.generateTOTP(secret, timeWindow + 1);

    return code === expectedCode || code === prevCode || code === nextCode;
  }

  /**
   * Generate TOTP code (simplified implementation)
   */
  private generateTOTP(secret: string, timeCounter: number): string {
    // Simplified TOTP generation for demo
    // In real app, use proper HMAC-SHA1 implementation
    const hash = this.simpleHash(secret + timeCounter.toString());
    const code = (hash % 1000000).toString().padStart(6, '0');
    return code;
  }

  /**
   * Simple hash function for demo (use proper crypto in production)
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Check if code is a backup code format
   */
  private isBackupCode(code: string): boolean {
    return /^\d{8}$/.test(code);
  }

  /**
   * Verify backup code
   */
  private verifyBackupCode(userId: string, code: string): boolean {
    const config = this.userConfigs.get(userId);
    if (!config || !config.backupCodes) {
      return false;
    }

    const index = config.backupCodes.indexOf(code);
    if (index !== -1) {
      // Remove used backup code
      config.backupCodes.splice(index, 1);
      this.userConfigs.set(userId, config);

      logger.info('Backup code used', {
        userId,
        metadata: {
          codesRemaining: config.backupCodes.length,
        },
      });

      return true;
    }

    return false;
  }

  /**
   * Track failed verification attempt
   */
  private trackFailedAttempt(userId: string): void {
    const now = new Date();
    const attempts = this.verificationAttempts.get(userId) || {
      count: 0,
      lastAttempt: now,
    };

    attempts.count++;
    attempts.lastAttempt = now;

    this.verificationAttempts.set(userId, attempts);
  }

  /**
   * Check if user is locked out due to too many failed attempts
   */
  private isUserLockedOut(userId: string): boolean {
    const attempts = this.verificationAttempts.get(userId);
    if (!attempts || attempts.count < this.maxAttempts) {
      return false;
    }

    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
    return timeSinceLastAttempt < this.lockoutDuration;
  }

  /**
   * Verify user password (simplified for demo)
   */
  private verifyPassword(user: User, password: string): boolean {
    // In real app, compare with hashed password
    return password.length >= 8; // Simplified validation
  }
}

// Export singleton instance
export const twoFactorAuthService = TwoFactorAuthService.getInstance();

export default TwoFactorAuthService;
