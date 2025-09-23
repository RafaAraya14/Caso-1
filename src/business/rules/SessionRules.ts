import { Coach } from '../../models/Coach';
import { User } from '../../models/User';

export class SessionBusinessRules {
  static readonly SESSION_DURATION = 20;
  static readonly BUFFER_TIME = 5;
  
  static canBookSession(coach: Coach, user: User): ValidationResult {
    const errors: string[] = [];
    
    if (!user.hasActiveSubscription) {
      errors.push('User must have active subscription');
    }
    
    if (user.sessionsRemaining <= 0) {
      errors.push('No sessions remaining in package');
    }
    
    if (!coach.isAvailable) {
      errors.push('Coach is not available');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}