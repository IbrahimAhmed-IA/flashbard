import { Deck, CardData } from '../types';

export interface ExportOptions {
  format: 'json' | 'csv' | 'txt';
  includeStats?: boolean;
  includeMedia?: boolean;
  includeTags?: boolean;
}

export interface ImportOptions {
  format: 'json' | 'csv' | 'txt';
  name?: string;
  description?: string;
  mergeStrategy?: 'replace' | 'merge' | 'skip';
}

export class ExportImportManager {
  async exportDeck(deck: Deck, options: ExportOptions): Promise<string> {
    switch (options.format) {
      case 'json':
        return this.exportToJSON(deck, options);
      case 'csv':
        return this.exportToCSV(deck, options);
      case 'txt':
        return this.exportToTXT(deck, options);
      default:
        throw new Error('Unsupported export format');
    }
  }

  async importDeck(data: string, options: ImportOptions): Promise<Deck> {
    switch (options.format) {
      case 'json':
        return this.importFromJSON(data, options);
      case 'csv':
        return this.importFromCSV(data, options);
      case 'txt':
        return this.importFromTXT(data, options);
      default:
        throw new Error('Unsupported import format');
    }
  }

  private exportToJSON(deck: Deck, options: ExportOptions): string {
    const exportData = {
      name: deck.name,
      description: deck.description,
      cards: deck.cards.map(card => ({
        front: card.front,
        back: card.back,
        ...(options.includeTags && { tags: card.tags }),
        ...(options.includeMedia && { media: card.media }),
        ...(options.includeStats && {
          interval: card.interval,
          ease: card.ease,
          repetitions: card.repetitions,
          reviewHistory: card.reviewHistory,
        }),
      })),
      ...(options.includeStats && {
        studyStats: deck.studyStats,
      }),
    };

    return JSON.stringify(exportData, null, 2);
  }

  private exportToCSV(deck: Deck, options: ExportOptions): string {
    const headers = ['front', 'back'];
    if (options.includeTags) headers.push('tags');
    if (options.includeStats) {
      headers.push('interval', 'ease', 'repetitions');
    }

    const rows = deck.cards.map(card => {
      const row = [card.front, card.back];
      if (options.includeTags) row.push(card.tags?.join(';') || '');
      if (options.includeStats) {
        row.push(
          card.interval.toString(),
          card.ease.toString(),
          card.repetitions.toString()
        );
      }
      return row;
    });

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  private exportToTXT(deck: Deck, options: ExportOptions): string {
    const lines: string[] = [
      `Deck: ${deck.name}`,
      `Description: ${deck.description}`,
      '',
      'Cards:',
      '',
    ];

    deck.cards.forEach((card, index) => {
      lines.push(`Card ${index + 1}:`);
      lines.push(`Front: ${card.front}`);
      lines.push(`Back: ${card.back}`);
      if (options.includeTags && card.tags?.length) {
        lines.push(`Tags: ${card.tags.join(', ')}`);
      }
      if (options.includeStats) {
        lines.push(`Interval: ${card.interval}`);
        lines.push(`Ease: ${card.ease}`);
        lines.push(`Repetitions: ${card.repetitions}`);
      }
      lines.push('');
    });

    return lines.join('\n');
  }

  private importFromJSON(data: string, options: ImportOptions): Deck {
    const importData = JSON.parse(data);
    const deckId = crypto.randomUUID();
    const deck: Deck = {
      id: deckId,
      name: importData.name,
      description: importData.description || '',
      created: new Date().toISOString(),
      lastStudied: null,
      algorithm: 'superMemo2',
      settings: {
        newCardsPerDay: 20,
        reviewCardsPerDay: 50,
        maxInterval: 365,
        minEase: 1.3
      },
      cards: importData.cards.map((card: any) => ({
        id: crypto.randomUUID(),
        deckId,
        front: card.front,
        back: card.back,
        created: card.created || new Date().toISOString(),
        lastReviewed: card.lastReviewed || null,
        lastReview: card.lastReview || null,
        interval: card.interval || 0,
        ease: card.ease || 2.5,
        repetitions: card.repetitions || 0,
        nextReview: card.nextReview || null,
        difficulty: card.difficulty || 0,
        tags: card.tags || [],
        media: card.media || [],
        reviewHistory: card.reviewHistory || []
      })),
      studyStats: importData.studyStats || {
        totalReviews: 0,
        averageScore: 0,
        lastWeekReviews: 0,
        streak: 0,
      },
    };
    return deck;
  }

  private importFromCSV(data: string, options: ImportOptions): Deck {
    const deckId = crypto.randomUUID();
    const lines = data.split('\n');
    const cards: CardData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= 2) {
        const card: CardData = {
          id: crypto.randomUUID(),
          deckId,
          front: values[0],
          back: values[1],
          created: new Date().toISOString(),
          lastReviewed: null,
          lastReview: null,
          interval: 0,
          ease: 2.5,
          repetitions: 0,
          nextReview: null,
          difficulty: 0,
          tags: values[2] ? values[2].split(';') : [],
          media: values[3] ? JSON.parse(values[3]) : [],
          reviewHistory: []
        };
        cards.push(card);
      }
    }

    return {
      id: deckId,
      name: options.name || 'Imported Deck',
      description: options.description || 'Imported from CSV',
      created: new Date().toISOString(),
      lastStudied: null,
      algorithm: 'superMemo2',
      settings: {
        newCardsPerDay: 20,
        reviewCardsPerDay: 50,
        maxInterval: 365,
        minEase: 1.3
      },
      cards
    };
  }

  private importFromTXT(data: string, options: ImportOptions): Deck {
    const deckId = crypto.randomUUID();
    const cards: CardData[] = [];
    const lines = data.split('\n');
    let currentCard: Partial<CardData> = {};
    
    for (const line of lines) {
      if (line.trim() === '') {
        if (currentCard.front && currentCard.back) {
          cards.push({
            id: crypto.randomUUID(),
            deckId,
            front: currentCard.front || '',
            back: currentCard.back || '',
            created: currentCard.created || new Date().toISOString(),
            lastReviewed: currentCard.lastReviewed || null,
            lastReview: currentCard.lastReview || null,
            interval: currentCard.interval || 0,
            ease: currentCard.ease || 2.5,
            repetitions: currentCard.repetitions || 0,
            nextReview: currentCard.nextReview || null,
            difficulty: currentCard.difficulty || 0,
            tags: currentCard.tags || [],
            media: currentCard.media || [],
            reviewHistory: currentCard.reviewHistory || []
          });
          currentCard = {};
        }
      } else if (line.startsWith('Q:')) {
        currentCard.front = line.substring(2).trim();
      } else if (line.startsWith('A:')) {
        currentCard.back = line.substring(2).trim();
      }
    }
    
    if (currentCard.front && currentCard.back) {
      cards.push({
        id: crypto.randomUUID(),
        deckId,
        front: currentCard.front || '',
        back: currentCard.back || '',
        created: currentCard.created || new Date().toISOString(),
        lastReviewed: currentCard.lastReviewed || null,
        lastReview: currentCard.lastReview || null,
        interval: currentCard.interval || 0,
        ease: currentCard.ease || 2.5,
        repetitions: currentCard.repetitions || 0,
        nextReview: currentCard.nextReview || null,
        difficulty: currentCard.difficulty || 0,
        tags: currentCard.tags || [],
        media: currentCard.media || [],
        reviewHistory: currentCard.reviewHistory || []
      });
    }

    return {
      id: deckId,
      name: options.name || 'Imported Deck',
      description: options.description || 'Imported from TXT',
      created: new Date().toISOString(),
      lastStudied: null,
      algorithm: 'superMemo2',
      settings: {
        newCardsPerDay: 20,
        reviewCardsPerDay: 50,
        maxInterval: 365,
        minEase: 1.3
      },
      cards
    };
  }
}

export const exportImportManager = new ExportImportManager(); 