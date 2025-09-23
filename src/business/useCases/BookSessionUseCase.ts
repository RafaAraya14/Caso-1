import { SessionService } from '../../services/SessionService';
import { PaymentService } from '../../services/PaymentService';
import { SessionBusinessRules } from '../rules/SessionRules';

export class BookSessionUseCase {
  constructor(
    private sessionService: SessionService,
    private paymentService: PaymentService
  ) {}
  
  async execute(userId: string, coachId: string): Promise<void> {
    // Business logic implementation
    const validation = SessionBusinessRules.canBookSession(coach, user);
    
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    await this.sessionService.createSession(userId, coachId);
    await this.paymentService.chargeSession(userId);
  }
}