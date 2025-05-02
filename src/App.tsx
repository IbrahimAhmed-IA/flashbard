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
import { Brain, Layers } from 'lucide-react';
import { useTheme } from './components/ThemeProvider';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageToggle } from './components/LanguageToggle';
import { cn } from './lib/utils';

function AppContent() {
  const { t, language } = useLanguage();
  const [decks, setDecks] = useState<Deck[]>(() => {
    const savedDecks = localStorage.getItem('flashcard-decks');
    return savedDecks ? JSON.parse(savedDecks) : [];
  });
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [isStudying, setIsStudying] = useState(false);

  useEffect(() => {
    localStorage.setItem('flashcard-decks', JSON.stringify(decks));
  }, [decks]);

  const createDeck = (name: string, description: string) => {
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name,
      description,
      cards: [],
      lastStudied: null,
      created: new Date().toISOString()
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
          ease: 2.5
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
      downloadJson(deck, `${deck.name.replace(/\s+/g, '-').toLowerCase()}-export`);
    }
  };

  const importDeck = async (file: File) => {
    try {
      const importedDeck = await readJsonFile<Deck>(file);

      // Validate the imported deck
      if (!importedDeck.name || !Array.isArray(importedDeck.cards)) {
        throw new Error('Invalid deck format');
      }

      // Generate a new ID to avoid conflicts
      const newDeck: Deck = {
        ...importedDeck,
        id: crypto.randomUUID(),
        created: new Date().toISOString(),
        lastStudied: null,
        cards: importedDeck.cards.map(card => ({
          ...card,
          id: crypto.randomUUID()
        }))
      };

      setDecks(prev => [...prev, newDeck]);
      return newDeck;
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

  const { theme } = useTheme();

  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground",
      language === 'ar' && 'font-arabic'
    )}>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <div className="relative h-12 w-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <Brain className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                {t('app.name')}
              </h1>
              <p className="text-sm text-muted-foreground hidden md:block max-w-md leading-relaxed">
                {t('app.description')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-primary/10 px-6 py-2.5 text-sm font-medium text-primary shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-500" />
                <span className="font-semibold">{decks.length}</span>
                <span className="text-muted-foreground">{decks.length === 1 ? t('app.deck') : t('app.decks')}</span>
                <div className="h-4 w-px bg-border mx-2"></div>
                <span className="font-semibold">{decks.reduce((total, deck) => total + deck.cards.length, 0)}</span>
                <span className="text-muted-foreground">{t('app.cards')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                  localStorage.removeItem('flashcard-decks');
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
