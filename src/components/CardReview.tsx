import React, { useState } from 'react';
import { CardData, ReviewQuality } from '../types';
import { useSpacedRepetition } from '../lib/hooks/useSpacedRepetition';

interface CardReviewProps {
  cards: CardData[];
  onComplete: (updatedCards: CardData[]) => void;
}

export function CardReview({ cards, onComplete }: CardReviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const {
    currentCard,
    reviewCard,
    nextCard,
    getCardStats,
  } = useSpacedRepetition({ initialCards: cards });

  const handleReview = (quality: ReviewQuality) => {
    reviewCard(quality);
    setIsFlipped(false);
    nextCard();
  };

  const cardStats = currentCard ? getCardStats(currentCard) : null;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {currentCard ? (
        <div className="space-y-6">
          {/* Card Display */}
          <div
            className="relative h-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform duration-500"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div
              className={`absolute inset-0 backface-hidden transition-opacity duration-500 ${
                isFlipped ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <h2 className="text-2xl font-bold mb-4">Front</h2>
              <p className="text-lg">{currentCard.front}</p>
            </div>
            <div
              className={`absolute inset-0 backface-hidden transition-opacity duration-500 ${
                isFlipped ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <h2 className="text-2xl font-bold mb-4">Back</h2>
              <p className="text-lg">{currentCard.back}</p>
            </div>
          </div>

          {/* Review Buttons */}
          {isFlipped && (
            <div className="grid grid-cols-4 gap-4">
              <button
                onClick={() => handleReview(ReviewQuality.Again)}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
              >
                Again
              </button>
              <button
                onClick={() => handleReview(ReviewQuality.Hard)}
                className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded"
              >
                Hard
              </button>
              <button
                onClick={() => handleReview(ReviewQuality.Good)}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
              >
                Good
              </button>
              <button
                onClick={() => handleReview(ReviewQuality.Easy)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Easy
              </button>
            </div>
          )}

          {/* Card Stats */}
          {cardStats && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Card Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Difficulty</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-red-500 h-2.5 rounded-full"
                      style={{ width: `${cardStats.difficulty * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Strength</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: `${cardStats.strength * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">No more cards to review!</h2>
          <button
            onClick={() => onComplete(cards)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Complete Session
          </button>
        </div>
      )}
    </div>
  );
} 