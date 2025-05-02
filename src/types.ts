export interface CardData {
  id: string;
  front: string;
  back: string;
  created: string;
  lastReviewed: string | null;
  interval: number;  // days until next review
  ease: number;      // ease factor (2.5 default)
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  cards: CardData[];
  created: string;
  lastStudied: string | null;
}

export enum ReviewQuality {
  Again = 0,
  Hard = 1,
  Good = 2,
  Easy = 3,
}
