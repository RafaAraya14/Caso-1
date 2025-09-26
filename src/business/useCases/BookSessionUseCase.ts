// src/business/useCases/BookSessionUseCase.ts

import { SessionService } from '../../services/SessionService';
import { PaymentService } from '../../services/PaymentService';
import { SessionBusinessRules } from '../rules/SessionRules';
import { User } from '../../models/User';
import { Coach } from '../../models/Coach';

export class BookSessionUseCase {
  constructor(
    private sessionService: SessionService,
    private paymentService: PaymentService
  ) { }

  async execute(userId: string, coachId: string): Promise<void> {
    // Business logic implementation

    // In order to compile, create placeholder objects
    const user = new User(userId, 'test@user.com', 'Test User', 'BasicUser', true, 5);
    const coach = new Coach(coachId, 'Test Coach', 4.5, [], true);

    const validation = SessionBusinessRules.canBookSession(coach, user);

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    await this.sessionService.createSession(userId, coachId);
    await this.paymentService.chargeSession(userId);
  }
}