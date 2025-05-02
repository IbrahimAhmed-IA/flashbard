import { CardData, ReviewQuality } from '../types';

// Enhanced SM-2 Algorithm with fatigue and memory stability factors
export class EnhancedSpacedRepetition {
  private readonly MIN_EASE = 1.3;
  private readonly MAX_EASE = 2.5;
  private readonly INITIAL_EASE = 2.5;
  private readonly FATIGUE_FACTOR = 0.1;
  private readonly STABILITY_FACTOR = 0.8;

  calculateNextReview(card: CardData, quality: ReviewQuality, sessionStats: {
    cardsReviewed: number;
    timeSpent: number;
    consecutiveCorrect: number;
  }): CardData {
    const now = new Date();
    let { interval, ease, repetitions } = card;

    // Calculate fatigue factor based on session stats
    const fatigueFactor = this.calculateFatigueFactor(sessionStats);
    
    // Calculate memory stability based on review history
    const stability = this.calculateMemoryStability(card);

    // Adjust ease factor based on performance and fatigue
    const newEase = this.calculateNewEase(ease, quality, fatigueFactor);

    // Calculate new interval with stability factor
    let newInterval: number;
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEase * stability * (1 - fatigueFactor));
    }

    // Update card with new values
    return {
      ...card,
      interval: newInterval,
      ease: newEase,
      repetitions: repetitions + 1,
      nextReview: new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000).toISOString(),
      lastReviewed: now.toISOString(),
      reviewHistory: [
        ...(card.reviewHistory || []),
        {
          date: now.toISOString(),
          quality,
          responseTime: sessionStats.timeSpent / sessionStats.cardsReviewed,
          fatigueFactor,
          stability
        }
      ]
    };
  }

  private calculateFatigueFactor(sessionStats: {
    cardsReviewed: number;
    timeSpent: number;
    consecutiveCorrect: number;
  }): number {
    // Fatigue increases with more cards reviewed and time spent
    const reviewFatigue = Math.min(0.5, sessionStats.cardsReviewed * 0.01);
    const timeFatigue = Math.min(0.3, sessionStats.timeSpent / 3600 * 0.1);
    
    // Consecutive correct answers reduce fatigue
    const fatigueReduction = Math.min(0.4, sessionStats.consecutiveCorrect * 0.05);
    
    return Math.max(0, reviewFatigue + timeFatigue - fatigueReduction);
  }

  private calculateMemoryStability(card: CardData): number {
    if (!card.reviewHistory || card.reviewHistory.length === 0) {
      return 1;
    }

    // Calculate stability based on recent review performance
    const recentReviews = card.reviewHistory.slice(-5);
    const averageQuality = recentReviews.reduce((sum, review) => sum + review.quality, 0) / recentReviews.length;
    
    // Higher quality reviews increase stability
    return this.STABILITY_FACTOR + (averageQuality / 5) * (1 - this.STABILITY_FACTOR);
  }

  private calculateNewEase(currentEase: number, quality: ReviewQuality, fatigueFactor: number): number {
    // Base ease factor calculation from SM-2
    const qualityScore = quality;
    const newEase = currentEase + (0.1 - (3 - qualityScore) * (0.08 + (3 - qualityScore) * 0.02));
    
    // Adjust for fatigue
    const fatigueAdjustedEase = newEase * (1 - fatigueFactor);
    
    // Ensure ease factor stays within bounds
    return Math.max(this.MIN_EASE, Math.min(this.MAX_EASE, fatigueAdjustedEase));
  }

  // Calculate optimal review schedule for a card
  getOptimalReviewSchedule(card: CardData): Date[] {
    const schedule: Date[] = [];
    let currentDate = new Date();
    let currentInterval = card.interval;

    // Generate next 5 review dates
    for (let i = 0; i < 5; i++) {
      currentDate = new Date(currentDate.getTime() + currentInterval * 24 * 60 * 60 * 1000);
      schedule.push(currentDate);
      currentInterval = Math.round(currentInterval * card.ease);
    }

    return schedule;
  }

  // Calculate card difficulty based on review history
  getCardDifficulty(card: CardData): number {
    if (!card.reviewHistory || card.reviewHistory.length === 0) {
      return 0.5;
    }

    const recentReviews = card.reviewHistory.slice(-5);
    const averageQuality = recentReviews.reduce((sum, review) => sum + review.quality, 0) / recentReviews.length;
    const responseTimeVariance = this.calculateResponseTimeVariance(recentReviews);
    
    // Difficulty increases with lower quality and higher response time variance
    return Math.min(1, Math.max(0, 
      (1 - averageQuality / 5) * 0.7 + 
      (responseTimeVariance / 10) * 0.3
    ));
  }

  private calculateResponseTimeVariance(reviews: { responseTime: number }[]): number {
    if (reviews.length < 2) return 0;
    
    const times = reviews.map(r => r.responseTime);
    const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
    const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
    
    return variance;
  }

  // Get recommended study session length based on card difficulty
  getRecommendedSessionLength(cards: CardData[]): number {
    const totalDifficulty = cards.reduce((sum, card) => sum + this.getCardDifficulty(card), 0);
    const averageDifficulty = totalDifficulty / cards.length;
    
    // Base session length of 20 minutes, adjusted by difficulty
    return Math.round(20 * (1 + averageDifficulty));
  }
} 