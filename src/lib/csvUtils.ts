import { Deck, CardData } from '../types';

export class CSVUtils {
  static exportToCSV(deck: Deck): string {
    // Create CSV header
    const headers = ['Front', 'Back', 'Category', 'Tags', 'Media'];
    
    // Convert cards to CSV rows
    const rows = deck.cards.map(card => {
      const media = card.media?.map(m => `${m.type}:${m.url}`).join(';') || '';
      const tags = card.tags?.join(';') || '';
      return [
        this.escapeCSV(card.front),
        this.escapeCSV(card.back),
        card.category || '',
        tags,
        media
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  static importFromCSV(csvContent: string, deckId: string): CardData[] {
    const lines = csvContent.split('\n');
    if (lines.length < 2) return []; // Need at least header and one row

    const headers = lines[0].split(',');
    const cards: CardData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCSVLine(line);
      if (values.length !== headers.length) continue;

      const card: CardData = {
        id: `${deckId}-${i}`,
        front: this.unescapeCSV(values[0]),
        back: this.unescapeCSV(values[1]),
        created: new Date().toISOString(),
        lastReviewed: null,
        lastReview: null,
        interval: 0,
        ease: 2.5,
        repetitions: 0,
        nextReview: null,
        difficulty: 0.5,
        category: values[2] || undefined,
        tags: values[3] ? values[3].split(';') : undefined,
        media: values[4] ? this.parseMedia(values[4]) : undefined,
        reviewHistory: []
      };

      cards.push(card);
    }

    return cards;
  }

  private static escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private static unescapeCSV(value: string): string {
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1).replace(/""/g, '"');
    }
    return value;
  }

  private static parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Handle escaped quotes
          currentValue += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    values.push(currentValue);
    return values;
  }

  private static parseMedia(mediaString: string): { type: 'image' | 'audio' | 'video'; url: string }[] {
    return mediaString.split(';')
      .filter(m => m)
      .map(m => {
        const [type, url] = m.split(':');
        if (type && url && ['image', 'audio', 'video'].includes(type)) {
          return { type: type as 'image' | 'audio' | 'video', url };
        }
        return null;
      })
      .filter((m): m is { type: 'image' | 'audio' | 'video'; url: string } => m !== null);
  }
} 