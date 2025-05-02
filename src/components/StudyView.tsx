import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Deck, CardData } from '@/types';
import { ReviewQuality } from '@/types';
import { ArrowLeft, RefreshCw, Eye, Check, X, Undo, RotateCw, BarChart2 } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { analyticsManager } from '../lib/analytics';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { EnhancedSpacedRepetition } from '../lib/enhancedSpacedRepetition';

interface StudyViewProps {
  deck: Deck;
  onUpdateCard: (card: CardData) => void;
  onExit: () => void;
}

const StudyView: React.FC<StudyViewProps> = ({ deck, onUpdateCard, onExit }) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, total: 0 });
  const [isFlipping, setIsFlipping] = useState(false);
  const [responseTime, setResponseTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    cardsReviewed: 0,
    timeSpent: 0,
    consecutiveCorrect: 0
  });

  const spacedRepetition = new EnhancedSpacedRepetition();

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
      setResponseTime(Date.now() - startTime!);
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

  useEffect(() => {
    // Start a new study session
    const newSessionId = analyticsManager.startSession(deck.id);
    setSessionId(newSessionId);
    setStartTime(Date.now());
  }, [deck.id]);

  const handleReveal = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setIsRevealed(true);
      setTimeout(() => {
        setIsFlipping(false);
      }, 300);
    }, 300);
  };

  const handleRateCard = (quality: ReviewQuality) => {
    if (!sessionId || !startTime) return;

    const currentCard = cards[currentCardIndex];
    const responseTime = (Date.now() - startTime) / 1000; // Convert to seconds

    // Update session stats
    const isCorrect = quality >= ReviewQuality.Good;
    setSessionStats(prev => ({
      cardsReviewed: prev.cardsReviewed + 1,
      timeSpent: prev.timeSpent + responseTime,
      consecutiveCorrect: isCorrect ? prev.consecutiveCorrect + 1 : 0
    }));

    // Calculate new interval and ease using enhanced spaced repetition
    const updatedCard = spacedRepetition.calculateNextReview(
      currentCard,
      quality,
      {
        cardsReviewed: sessionStats.cardsReviewed + 1,
        timeSpent: sessionStats.timeSpent + responseTime,
        consecutiveCorrect: isCorrect ? sessionStats.consecutiveCorrect + 1 : 0
      }
    );

    // Update statistics
    if (isCorrect) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    // Save updated card
    onUpdateCard(updatedCard);

    // Record the card review
    analyticsManager.recordCardReview(
      sessionId,
      updatedCard,
      isCorrect,
      responseTime
    );

    // Move to next card
    setIsRevealed(false);
    setStartTime(Date.now());
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // End of deck
      if (sessionId) {
        analyticsManager.endSession(sessionId, {
          cardsReviewed: deck.cards.length,
          correctAnswers: deck.cards.filter(c => {
            const lastReview = c.reviewHistory?.[c.reviewHistory.length - 1];
            return lastReview && lastReview.quality >= 3;
          }).length,
          incorrectAnswers: deck.cards.filter(c => {
            const lastReview = c.reviewHistory?.[c.reviewHistory.length - 1];
            return lastReview && lastReview.quality < 3;
          }).length,
          timeSpent: (Date.now() - startTime) / 1000
        });
      }
      setIsCompleted(true);
    }
  };

  const restartSession = () => {
    setCurrentCardIndex(0);
    setIsRevealed(false);
    setIsCompleted(false);
    setStats({ correct: 0, incorrect: 0, total: cards.length });
    setSessionStats({
      cardsReviewed: 0,
      timeSpent: 0,
      consecutiveCorrect: 0
    });
    setStartTime(Date.now());
  };

  if (cards.length === 0) {
    return (
      <div className="text-center p-12 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-xl shadow-inner hover:shadow-lg transition-all duration-300">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('study.noCards')}</h2>
        <p className="mb-6 text-muted-foreground">
          {t('study.noCardsDesc')}
        </p>
        <Button
          onClick={onExit}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          <ArrowLeft className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
          {t('study.backToDeck')}
        </Button>
      </div>
    );
  }

  if (isCompleted) {
    const percentCorrect = Math.round((stats.correct / stats.total) * 100);
    const timeSpentMinutes = Math.round(sessionStats.timeSpent / 60);
    const averageResponseTime = Math.round(sessionStats.timeSpent / sessionStats.cardsReviewed);

    return (
      <div className="text-center p-12 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
        <div className="mb-8 rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 shadow-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-6">
            <h2 className="text-3xl font-bold">{t('study.sessionComplete')}</h2>
          </div>

          <div className="p-8">
            <div className="w-40 h-40 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl font-bold bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-8 border-blue-100 dark:border-blue-800 shadow-inner transform hover:scale-105 transition-all duration-300 text-blue-600 dark:text-blue-300">
              {percentCorrect}%
            </div>

            <div className="grid grid-cols-2 gap-8 text-center max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-green-100 dark:border-green-800 transform hover:scale-105 transition-all duration-300">
                <div className="text-green-500 dark:text-green-400 font-medium mb-2 text-lg">{t('study.correct')}</div>
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.correct}</div>
                <div className="text-sm text-muted-foreground mt-2">
                  {Math.round((stats.correct / stats.total) * 100)}% {t('study.ofTotal')}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-red-100 dark:border-red-800 transform hover:scale-105 transition-all duration-300">
                <div className="text-red-500 dark:text-red-400 font-medium mb-2 text-lg">{t('study.incorrect')}</div>
                <div className="text-4xl font-bold text-red-600 dark:text-red-400">{stats.incorrect}</div>
                <div className="text-sm text-muted-foreground mt-2">
                  {Math.round((stats.incorrect / stats.total) * 100)}% {t('study.ofTotal')}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-blue-100 dark:border-blue-800 transform hover:scale-105 transition-all duration-300">
                <div className="text-blue-500 dark:text-blue-400 font-medium mb-2 text-lg">{t('study.timeSpent')}</div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{timeSpentMinutes}</div>
                <div className="text-sm text-muted-foreground mt-2">
                  {t('study.minutes')}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-purple-100 dark:border-purple-800 transform hover:scale-105 transition-all duration-300">
                <div className="text-purple-500 dark:text-purple-400 font-medium mb-2 text-lg">{t('study.avgResponseTime')}</div>
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{averageResponseTime}</div>
                <div className="text-sm text-muted-foreground mt-2">
                  {t('study.seconds')}
                </div>
              </div>
            </div>

            {percentCorrect < 70 && (
              <div className="mt-8 text-sm text-muted-foreground p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg animate-pulse">
                <p>{t('study.reviewTip')}</p>
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
            <ArrowLeft className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
            {t('study.exit')}
          </Button>
          <Button
            onClick={restartSession}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <RefreshCw className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
            {t('study.studyAgain')}
          </Button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="container flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">{deck.name}</CardTitle>
              <CardDescription>
                {t('study.cardsRemaining', { count: deck.cards.length - currentCardIndex })}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <BarChart2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={onExit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAnalytics ? (
              <AnalyticsDashboard deck={deck} />
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg shadow-md">
                  <Button 
                    variant="ghost" 
                    onClick={onExit} 
                    className="hover:bg-background/60 transition-all duration-300"
                  >
                    <ArrowLeft className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    {t('study.exitSession')}
                  </Button>
                  <div className="text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1.5 rounded-full shadow-sm">
                    {t('study.cardProgress', { current: currentCardIndex + 1, total: cards.length })}
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
                  <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    <CardTitle className="text-xl font-medium text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {isRevealed ? t('study.answer') : t('study.question')}
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
                        <RotateCw className={`${isRTL ? 'ml-2' : 'mr-2'} h-5 w-5`} />
                        {t('study.revealAnswer')}
                      </Button>
                    ) : (
                      <div className="flex flex-wrap gap-3 justify-center">
                        <Button
                          variant="destructive"
                          onClick={() => handleRateCard(ReviewQuality.Again)}
                          className="min-w-28 bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          <X className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                          {t('study.again')}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleRateCard(ReviewQuality.Hard)}
                          className="min-w-28 border-orange-200 text-orange-700 hover:bg-orange-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          <Undo className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                          {t('study.hard')}
                        </Button>
                        <Button
                          variant="default"
                          onClick={() => handleRateCard(ReviewQuality.Good)}
                          className="min-w-28 bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          <Check className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                          {t('study.good')}
                        </Button>
                        <Button
                          variant="default"
                          className="min-w-28 bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          onClick={() => handleRateCard(ReviewQuality.Easy)}
                        >
                          <Check className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                          {t('study.easy')}
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>

                <div className="text-center text-sm text-muted-foreground mt-4">
                  <p>{t('study.keyboardTip')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudyView;
