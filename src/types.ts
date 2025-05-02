export interface CardData {
  id: string;
  front: string;
  back: string;
  created: string;
  lastReviewed: string | null;
  interval: number;  // days until next review
  ease: number;      // ease factor (2.5 default)
  category?: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  reviewHistory?: {
    date: string;
    quality: ReviewQuality;
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
