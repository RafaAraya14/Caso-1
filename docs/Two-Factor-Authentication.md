# Two Factor Authentication (2FA) Documentation

## Overview

The 20minCoach platform implements a comprehensive Two Factor Authentication
(2FA) system to enhance security for all user types. This document provides
complete implementation details, usage examples, and best practices.

## Features

### 🔐 **Security Features**

- TOTP (Time-based One-Time Password) support
- Backup codes for account recovery
- Rate limiting and account lockout protection
- Multiple authentication methods (App, SMS, Email)
- Role-based 2FA policies

### 👥 **User Type Support**

- **BasicUser**: Optional 2FA with email/app methods
- **PremiumUser**: Required 2FA with enhanced features
- **AdminUser**: Mandatory 2FA with app-only for maximum security

### 🛡️ **Security Measures**

- Automatic lockout after 5 failed attempts
- 15-minute lockout duration
- Secure backup code generation and usage tracking
- Comprehensive audit logging

## Implementation

### Core Components

#### 1. TwoFactorAuthService

Main service class managing all 2FA operations.

```typescript
import { twoFactorAuthService } from './auth/twoFactorAuth';
```

#### 2. Interfaces

```typescript
interface TwoFactorConfig {
  enabled: boolean;
  method: '2fa_app' | 'sms' | 'email';
  secret?: string;
  backupCodes?: string[];
  lastUsed?: Date;
}
```

## Usage Examples

### Basic User Setup

```typescript
import { User } from './models/User';
import { twoFactorAuthService } from './auth/twoFactorAuth';

const basicUser = new User(
  'user123',
  'user@example.com',
  'John Doe',
  'BasicUser',
  false,
  5
);

// Step 1: Initiate 2FA setup
const setupResult = await twoFactorAuthService.setup2FA(basicUser, '2fa_app');

if (setupResult.success) {
  console.log('QR Code:', setupResult.qrCode);
  console.log('Secret:', setupResult.secret);
  console.log('Backup Codes:', setupResult.backupCodes);

  // Step 2: User scans QR code and enters verification code
  const userCode = '123456'; // From authenticator app

  // Step 3: Verify and enable 2FA
  const verifyResult = await twoFactorAuthService.verify2FASetup(
    basicUser,
    userCode
  );

  if (verifyResult.success) {
    console.log('2FA enabled successfully!');
  }
}
```

### Premium User Setup

```typescript
const premiumUser = new User(
  'premium123',
  'premium@example.com',
  'Jane Premium',
  'PremiumUser',
  true,
  0
);

// Premium users can use SMS method
const setupResult = await twoFactorAuthService.setup2FA(premiumUser, 'sms');

// Premium users get more backup codes
if (setupResult.success) {
  const newBackupCodes =
    await twoFactorAuthService.generateNewBackupCodes(premiumUser);
  console.log('Additional backup codes generated:', newBackupCodes.length);
}
```

### Admin User Setup

```typescript
const adminUser = new User(
  'admin123',
  'admin@example.com',
  'Admin User',
  'AdminUser',
  true,
  0
);

// Admin users must use 2FA app for maximum security
const setupResult = await twoFactorAuthService.setup2FA(adminUser, '2fa_app');
```

## Login Flow

### Standard Login with 2FA

```typescript
// During login, after password verification
const loginResult = await twoFactorAuthService.verifyLogin2FA(
  user,
  userProvidedCode
);

if (loginResult.success) {
  // Grant access
  console.log('Login successful');
} else {
  console.log('2FA verification failed:', loginResult.error);
  console.log('Attempts remaining:', loginResult.remainingAttempts);
}
```

### Using Backup Codes

```typescript
// User lost their device and uses backup code
const backupCode = '12345678'; // 8-digit backup code
const loginResult = await twoFactorAuthService.verifyLogin2FA(user, backupCode);

if (loginResult.success) {
  console.log('Backup code accepted - consider generating new codes');
}
```

## User Type Policies

### BasicUser Policy

```typescript
{
  required: false,
  methods: ['2fa_app', 'email'],
  backupCodes: 5,
  maxAttempts: 3
}
```

### PremiumUser Policy

```typescript
{
  required: true,
  methods: ['2fa_app', 'sms', 'email'],
  backupCodes: 10,
  maxAttempts: 5
}
```

### AdminUser Policy

```typescript
{
  required: true,
  methods: ['2fa_app'], // Most secure only
  backupCodes: 10,
  maxAttempts: 5
}
```

## Management Operations

### Check 2FA Status

```typescript
const status = twoFactorAuthService.get2FAStatus(user);
console.log('2FA enabled:', status.enabled);
console.log('Method:', status.method);
console.log('Backup codes remaining:', status.backupCodesRemaining);
```

### Disable 2FA

```typescript
const disableResult = await twoFactorAuthService.disable2FA(user, userPassword);

if (disableResult.success) {
  console.log('2FA disabled successfully');
} else {
  console.log('Failed to disable:', disableResult.error);
}
```

### Generate New Backup Codes

```typescript
try {
  const newCodes = await twoFactorAuthService.generateNewBackupCodes(user);
  console.log('New backup codes:', newCodes);
} catch (error) {
  console.error('Failed to generate backup codes:', error.message);
}
```

## Security Features

### Rate Limiting

The system automatically locks accounts after failed attempts:

- **Max attempts**: 5 failed verifications
- **Lockout duration**: 15 minutes
- **Automatic reset**: After successful verification

### Audit Logging

All 2FA operations are logged for security monitoring:

```typescript
// Examples of logged events
logger.info('2FA setup initiated', { userId, method });
logger.warn('2FA verification failed', { userId, attemptsRemaining });
logger.info('2FA disabled', { userId });
logger.warn('Backup code used', { userId, codesRemaining });
```

## Integration with Permissions

### Checking User Authentication Status

```typescript
import {
  PermissionsMiddleware,
  Permission,
} from './middleware/permissionsMiddleware';

// Check if user needs 2FA for sensitive operations
const canAccessAdmin = PermissionsMiddleware.hasPermission(
  user,
  Permission.MANAGE_USERS
);

if (canAccessAdmin.granted) {
  const twoFAStatus = twoFactorAuthService.get2FAStatus(user);

  if (user.role === 'AdminUser' && !twoFAStatus.enabled) {
    throw new Error('Administrators must enable 2FA');
  }
}
```

## Frontend Integration

### React Component Example

```typescript
import React, { useState } from 'react';
import { twoFactorAuthService } from '../auth/twoFactorAuth';

const TwoFactorSetup: React.FC<{ user: User }> = ({ user }) => {
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSetup = async () => {
    const result = await twoFactorAuthService.setup2FA(user);
    if (result.success) {
      setSetupData(result);
    }
  };

  const handleVerify = async () => {
    const result = await twoFactorAuthService.verify2FASetup(user, verificationCode);
    if (result.success) {
      alert('2FA enabled successfully!');
    }
  };

  return (
    <div>
      {!setupData ? (
        <button onClick={handleSetup}>Enable 2FA</button>
      ) : (
        <div>
          <img src={setupData.qrCode} alt="QR Code" />
          <input
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
          />
          <button onClick={handleVerify}>Verify & Enable</button>
        </div>
      )}
    </div>
  );
};
```

## Production Considerations

### Dependencies

For production use, install proper TOTP library:

```bash
npm install speakeasy qrcode
```

### Database Integration

Store 2FA configuration in your database:

```sql
CREATE TABLE user_2fa (
  user_id VARCHAR(255) PRIMARY KEY,
  enabled BOOLEAN DEFAULT FALSE,
  method ENUM('2fa_app', 'sms', 'email'),
  secret VARCHAR(255),
  backup_codes JSON,
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Environment Variables

```bash
# .env
TWO_FACTOR_ISSUER=20MinCoach
TWO_FACTOR_WINDOW=1
MAX_2FA_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
```

## Testing

### Running 2FA Examples

```typescript
import { runAll2FAExamples } from './auth/examples/twoFactorExamples';

// Run comprehensive test suite
await runAll2FAExamples();
```

### Unit Tests

```typescript
describe('TwoFactorAuthService', () => {
  test('should setup 2FA for basic user', async () => {
    const user = new User(
      'test',
      'test@example.com',
      'Test',
      'BasicUser',
      false,
      5
    );
    const result = await twoFactorAuthService.setup2FA(user);

    expect(result.success).toBe(true);
    expect(result.secret).toBeDefined();
    expect(result.backupCodes).toHaveLength(10);
  });

  test('should enforce rate limiting', async () => {
    // Test implementation here
  });
});
```

## Best Practices

### For Developers

1. **Always use HTTPS** for 2FA operations
2. **Validate user permissions** before 2FA operations
3. **Log all 2FA events** for security monitoring
4. **Use proper TOTP libraries** in production
5. **Implement proper error handling**

### For Users

1. **Save backup codes** in a secure location
2. **Use authenticator apps** over SMS when possible
3. **Don't share codes** with anyone
4. **Report suspicious activity** immediately

### For Administrators

1. **Monitor 2FA logs** regularly
2. **Enforce 2FA policies** by user role
3. **Provide user training** on 2FA usage
4. **Have recovery procedures** for lost devices

## Troubleshooting

### Common Issues

#### "Invalid verification code"

- Check time synchronization on device
- Verify code was entered correctly
- Try previous/next time window code

#### "Too many failed attempts"

- Wait 15 minutes for lockout to expire
- Use backup code if available
- Contact administrator for account reset

#### "2FA setup not found"

- Restart setup process
- Clear browser cache
- Check database connectivity

### Error Codes

```typescript
// Common error messages
'Invalid verification code'; // Wrong TOTP/backup code
'2FA is not enabled for this user'; // User hasn't set up 2FA
'Too many failed attempts'; // Rate limit exceeded
'Invalid password. Cannot disable 2FA'; // Wrong password
```

## Security Considerations

### Threat Mitigation

- **SIM Swap Attacks**: Prefer app-based 2FA over SMS
- **Phishing**: Educate users about legitimate 2FA prompts
- **Device Loss**: Backup codes provide recovery option
- **Brute Force**: Rate limiting prevents code guessing

### Compliance

This implementation supports compliance with:

- **GDPR**: User consent and data protection
- **SOC 2**: Security controls and monitoring
- **PCI DSS**: Enhanced authentication requirements

## Support

For implementation questions or issues:

1. Check the examples in `src/auth/examples/`
2. Review the test cases
3. Consult the API documentation
4. Contact the development team

---

**Last Updated**: September 2025  
**Version**: 1.0.0  
**Maintainer**: 20minCoach Development Team
