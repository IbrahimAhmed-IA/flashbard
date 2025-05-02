import { Deck, CardData } from '../types';

export interface StudySession {
  id: string;
  deckId: string;
  startTime: string;
  endTime: string;
  cardsReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedCards: number;
  timeSpent: number; // in seconds
}

export interface StudyStats {
  totalSessions: number;
  totalCardsReviewed: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  totalSkippedCards: number;
  totalTimeSpent: number;
  averageAccuracy: number;
  averageTimePerCard: number;
  streak: number;
  lastStudyDate: string | null;
}

export interface DailyStats {
  date: string;
  sessions: number;
  cardsReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  accuracy: number;
}

export interface CardPerformance {
  cardId: string;
  front: string;
  back: string;
  totalReviews: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageResponseTime: number;
  lastReviewDate: string | null;
  difficulty: number;
}

class AnalyticsManager {
  private sessions: StudySession[] = [];
  private cardPerformance: Map<string, CardPerformance> = new Map();

  constructor() {
    this.loadData();
  }

  private loadData() {
    const savedSessions = localStorage.getItem('studySessions');
    const savedCardPerformance = localStorage.getItem('cardPerformance');
    
    if (savedSessions) {
      this.sessions = JSON.parse(savedSessions);
    }
    
    if (savedCardPerformance) {
      this.cardPerformance = new Map(Object.entries(JSON.parse(savedCardPerformance)));
    }
  }

  private saveData() {
    localStorage.setItem('studySessions', JSON.stringify(this.sessions));
    localStorage.setItem('cardPerformance', JSON.stringify(Object.fromEntries(this.cardPerformance)));
  }

  startSession(deckId: string): string {
    const sessionId = crypto.randomUUID();
    const session: StudySession = {
      id: sessionId,
      deckId,
      startTime: new Date().toISOString(),
      endTime: '',
      cardsReviewed: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      skippedCards: 0,
      timeSpent: 0
    };
    
    this.sessions.push(session);
    this.saveData();
    return sessionId;
  }

  endSession(sessionId: string, stats: Partial<StudySession>) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      Object.assign(session, {
        ...stats,
        endTime: new Date().toISOString()
      });
      this.saveData();
    }
  }

  recordCardReview(
    sessionId: string,
    card: CardData,
    isCorrect: boolean,
    responseTime: number
  ) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return;

    // Update session stats
    session.cardsReviewed++;
    if (isCorrect) {
      session.correctAnswers++;
    } else {
      session.incorrectAnswers++;
    }
    session.timeSpent += responseTime;

    // Update card performance
    let performance = this.cardPerformance.get(card.id);
    if (!performance) {
      performance = {
        cardId: card.id,
        front: card.front,
        back: card.back,
        totalReviews: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        averageResponseTime: 0,
        lastReviewDate: null,
        difficulty: 0.5
      };
    }

    performance.totalReviews++;
    if (isCorrect) {
      performance.correctAnswers++;
    } else {
      performance.incorrectAnswers++;
    }
    performance.averageResponseTime = 
      (performance.averageResponseTime * (performance.totalReviews - 1) + responseTime) / 
      performance.totalReviews;
    performance.lastReviewDate = new Date().toISOString();
    performance.difficulty = performance.incorrectAnswers / performance.totalReviews;

    this.cardPerformance.set(card.id, performance);
    this.saveData();
  }

  getStudyStats(deckId?: string): StudyStats {
    const relevantSessions = deckId 
      ? this.sessions.filter(s => s.deckId === deckId)
      : this.sessions;

    const totalSessions = relevantSessions.length;
    const totalCardsReviewed = relevantSessions.reduce((sum, s) => sum + s.cardsReviewed, 0);
    const totalCorrectAnswers = relevantSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalIncorrectAnswers = relevantSessions.reduce((sum, s) => sum + s.incorrectAnswers, 0);
    const totalSkippedCards = relevantSessions.reduce((sum, s) => sum + s.skippedCards, 0);
    const totalTimeSpent = relevantSessions.reduce((sum, s) => sum + s.timeSpent, 0);

    return {
      totalSessions,
      totalCardsReviewed,
      totalCorrectAnswers,
      totalIncorrectAnswers,
      totalSkippedCards,
      totalTimeSpent,
      averageAccuracy: totalCardsReviewed ? (totalCorrectAnswers / totalCardsReviewed) * 100 : 0,
      averageTimePerCard: totalCardsReviewed ? totalTimeSpent / totalCardsReviewed : 0,
      streak: this.calculateStreak(relevantSessions),
      lastStudyDate: this.getLastStudyDate(relevantSessions)
    };
  }

  getDailyStats(days: number = 30, deckId?: string): DailyStats[] {
    const relevantSessions = deckId 
      ? this.sessions.filter(s => s.deckId === deckId)
      : this.sessions;

    const dailyStats = new Map<string, DailyStats>();
    const today = new Date();
    
    // Initialize last 30 days
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyStats.set(dateStr, {
        date: dateStr,
        sessions: 0,
        cardsReviewed: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        timeSpent: 0,
        accuracy: 0
      });
    }

    // Fill in actual stats
    relevantSessions.forEach(session => {
      const dateStr = session.startTime.split('T')[0];
      const stats = dailyStats.get(dateStr);
      if (stats) {
        stats.sessions++;
        stats.cardsReviewed += session.cardsReviewed;
        stats.correctAnswers += session.correctAnswers;
        stats.incorrectAnswers += session.incorrectAnswers;
        stats.timeSpent += session.timeSpent;
        stats.accuracy = stats.cardsReviewed 
          ? (stats.correctAnswers / stats.cardsReviewed) * 100 
          : 0;
      }
    });

    return Array.from(dailyStats.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  getCardPerformance(deckId?: string): CardPerformance[] {
    const performances = Array.from(this.cardPerformance.values());
    return deckId
      ? performances.filter(p => p.deckId === deckId)
      : performances;
  }

  private calculateStreak(sessions: StudySession[]): number {
    if (sessions.length === 0) return 0;

    const dates = new Set(
      sessions.map(s => s.startTime.split('T')[0])
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    while (dates.has(currentDate.toISOString().split('T')[0])) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  private getLastStudyDate(sessions: StudySession[]): string | null {
    if (sessions.length === 0) return null;
    return sessions.reduce((latest, session) => 
      session.startTime > latest ? session.startTime : latest
    , sessions[0].startTime);
  }
}

export const analyticsManager = new AnalyticsManager(); 