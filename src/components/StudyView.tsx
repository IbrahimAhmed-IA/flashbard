import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Deck, CardData } from '@/types';
import { ReviewQuality } from '@/types';
import { calculateNextInterval } from '@/lib/fileUtils';
import { ArrowLeft, RefreshCw, Eye, Check, X, Undo, RotateCw } from 'lucide-react';

interface StudyViewProps {
  deck: Deck;
  onUpdateCard: (card: CardData) => void;
  onExit: () => void;
}

const StudyView: React.FC<StudyViewProps> = ({ deck, onUpdateCard, onExit }) => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, total: 0 });
  const [isFlipping, setIsFlipping] = useState(false);
  const [responseTime, setResponseTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isCompleted) return;

      if (e.code === 'Space' && !isRevealed) {
        e.preventDefault();
        handleReveal();
      } else if (isRevealed) {
        switch (e.code) {
          case 'Digit1':
            handleRateCard(ReviewQuality.Again);
            break;
          case 'Digit2':
            handleRateCard(ReviewQuality.Hard);
            break;
          case 'Digit3':
            handleRateCard(ReviewQuality.Good);
            break;
          case 'Digit4':
            handleRateCard(ReviewQuality.Easy);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRevealed, isCompleted]);

  // Track response time
  useEffect(() => {
    if (isRevealed) {
      setResponseTime(Date.now() - startTime);
    }
  }, [isRevealed, startTime]);

  // Prepare cards for study
  useEffect(() => {
    if (deck.cards.length > 0) {
      // Sort cards by those that need to be reviewed first
      const now = new Date();
      const sortedCards = [...deck.cards].sort((a, b) => {
        // Cards that have never been reviewed come first
        if (!a.lastReviewed && !b.lastReviewed) return 0;
        if (!a.lastReviewed) return -1;
        if (!b.lastReviewed) return 1;

        // Then cards that are due for review (based on interval)
        const aReviewDate = new Date(a.lastReviewed);
        aReviewDate.setDate(aReviewDate.getDate() + a.interval);

        const bReviewDate = new Date(b.lastReviewed);
        bReviewDate.setDate(bReviewDate.getDate() + b.interval);

        // Sort by review date (earlier dates first)
        return aReviewDate.getTime() - bReviewDate.getTime();
      });

      setCards(sortedCards);
      setStats({ correct: 0, incorrect: 0, total: deck.cards.length });
    }
  }, [deck.cards]);

  const handleReveal = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setIsRevealed(true);
      setIsFlipping(false);
    }, 400);
  };

  const handleRateCard = (quality: ReviewQuality) => {
    const currentCard = cards[currentCardIndex];
    const timeSpent = Date.now() - startTime;

    // Calculate new interval and ease using spaced repetition algorithm
    const { interval, ease } = calculateNextInterval(
      currentCard.interval,
      currentCard.ease,
      quality
    );

    // Update card with new values
    const updatedCard: CardData = {
      ...currentCard,
      lastReviewed: new Date().toISOString(),
      interval,
      ease,
      reviewHistory: [
        ...(currentCard.reviewHistory || []),
        {
          date: new Date().toISOString(),
          quality,
        }
      ]
    };

    // Update statistics
    if (quality >= ReviewQuality.Good) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    // Save updated card
    onUpdateCard(updatedCard);

    // Add flipping animation when moving to the next card
    setIsFlipping(true);

    // Move to next card or end session
    setTimeout(() => {
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
        setIsRevealed(false);
        setIsFlipping(false);
        setStartTime(Date.now());
      } else {
        setIsCompleted(true);
        setIsFlipping(false);
      }
    }, 400);
  };

  const restartSession = () => {
    setCurrentCardIndex(0);
    setIsRevealed(false);
    setIsCompleted(false);
    setStats({ correct: 0, incorrect: 0, total: cards.length });
  };

  if (cards.length === 0) {
    return (
      <div className="text-center p-12 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-xl shadow-inner hover:shadow-lg transition-all duration-300">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">No Cards to Study</h2>
        <p className="mb-6 text-muted-foreground">
          This deck doesn't have any cards yet. Add some cards first.
        </p>
        <Button
          onClick={onExit}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Deck
        </Button>
      </div>
    );
  }

  if (isCompleted) {
    const percentCorrect = Math.round((stats.correct / stats.total) * 100);

    return (
      <div className="text-center p-12 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
        <div className="mb-8 rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 shadow-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-6">
            <h2 className="text-3xl font-bold">Session Complete!</h2>
          </div>

          <div className="p-8">
            <div className="w-40 h-40 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl font-bold bg-gradient-to-br from-white to-blue-50 border-8 border-blue-100 shadow-inner transform hover:scale-105 transition-all duration-300">
              {percentCorrect}%
            </div>

            <div className="grid grid-cols-2 gap-8 text-center max-w-sm mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-md border border-green-100 transform hover:scale-105 transition-all duration-300">
                <div className="text-green-500 font-medium mb-2 text-lg">Correct</div>
                <div className="text-4xl font-bold text-green-600">{stats.correct}</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border border-red-100 transform hover:scale-105 transition-all duration-300">
                <div className="text-red-500 font-medium mb-2 text-lg">Incorrect</div>
                <div className="text-4xl font-bold text-red-600">{stats.incorrect}</div>
              </div>
            </div>

            {percentCorrect < 70 && (
              <div className="mt-8 text-sm text-muted-foreground p-4 bg-amber-50 border border-amber-200 rounded-lg animate-pulse">
                <p>Consider reviewing this deck again to improve your recall.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-4 justify-center mt-8">
          <Button 
            onClick={onExit} 
            variant="outline" 
            className="border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:hover:bg-blue-900/20 transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Exit
          </Button>
          <Button
            onClick={restartSession}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Study Again
          </Button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg shadow-md">
        <Button 
          variant="ghost" 
          onClick={onExit} 
          className="hover:bg-background/60 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Exit Study Session
        </Button>
        <div className="text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1.5 rounded-full shadow-sm">
          Card {currentCardIndex + 1} of {cards.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-3 shadow-inner overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 h-3 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card className={`w-full shadow-xl border-2 ${isFlipping ? 'animate-flip' : ''} perspective transform hover:scale-[1.02] transition-all duration-300`}>
        <CardHeader className={`py-6 ${isRevealed ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gradient-to-r from-purple-50 to-indigo-50'} dark:from-blue-900/20 dark:to-indigo-900/20`}>
          <CardTitle className="text-xl font-medium text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isRevealed ? 'Answer' : 'Question'}
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[300px] flex items-center justify-center p-8 bg-white dark:bg-gray-900">
          <div className="text-2xl whitespace-pre-wrap text-center leading-relaxed">
            {isRevealed ? currentCard.back : currentCard.front}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center p-6 border-t bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          {!isRevealed ? (
            <Button
              onClick={handleReveal}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              size="lg"
            >
              <RotateCw className="mr-2 h-5 w-5" />
              Reveal Answer
            </Button>
          ) : (
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant="destructive"
                onClick={() => handleRateCard(ReviewQuality.Again)}
                className="min-w-28 bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <X className="mr-2 h-4 w-4" />
                Again
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRateCard(ReviewQuality.Hard)}
                className="min-w-28 border-orange-200 text-orange-700 hover:bg-orange-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Undo className="mr-2 h-4 w-4" />
                Hard
              </Button>
              <Button
                variant="default"
                onClick={() => handleRateCard(ReviewQuality.Good)}
                className="min-w-28 bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Check className="mr-2 h-4 w-4" />
                Good
              </Button>
              <Button
                variant="default"
                className="min-w-28 bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                onClick={() => handleRateCard(ReviewQuality.Easy)}
              >
                <Check className="mr-2 h-4 w-4" />
                Easy
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      <div className="text-center text-sm text-muted-foreground mt-4">
        <p>
          Tip: Use keyboard shortcuts: <span className="font-medium">Space</span> to reveal, <span className="font-medium">1-4</span> to rate cards
        </p>
      </div>
    </div>
  );
};

export default StudyView;
