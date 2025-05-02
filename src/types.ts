export interface CardData {
  id: string;
  front: string;
  back: string;
  created: string;
  lastReviewed: string | null;
  lastReview: Date | null;
  interval: number;  // days until next review
  ease: number;      // ease factor (2.5 default)
  repetitions: number;
  nextReview: string | null;
  difficulty: number;
  category?: string;
  tags?: string[];
  media?: {
    type: 'image' | 'audio' | 'video';
    url: string;
  }[];
  reviewHistory: {
    date: string;
    quality: ReviewQuality;
    responseTime?: number;
    fatigueFactor?: number;
    stability?: number;
  }[];
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  cards: CardData[];
  created: string;
  lastStudied: string | null;
  category?: string;
  tags?: string[];
  algorithm: 'superMemo2' | 'leitner';
  settings: {
    newCardsPerDay: number;
    reviewCardsPerDay: number;
    maxInterval: number;
    minEase: number;
  };
  studyStats?: {
    totalReviews: number;
    averageScore: number;
    lastWeekReviews: number;
    streak: number;
  };
}

export enum ReviewQuality {
  Again = 0,
  Hard = 1,
  Good = 2,
  Easy = 3,
}

export interface StudySession {
  id: string;
  deckId: string;
  startTime: string;
  endTime: string;
  cardsReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageResponseTime: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ar';
  defaultDifficulty: 'easy' | 'medium' | 'hard';
  enableSound: boolean;
  enableAnimations: boolean;
  reviewReminders: boolean;
  dailyGoal: number;
  exportFormat: 'json' | 'csv' | 'txt';
}
