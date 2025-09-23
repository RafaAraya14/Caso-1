export class CoachDomain {
  private minimumRating = 3.5;
  private maxSessionsPerDay = 8;
  
  constructor(
    public id: string,
    public name: string,
    public rating: number,
    public specialties: string[],
    private sessionsToday: number = 0
  ) {}
  
  canAcceptSession(): boolean {
    return this.sessionsToday < this.maxSessionsPerDay && 
           this.rating >= this.minimumRating;
  }
  
  calculateEarnings(sessions: number, tierMultiplier: number): number {
    const baseRate = 25;
    return sessions * baseRate * tierMultiplier * (1 + (this.rating - 3) * 0.1);
  }
}