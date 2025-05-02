import { useState, useCallback } from 'react';
import { CardData, ReviewQuality } from '../../types';
import { SpacedRepetition } from '../spacedRepetition';

interface UseSpacedRepetitionProps {
  initialCards: CardData[];
  params?: {
    initialEase?: number;
    minEase?: number;
    maxInterval?: number;
    intervalModifier?: number;
  };
}

export function useSpacedRepetition({ initialCards, params }: UseSpacedRepetitionProps) {
  const [cards, setCards] = useState<CardData[]>(initialCards);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const spacedRepetition = new SpacedRepetition(params);

  const getDueCards = useCallback(() => {
    return spacedRepetition.getDueCards(cards);
  }, [cards]);

  const reviewCard = useCallback((quality: ReviewQuality) => {
    setCards(prevCards => {
      const updatedCards = [...prevCards];
      const currentCard = updatedCards[currentCardIndex];
      
      // Update the card with new review data
      updatedCards[currentCardIndex] = spacedRepetition.calculateNextReview(currentCard, quality);
      
      return updatedCards;
    });
  }, [currentCardIndex]);

  const getCurrentCard = useCallback(() => {
    return cards[currentCardIndex];
  }, [cards, currentCardIndex]);

  const getCardStats = useCallback((card: CardData) => {
    return {
      difficulty: spacedRepetition.getCardDifficulty(card),
      strength: spacedRepetition.getCardStrength(card),
    };
  }, []);

  const nextCard = useCallback(() => {
    setCurrentCardIndex(prev => (prev + 1) % cards.length);
  }, [cards.length]);

  const previousCard = useCallback(() => {
    setCurrentCardIndex(prev => (prev - 1 + cards.length) % cards.length);
  }, [cards.length]);

  return {
    cards,
    currentCard: getCurrentCard(),
    currentCardIndex,
    reviewCard,
    nextCard,
    previousCard,
    getDueCards,
    getCardStats,
  };
} 