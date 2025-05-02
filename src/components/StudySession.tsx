import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useLanguage } from './LanguageProvider';
import { Deck, CardData } from '../types';
import { superMemo2, leitner, getDueCards, sortCardsByPriority, getStudyStats } from '../lib/spacedRepetition';
import { cn } from '../lib/utils';

interface StudySessionProps {
  deck: Deck;
  onUpdateCard: (card: CardData) => void;
  onComplete: () => void;
}

export default function StudySession({ deck, onUpdateCard, onComplete }: StudySessionProps) {
  const { t } = useLanguage();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyCards, setStudyCards] = useState<CardData[]>([]);
  const [stats, setStats] = useState(getStudyStats(studyCards as any));

  useEffect(() => {
    // Get cards due for review and sort by priority
    const dueCards = getDueCards(deck.cards as any);
    const sortedCards = sortCardsByPriority(dueCards);
    setStudyCards(sortedCards as any);
    setStats(getStudyStats(sortedCards));
  }, [deck.cards]);

  const currentCard = studyCards[currentCardIndex];

  const handleRating = (rating: number) => {
    if (!currentCard) return;

    const algorithm = deck.algorithm === 'superMemo2' ? superMemo2 : leitner;
    const updatedCard = algorithm.calculateNextReview(currentCard as any, rating);
    
    onUpdateCard(updatedCard as any);
    setShowAnswer(false);

    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <h2 className="text-2xl font-bold">{t('study.noCardsDue')}</h2>
        <Button onClick={onComplete}>{t('study.finish')}</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <Progress value={(currentCardIndex / studyCards.length) * 100} />
        <div className="mt-2 flex justify-between text-sm text-muted-foreground">
          <span>{t('study.progress', { current: currentCardIndex + 1, total: studyCards.length })}</span>
          <span>{t('study.dueCards', { count: stats.dueCards })}</span>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="text-lg font-medium">{t('study.front')}</div>
          <div className="text-2xl">{currentCard.front}</div>

          {showAnswer && (
            <>
              <div className="border-t pt-4">
                <div className="text-lg font-medium">{t('study.back')}</div>
                <div className="text-2xl">{currentCard.back}</div>
              </div>

              <div className="flex justify-between gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleRating(0)}
                >
                  {t('study.again')}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleRating(2)}
                >
                  {t('study.hard')}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleRating(3)}
                >
                  {t('study.good')}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleRating(5)}
                >
                  {t('study.easy')}
                </Button>
              </div>
            </>
          )}

          {!showAnswer && (
            <Button
              className="w-full"
              onClick={() => setShowAnswer(true)}
            >
              {t('study.showAnswer')}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
} 