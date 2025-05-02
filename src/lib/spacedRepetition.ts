import { CardData, ReviewQuality } from '../types';

export interface CardReview {
  id: string;
  interval: number;
  ease: number;
  repetitions: number;
  nextReview: Date;
  lastReview: Date | null;
  difficulty: number; // 0-5 scale
}

export interface SpacedRepetitionAlgorithm {
  name: string;
  calculateNextReview: (card: CardReview, performance: number) => CardReview;
}

// SuperMemo-2 Algorithm
export const superMemo2: SpacedRepetitionAlgorithm = {
  name: 'SuperMemo-2',
  calculateNextReview: (card: CardReview, performance: number) => {
    // performance: 0-5 scale (0 = complete blackout, 5 = perfect recall)
    const newEase = card.ease + (0.1 - (5 - performance) * (0.08 + (5 - performance) * 0.02));
    const clampedEase = Math.max(1.3, newEase); // minimum ease factor is 1.3

    let newInterval: number;
    if (card.repetitions === 0) {
      newInterval = 1;
    } else if (card.repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(card.interval * clampedEase);
    }

    return {
      ...card,
      interval: newInterval,
      ease: clampedEase,
      repetitions: card.repetitions + 1,
      nextReview: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000), // Convert days to milliseconds
      lastReview: new Date(),
      difficulty: performance
    };
  }
};

// Leitner System
export const leitner: SpacedRepetitionAlgorithm = {
  name: 'Leitner',
  calculateNextReview: (card: CardReview, performance: number) => {
    // performance: 0-1 scale (0 = incorrect, 1 = correct)
    const box = Math.floor(card.interval); // In Leitner, interval represents the box number
    let newBox: number;

    if (performance >= 0.8) { // 80% or better performance
      newBox = Math.min(box + 1, 5); // Move to next box, max 5 boxes
    } else {
      newBox = Math.max(box - 1, 1); // Move back one box, minimum box 1
    }

    // Calculate days until next review based on box number
    const daysUntilReview = Math.pow(2, newBox - 1); // Box 1: 1 day, Box 2: 2 days, Box 3: 4 days, etc.

    return {
      ...card,
      interval: newBox,
      ease: card.ease, // Leitner doesn't use ease factor
      repetitions: card.repetitions + 1,
      nextReview: new Date(Date.now() + daysUntilReview * 24 * 60 * 60 * 1000),
      lastReview: new Date(),
      difficulty: performance * 5 // Convert to 0-5 scale
    };
  }
};

// Helper function to get cards due for review
export function getDueCards(cards: CardReview[]): CardReview[] {
  const now = new Date();
  return cards.filter(card => !card.nextReview || card.nextReview <= now);
}

// Helper function to sort cards by priority
export function sortCardsByPriority(cards: CardReview[]): CardReview[] {
  return [...cards].sort((a, b) => {
    if (!a.nextReview) return -1;
    if (!b.nextReview) return 1;
    return a.nextReview.getTime() - b.nextReview.getTime();
  });
}

// Helper function to get study statistics
export function getStudyStats(cards: CardReview[]) {
  const totalCards = cards.length;
  const dueCards = getDueCards(cards).length;
  const averageEase = cards.reduce((sum, card) => sum + card.ease, 0) / totalCards;
  const averageInterval = cards.reduce((sum, card) => sum + card.interval, 0) / totalCards;
  const averageDifficulty = cards.reduce((sum, card) => sum + card.difficulty, 0) / totalCards;

  return {
    totalCards,
    dueCards,
    averageEase,
    averageInterval,
    averageDifficulty,
    completionRate: ((totalCards - dueCards) / totalCards) * 100
  };
}

interface SM2Params {
  initialEase: number;
  minEase: number;
  maxInterval: number;
  intervalModifier: number;
}

const DEFAULT_PARAMS: SM2Params = {
  initialEase: 2.5,
  minEase: 1.3,
  maxInterval: 36500, // 100 years
  intervalModifier: 1.0,
};

export class SpacedRepetition {
  private params: SM2Params;

  constructor(params: Partial<SM2Params> = {}) {
    this.params = { ...DEFAULT_PARAMS, ...params };
  }

  calculateNextReview(card: CardData, quality: ReviewQuality): CardData {
    const now = new Date();
    let { interval, ease, repetitions } = card;

    // First review
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      // Calculate new interval based on SM-2 algorithm
      interval = Math.round(interval * ease * this.params.intervalModifier);
    }

    // Update ease factor
    const newEase = this.calculateNewEase(ease, quality);
    
    // Update repetitions
    repetitions += 1;

    // Calculate next review date
    const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

    return {
      ...card,
      interval,
      ease: newEase,
      repetitions,
      nextReview: nextReview.toISOString(),
      lastReviewed: now.toISOString(),
      reviewHistory: [
        ...(card.reviewHistory || []),
        {
          date: now.toISOString(),
          quality,
        },
      ],
    };
  }

  private calculateNewEase(currentEase: number, quality: ReviewQuality): number {
    // Enhanced ease factor calculation
    const qualityScore = quality;
    const newEase = currentEase + (0.1 - (3 - qualityScore) * (0.08 + (3 - qualityScore) * 0.02));
    
    // Ensure ease factor stays within bounds
    return Math.max(this.params.minEase, Math.min(2.5, newEase));
  }

  getDueCards(cards: CardData[]): CardData[] {
    const now = new Date();
    return cards.filter(card => {
      if (!card.nextReview) return true;
      return new Date(card.nextReview) <= now;
    });
  }

  getCardDifficulty(card: CardData): number {
    if (!card.reviewHistory || card.reviewHistory.length === 0) {
      return 0.5; // Default difficulty for new cards
    }

    // Calculate difficulty based on review history
    const recentReviews = card.reviewHistory.slice(-5);
    const averageQuality = recentReviews.reduce((sum, review) => sum + review.quality, 0) / recentReviews.length;
    
    // Normalize to 0-1 range
    return 1 - (averageQuality / 3);
  }

  getCardStrength(card: CardData): number {
    if (!card.reviewHistory || card.reviewHistory.length === 0) {
      return 0;
    }

    // Calculate card strength based on interval and ease factor
    const baseStrength = Math.log(card.interval) * card.ease;
    const reviewConsistency = this.calculateReviewConsistency(card);
    
    return Math.min(1, (baseStrength / 100) * reviewConsistency);
  }

  private calculateReviewConsistency(card: CardData): number {
    if (!card.reviewHistory || card.reviewHistory.length < 2) {
      return 1;
    }

    // Calculate consistency based on review quality stability
    const recentReviews = card.reviewHistory.slice(-5);
    const qualityVariance = this.calculateVariance(
      recentReviews.map(review => review.quality)
    );

    return Math.max(0, 1 - qualityVariance / 4);
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }
} 