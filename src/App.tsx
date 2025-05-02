import { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { LanguageProvider, useLanguage } from './components/LanguageProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import DeckList from './components/DeckList';
import StudyView from './components/StudyView';
import Settings from './components/Settings';
import About from './components/About';
import type { Deck, CardData } from './types';
import { downloadJson, readJsonFile } from './lib/fileUtils';
import { Brain, Layers, Settings as SettingsIcon, Info, HelpCircle } from 'lucide-react';
import { useTheme } from './components/ThemeProvider';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageToggle } from './components/LanguageToggle';
import { cn } from './lib/utils';
import Tutorial from './components/Tutorial';
import { Button } from './components/ui/button';
import { CSVUtils } from './lib/csvUtils';

function AppContent() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [decks, setDecks] = useState<Deck[]>(() => {
    const saved = localStorage.getItem('flashyard-decks');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [isStudying, setIsStudying] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => {
    return localStorage.getItem('tutorial-completed') !== 'true';
  });

  useEffect(() => {
    localStorage.setItem('flashyard-decks', JSON.stringify(decks));
  }, [decks]);

  const createDeck = (name: string, description: string) => {
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name,
      description,
      cards: [],
      lastStudied: null,
      created: new Date().toISOString(),
      algorithm: 'superMemo2',
      settings: {
        newCardsPerDay: 20,
        reviewCardsPerDay: 50,
        maxInterval: 365,
        minEase: 1.3
      }
    };
    setDecks(prev => [...prev, newDeck]);
    return newDeck;
  };

  const updateDeck = (updatedDeck: Deck) => {
    setDecks(prev => prev.map(deck =>
      deck.id === updatedDeck.id ? updatedDeck : deck
    ));
    if (activeDeck?.id === updatedDeck.id) {
      setActiveDeck(updatedDeck);
    }
  };

  const deleteDeck = (deckId: string) => {
    setDecks(prev => prev.filter(deck => deck.id !== deckId));
    if (activeDeck?.id === deckId) {
      setActiveDeck(null);
      setIsStudying(false);
    }
  };

  const addCard = (deckId: string, front: string, back: string) => {
    setDecks(prev => prev.map(deck => {
      if (deck.id === deckId) {
        const newCard: CardData = {
          id: crypto.randomUUID(),
          front,
          back,
          created: new Date().toISOString(),
          lastReviewed: null,
          interval: 0,
          ease: 2.5,
          repetitions: 0,
          nextReview: null,
          difficulty: 0,
          lastReview: null
        };
        return {
          ...deck,
          cards: [...deck.cards, newCard]
        };
      }
      return deck;
    }));
  };

  const updateCard = (deckId: string, updatedCard: CardData) => {
    setDecks(prev => prev.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: deck.cards.map(card =>
            card.id === updatedCard.id ? updatedCard : card
          )
        };
      }
      return deck;
    }));
  };

  const deleteCard = (deckId: string, cardId: string) => {
    setDecks(prev => prev.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: deck.cards.filter(card => card.id !== cardId)
        };
      }
      return deck;
    }));
  };

  const exportDeck = (deckId: string) => {
    const deck = decks.find(d => d.id === deckId);
    if (deck) {
      downloadJson(deck, `flashyard-${deck.name.replace(/\s+/g, '-').toLowerCase()}-export`);
    }
  };

  const importDeck = async (file: File) => {
    try {
      let importedDeck: Deck;

      if (file.name.endsWith('.csv')) {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        });

        const cards = CSVUtils.importFromCSV(content, crypto.randomUUID());
        importedDeck = {
          id: crypto.randomUUID(),
          name: file.name.replace('.csv', ''),
          description: 'Imported from CSV',
          cards,
          created: new Date().toISOString(),
          lastStudied: null,
          algorithm: 'superMemo2',
          settings: {
            newCardsPerDay: 20,
            reviewCardsPerDay: 50,
            maxInterval: 365,
            minEase: 1.3
          },
          studyStats: {
            totalReviews: 0,
            averageScore: 0,
            lastWeekReviews: 0,
            streak: 0
          }
        };
      } else {
        importedDeck = await readJsonFile<Deck>(file);

        // Validate the imported deck
        if (!importedDeck.name || !Array.isArray(importedDeck.cards)) {
          throw new Error('Invalid deck format');
        }

        // Generate a new ID to avoid conflicts
        importedDeck = {
          ...importedDeck,
          id: crypto.randomUUID(),
          created: new Date().toISOString(),
          lastStudied: null,
          algorithm: 'superMemo2',
          settings: {
            newCardsPerDay: 20,
            reviewCardsPerDay: 50,
            maxInterval: 365,
            minEase: 1.3
          },
          cards: importedDeck.cards.map(card => ({
            ...card,
            id: crypto.randomUUID(),
            repetitions: card.repetitions || 0,
            nextReview: card.nextReview || null,
            difficulty: card.difficulty || 0,
            lastReview: card.lastReview || null,
            reviewHistory: card.reviewHistory || []
          }))
        };
      }

      setDecks(prev => [...prev, importedDeck]);
      return importedDeck;
    } catch (error) {
      console.error('Failed to import deck:', error);
      throw error;
    }
  };

  const startStudySession = (deck: Deck) => {
    setActiveDeck(deck);
    setIsStudying(true);
  };

  const endStudySession = () => {
    setIsStudying(false);
    // Update the lastStudied timestamp
    if (activeDeck) {
      const updatedDeck = {
        ...activeDeck,
        lastStudied: new Date().toISOString()
      };
      updateDeck(updatedDeck);
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground",
      language === 'ar' ? 'font-arabic' : 'font-sans'
    )}>
      {showTutorial && <Tutorial />}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="relative h-12 w-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 p-1 shadow-lg">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 animate-pulse"></div>
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                  FlashYard
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('app.description')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 blur transition duration-300" />
                <div className="relative rounded-lg border-2 border-primary/20 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    <div className="text-sm font-medium">
                      {decks.length} {t('decks.title')}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {decks.reduce((total, deck) => total + deck.cards.length, 0)} {t('cards.title')}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTutorial(true)}
                className="relative group"
              >
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 blur transition duration-300" />
                <div className="relative rounded-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <HelpCircle className="h-5 w-5 text-primary" />
                </div>
              </Button>
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="decks" className="w-full">
          <TabsList className="w-full justify-start border-b bg-transparent p-0">
            <TabsTrigger
              value="decks"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {t('tabs.decks')}
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {t('tabs.settings')}
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {t('tabs.about')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="decks" className="mt-6">
            {isStudying ? (
              <StudyView
                deck={activeDeck!}
                onUpdateCard={(card) => updateCard(activeDeck!.id, card)}
                onExit={endStudySession}
              />
            ) : (
              <DeckList
                decks={decks}
                onCreateDeck={createDeck}
                onUpdateDeck={updateDeck}
                onDeleteDeck={deleteDeck}
                onAddCard={addCard}
                onUpdateCard={updateCard}
                onDeleteCard={deleteCard}
                onStudyDeck={startStudySession}
                onExportDeck={exportDeck}
              />
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Settings
              onImportDeck={importDeck}
              onClearAllData={() => {
                if (window.confirm(t('settings.confirmClearData'))) {
                  setDecks([]);
                  setActiveDeck(null);
                  localStorage.removeItem('flashyard-decks');
                }
              }}
            />
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <About />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {t('footer.text')}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
