import { Deck, CardData } from '../types';

export interface ExportOptions {
  format: 'json' | 'csv' | 'txt';
  includeStats?: boolean;
  includeMedia?: boolean;
  includeTags?: boolean;
}

export interface ImportOptions {
  format: 'json' | 'csv' | 'txt';
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
    const deck: Deck = {
      id: crypto.randomUUID(),
      name: importData.name,
      description: importData.description,
      cards: importData.cards.map((card: any) => ({
        id: crypto.randomUUID(),
        front: card.front,
        back: card.back,
        created: new Date().toISOString(),
        lastReviewed: null,
        lastReview: null,
        interval: card.interval || 0,
        ease: card.ease || 2.5,
        repetitions: card.repetitions || 0,
        nextReview: null,
        difficulty: 0.5,
        tags: card.tags || [],
        media: card.media || [],
        reviewHistory: card.reviewHistory || [],
      })),
      created: new Date().toISOString(),
      lastStudied: null,
      algorithm: 'superMemo2',
      settings: {
        newCardsPerDay: 20,
        reviewCardsPerDay: 100,
        maxInterval: 36500,
        minEase: 1.3,
      },
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
    const lines = data.split('\n');
    const headers = lines[0].split(',');
    const cards: CardData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const card: CardData = {
        id: crypto.randomUUID(),
        front: values[0],
        back: values[1],
        created: new Date().toISOString(),
        lastReviewed: null,
        lastReview: null,
        interval: 0,
        ease: 2.5,
        repetitions: 0,
        nextReview: null,
        difficulty: 0.5,
        tags: [],
        media: [],
        reviewHistory: [],
      };

      if (headers.includes('tags')) {
        const tagIndex = headers.indexOf('tags');
        card.tags = values[tagIndex] ? values[tagIndex].split(';') : [];
      }

      if (headers.includes('interval')) {
        const intervalIndex = headers.indexOf('interval');
        card.interval = parseInt(values[intervalIndex]) || 0;
      }

      if (headers.includes('ease')) {
        const easeIndex = headers.indexOf('ease');
        card.ease = parseFloat(values[easeIndex]) || 2.5;
      }

      if (headers.includes('repetitions')) {
        const repetitionsIndex = headers.indexOf('repetitions');
        card.repetitions = parseInt(values[repetitionsIndex]) || 0;
      }

      cards.push(card);
    }

    return {
      id: crypto.randomUUID(),
      name: 'Imported Deck',
      description: 'Imported from CSV',
      cards,
      created: new Date().toISOString(),
      lastStudied: null,
      algorithm: 'superMemo2',
      settings: {
        newCardsPerDay: 20,
        reviewCardsPerDay: 100,
        maxInterval: 36500,
        minEase: 1.3,
      },
      studyStats: {
        totalReviews: 0,
        averageScore: 0,
        lastWeekReviews: 0,
        streak: 0,
      },
    };
  }

  private importFromTXT(data: string, options: ImportOptions): Deck {
    const lines = data.split('\n');
    const cards: CardData[] = [];
    let currentCard: Partial<CardData> | null = null;

    for (const line of lines) {
      if (line.startsWith('Card ')) {
        if (currentCard) {
          cards.push({
            id: crypto.randomUUID(),
            front: currentCard.front || '',
            back: currentCard.back || '',
            created: new Date().toISOString(),
            lastReviewed: null,
            lastReview: null,
            interval: currentCard.interval || 0,
            ease: currentCard.ease || 2.5,
            repetitions: currentCard.repetitions || 0,
            nextReview: null,
            difficulty: 0.5,
            tags: currentCard.tags || [],
            media: currentCard.media || [],
            reviewHistory: currentCard.reviewHistory || [],
          });
        }
        currentCard = {};
      } else if (currentCard) {
        if (line.startsWith('Front: ')) {
          currentCard.front = line.slice(7);
        } else if (line.startsWith('Back: ')) {
          currentCard.back = line.slice(6);
        } else if (line.startsWith('Tags: ')) {
          currentCard.tags = line.slice(6).split(', ');
        } else if (line.startsWith('Interval: ')) {
          currentCard.interval = parseInt(line.slice(10)) || 0;
        } else if (line.startsWith('Ease: ')) {
          currentCard.ease = parseFloat(line.slice(6)) || 2.5;
        } else if (line.startsWith('Repetitions: ')) {
          currentCard.repetitions = parseInt(line.slice(13)) || 0;
        }
      }
    }

    if (currentCard) {
      cards.push({
        id: crypto.randomUUID(),
        front: currentCard.front || '',
        back: currentCard.back || '',
        created: new Date().toISOString(),
        lastReviewed: null,
        lastReview: null,
        interval: currentCard.interval || 0,
        ease: currentCard.ease || 2.5,
        repetitions: currentCard.repetitions || 0,
        nextReview: null,
        difficulty: 0.5,
        tags: currentCard.tags || [],
        media: currentCard.media || [],
        reviewHistory: currentCard.reviewHistory || [],
      });
    }

    return {
      id: crypto.randomUUID(),
      name: 'Imported Deck',
      description: 'Imported from TXT',
      cards,
      created: new Date().toISOString(),
      lastStudied: null,
      algorithm: 'superMemo2',
      settings: {
        newCardsPerDay: 20,
        reviewCardsPerDay: 100,
        maxInterval: 36500,
        minEase: 1.3,
      },
      studyStats: {
        totalReviews: 0,
        averageScore: 0,
        lastWeekReviews: 0,
        streak: 0,
      },
    };
  }
}

export const exportImportManager = new ExportImportManager(); 