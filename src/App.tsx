import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import DeckList from './components/DeckList';
import StudyView from './components/StudyView';
import Settings from './components/Settings';
import About from './components/About';
import type { Deck, CardData } from './types';
import { downloadJson, readJsonFile } from './lib/fileUtils';
import { Brain, Layers } from 'lucide-react';
import { useTheme } from './components/ThemeProvider';
import { useLanguage } from './components/LanguageProvider';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageToggle } from './components/LanguageToggle';

function App() {
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
  const { t, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <header className="border-b border-primary/10 bg-background shadow-md">
        <div className="container mx-auto p-4 max-w-5xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`${isRTL ? 'ml-3' : 'mr-3'} h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300`}>
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t('app.name')}
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">{t('app.description')}</p>
              </div>
            </div>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
              <ThemeToggle />
              <LanguageToggle />
              <div className="flex items-center rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-xs font-medium text-primary shadow-sm">
                <Layers className={`${isRTL ? 'ml-1' : 'mr-1'} h-3.5 w-3.5`} />
                <span>{decks.length} {decks.length === 1 ? t('app.deck') : t('app.decks')} • </span>
                <span>{decks.reduce((total, deck) => total + deck.cards.length, 0)} {t('app.cards')}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-5xl pt-8">
        {isStudying && activeDeck ? (
          <StudyView
            deck={activeDeck}
            onUpdateCard={(card) => updateCard(activeDeck.id, card)}
            onExit={endStudySession}
          />
        ) : (
          <Tabs defaultValue="decks" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 rounded-xl p-1 backdrop-blur-sm bg-primary/5 border">
              <TabsTrigger
                value="decks"
                className="rounded-lg text-sm md:text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                {t('tabs.decks')}
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-lg text-sm md:text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                {t('tabs.settings')}
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="rounded-lg text-sm md:text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                {t('tabs.about')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="decks" className="animate-in fade-in-50 duration-300">
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
            </TabsContent>
            <TabsContent value="settings" className="animate-in fade-in-50 duration-300">
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
            <TabsContent value="about" className="animate-in fade-in-50 duration-300">
              <About />
            </TabsContent>
          </Tabs>
        )}
      </main>

      <footer className="py-8 mt-12 border-t border-primary/10 bg-background">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md transform hover:scale-105 transition-transform duration-300">
              <Brain className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t('footer.text')}</p>
          <div className={`mt-2 flex justify-center ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
