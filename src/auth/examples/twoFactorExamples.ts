// src/auth/examples/twoFactorExamples.ts

import { User } from '../../models/User';
import { twoFactorAuthService } from '../twoFactorAuth';

/**
 * Comprehensive examples and tests for 2FA implementation
 * with different user types: BasicUser, PremiumUser, AdminUser
 */

/**
 * Example 1: Setting up 2FA for a Basic User
 */
export async function exampleBasicUser2FASetup(): Promise<void> {
  console.log('=== Example 1: Basic User 2FA Setup ===');

  const basicUser = new User('basic123', 'basic@example.com', 'John Basic', 'BasicUser', false, 5);

  try {
    // Step 1: Initiate 2FA setup
    const setupResult = await twoFactorAuthService.setup2FA(basicUser, '2fa_app');

    if (setupResult.success) {
      console.log('✅ 2FA setup initiated for Basic User');
      console.log('Secret:', setupResult.secret);
      console.log('QR Code URL:', setupResult.qrCode);
      console.log('Backup codes generated:', setupResult.backupCodes?.length);

      // Step 2: Simulate user scanning QR code and entering verification code
      // For demo, we'll generate a valid code based on the secret
      const verificationCode = generateDemoCode(setupResult.secret!);

      // Step 3: Verify setup
      const verifyResult = await twoFactorAuthService.verify2FASetup(basicUser, verificationCode);

      if (verifyResult.success) {
        console.log('✅ 2FA setup completed successfully for Basic User');

        // Check status
        const status = twoFactorAuthService.get2FAStatus(basicUser);
        console.log('2FA Status:', status);
      } else {
        console.log('❌ 2FA setup verification failed:', verifyResult.error);
      }
    } else {
      console.log('❌ 2FA setup failed:', setupResult.error);
    }
  } catch (error) {
    console.error('Error in Basic User 2FA setup:', error);
  }
}

/**
 * Example 2: Setting up 2FA for a Premium User
 */
export async function examplePremiumUser2FASetup(): Promise<void> {
  console.log('\n=== Example 2: Premium User 2FA Setup ===');

  const premiumUser = new User(
    'premium456',
    'premium@example.com',
    'Jane Premium',
    'PremiumUser',
    true,
    0 // Unlimited sessions
  );

  try {
    // Premium users might prefer SMS or email method
    const setupResult = await twoFactorAuthService.setup2FA(premiumUser, 'sms');

    if (setupResult.success) {
      console.log('✅ 2FA setup initiated for Premium User (SMS method)');
      console.log('Backup codes for Premium User:', setupResult.backupCodes?.length);

      // Simulate verification
      const verificationCode = generateDemoCode(setupResult.secret!);
      const verifyResult = await twoFactorAuthService.verify2FASetup(premiumUser, verificationCode);

      if (verifyResult.success) {
        console.log('✅ Premium User 2FA setup completed');

        // Premium users get additional backup codes
        const newBackupCodes = await twoFactorAuthService.generateNewBackupCodes(premiumUser);
        console.log('New backup codes generated for Premium User:', newBackupCodes.length);
      }
    }
  } catch (error) {
    console.error('Error in Premium User 2FA setup:', error);
  }
}

/**
 * Example 3: Admin User 2FA with enhanced security
 */
export async function exampleAdminUser2FASetup(): Promise<void> {
  console.log('\n=== Example 3: Admin User 2FA Setup ===');

  const adminUser = new User('admin789', 'admin@example.com', 'Admin User', 'AdminUser', true, 0);

  try {
    // Admin users typically use 2FA app for security
    const setupResult = await twoFactorAuthService.setup2FA(adminUser, '2fa_app');

    if (setupResult.success) {
      console.log('✅ 2FA setup initiated for Admin User');
      console.log('Admin security level: Enhanced');

      const verificationCode = generateDemoCode(setupResult.secret!);
      const verifyResult = await twoFactorAuthService.verify2FASetup(adminUser, verificationCode);

      if (verifyResult.success) {
        console.log('✅ Admin User 2FA setup completed with enhanced security');
      }
    }
  } catch (error) {
    console.error('Error in Admin User 2FA setup:', error);
  }
}

/**
 * Example 4: Testing 2FA login flow for different user types
 */
export async function example2FALoginFlow(): Promise<void> {
  console.log('\n=== Example 4: 2FA Login Flow Testing ===');

  // First, setup users with 2FA
  const users = [
    new User('test1', 'test1@example.com', 'Test Basic', 'BasicUser', false, 3),
    new User('test2', 'test2@example.com', 'Test Premium', 'PremiumUser', true, 0),
    new User('test3', 'test3@example.com', 'Test Admin', 'AdminUser', true, 0),
  ];

  for (const user of users) {
    try {
      // Setup 2FA
      const setupResult = await twoFactorAuthService.setup2FA(user);
      if (setupResult.success) {
        const verificationCode = generateDemoCode(setupResult.secret!);
        await twoFactorAuthService.verify2FASetup(user, verificationCode);

        console.log(`✅ 2FA enabled for ${user.role}: ${user.name}`);

        // Test login verification
        const loginCode = generateDemoCode(setupResult.secret!);
        const loginResult = await twoFactorAuthService.verifyLogin2FA(user, loginCode);

        if (loginResult.success) {
          console.log(`✅ Login successful for ${user.role}`);
        } else {
          console.log(`❌ Login failed for ${user.role}: ${loginResult.error}`);
        }
      }
    } catch (error) {
      console.error(`Error testing ${user.role}:`, error);
    }
  }
}

/**
 * Example 5: Testing backup codes functionality
 */
export async function exampleBackupCodesUsage(): Promise<void> {
  console.log('\n=== Example 5: Backup Codes Usage ===');

  const user = new User(
    'backup_test',
    'backup@example.com',
    'Backup Test User',
    'PremiumUser',
    true,
    0
  );

  try {
    // Setup 2FA
    const setupResult = await twoFactorAuthService.setup2FA(user);
    if (setupResult.success && setupResult.backupCodes) {
      const verificationCode = generateDemoCode(setupResult.secret!);
      await twoFactorAuthService.verify2FASetup(user, verificationCode);

      console.log('✅ User setup complete with backup codes');
      console.log('Generated backup codes:', setupResult.backupCodes.length);

      // Test using a backup code for login
      const backupCode = setupResult.backupCodes[0];
      const loginResult = await twoFactorAuthService.verifyLogin2FA(user, backupCode);

      if (loginResult.success) {
        console.log('✅ Backup code login successful');

        // Check remaining backup codes
        const status = twoFactorAuthService.get2FAStatus(user);
        console.log('Backup codes remaining:', status.backupCodesRemaining);
      } else {
        console.log('❌ Backup code login failed:', loginResult.error);
      }
    }
  } catch (error) {
    console.error('Error testing backup codes:', error);
  }
}

/**
 * Example 6: Testing security features (rate limiting, lockout)
 */
export async function exampleSecurityFeatures(): Promise<void> {
  console.log('\n=== Example 6: Security Features Testing ===');

  const user = new User(
    'security_test',
    'security@example.com',
    'Security Test User',
    'BasicUser',
    false,
    5
  );

  try {
    // Setup 2FA
    const setupResult = await twoFactorAuthService.setup2FA(user);
    if (setupResult.success) {
      const verificationCode = generateDemoCode(setupResult.secret!);
      await twoFactorAuthService.verify2FASetup(user, verificationCode);

      console.log('✅ User setup for security testing');

      // Test multiple failed attempts
      console.log('Testing rate limiting with invalid codes...');
      for (let i = 1; i <= 6; i++) {
        const result = await twoFactorAuthService.verifyLogin2FA(user, '000000');
        console.log(
          `Attempt ${i}: ${result.success ? 'Success' : 'Failed'} - ${result.error || 'OK'}`
        );

        if (result.remainingAttempts !== undefined) {
          console.log(`Remaining attempts: ${result.remainingAttempts}`);
        }
      }

      // Try with valid code after lockout
      const validCode = generateDemoCode(setupResult.secret!);
      const lockedResult = await twoFactorAuthService.verifyLogin2FA(user, validCode);
      console.log(
        'Valid code after lockout:',
        lockedResult.success ? 'Accepted' : `Rejected: ${lockedResult.error}`
      );
    }
  } catch (error) {
    console.error('Error testing security features:', error);
  }
}

/**
 * Example 7: 2FA disable functionality
 */
export async function example2FADisable(): Promise<void> {
  console.log('\n=== Example 7: 2FA Disable Functionality ===');

  const user = new User(
    'disable_test',
    'disable@example.com',
    'Disable Test User',
    'PremiumUser',
    true,
    0
  );

  try {
    // Setup and enable 2FA
    const setupResult = await twoFactorAuthService.setup2FA(user);
    if (setupResult.success) {
      const verificationCode = generateDemoCode(setupResult.secret!);
      await twoFactorAuthService.verify2FASetup(user, verificationCode);

      console.log('✅ 2FA enabled for user');

      // Check status before disable
      let status = twoFactorAuthService.get2FAStatus(user);
      console.log('Status before disable:', status);

      // Disable 2FA (requires password verification)
      const disableResult = await twoFactorAuthService.disable2FA(user, 'validpassword123');

      if (disableResult.success) {
        console.log('✅ 2FA disabled successfully');

        // Check status after disable
        status = twoFactorAuthService.get2FAStatus(user);
        console.log('Status after disable:', status);
      } else {
        console.log('❌ Failed to disable 2FA:', disableResult.error);
      }
    }
  } catch (error) {
    console.error('Error testing 2FA disable:', error);
  }
}

/**
 * Example 8: Integration with user role permissions
 */
export async function example2FAWithPermissions(): Promise<void> {
  console.log('\n=== Example 8: 2FA with Role-based Permissions ===');

  const users = [
    {
      user: new User('perm1', 'perm1@example.com', 'Basic with 2FA', 'BasicUser', false, 2),
      required: false,
    },
    {
      user: new User('perm2', 'perm2@example.com', 'Premium with 2FA', 'PremiumUser', true, 0),
      required: true,
    },
    {
      user: new User('perm3', 'perm3@example.com', 'Admin with 2FA', 'AdminUser', true, 0),
      required: true,
    },
  ];

  for (const { user, required } of users) {
    console.log(`\n${user.role} - 2FA ${required ? 'Required' : 'Optional'}:`);

    const status = twoFactorAuthService.get2FAStatus(user);

    if (required && !status.enabled) {
      console.log(`⚠️  ${user.role} requires 2FA but it's not enabled`);

      // Auto-setup for required users
      const setupResult = await twoFactorAuthService.setup2FA(user);
      if (setupResult.success) {
        console.log(`📱 2FA setup initiated for ${user.role}`);
      }
    } else if (status.enabled) {
      console.log(`✅ ${user.role} has 2FA enabled`);
    } else {
      console.log(`ℹ️  ${user.role} can optionally enable 2FA`);
    }
  }
}

/**
 * Helper function to generate demo TOTP codes
 */
function generateDemoCode(secret: string): string {
  // Simple demo code generation - in real app use proper TOTP library
  const timeWindow = Math.floor(Date.now() / 30000);
  const hash = simpleHash(secret + timeWindow.toString());
  return (hash % 1000000).toString().padStart(6, '0');
}

/**
 * Simple hash function for demo
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Run all 2FA examples
 */
export async function runAll2FAExamples(): Promise<void> {
  console.log('🔐 Running 2FA Examples for Different User Types...\n');

  try {
    await exampleBasicUser2FASetup();
    await examplePremiumUser2FASetup();
    await exampleAdminUser2FASetup();
    await example2FALoginFlow();
    await exampleBackupCodesUsage();
    await exampleSecurityFeatures();
    await example2FADisable();
    await example2FAWithPermissions();

    console.log('\n✅ All 2FA examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running 2FA examples:', error);
  }
}

/**
 * User type specific 2FA policies
 */
export const twoFactorPolicies = {
  BasicUser: {
    required: false,
    methods: ['2fa_app', 'email'],
    backupCodes: 5,
    maxAttempts: 3,
  },
  PremiumUser: {
    required: true,
    methods: ['2fa_app', 'sms', 'email'],
    backupCodes: 10,
    maxAttempts: 5,
  },
  AdminUser: {
    required: true,
    methods: ['2fa_app'], // Most secure method only
    backupCodes: 10,
    maxAttempts: 5,
  },
};
