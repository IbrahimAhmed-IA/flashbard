import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DeckList from '@/components/DeckList';
import StudyView from '@/components/StudyView';
import Settings from '@/components/Settings';
import type { Deck, CardData } from '@/types';
import { downloadJson, readJsonFile } from '@/lib/fileUtils';
import { Brain, Layers } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto p-4 max-w-5xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FlashLearn
                </h1>
                <p className="text-xs text-muted-foreground">Spaced repetition flashcards</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                <Layers className="mr-1 h-3.5 w-3.5" />
                {decks.length} {decks.length === 1 ? 'deck' : 'decks'} •
                {decks.reduce((total, deck) => total + deck.cards.length, 0)} cards
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
            <TabsList className="grid w-full grid-cols-2 rounded-xl p-1">
              <TabsTrigger
                value="decks"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                Flashcard Decks
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="decks">
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
            <TabsContent value="settings">
              <Settings
                onImportDeck={importDeck}
                onClearAllData={() => {
                  if (window.confirm('Are you sure you want to delete all decks and cards? This cannot be undone.')) {
                    setDecks([]);
                    setActiveDeck(null);
                    localStorage.removeItem('flashcard-decks');
                  }
                }}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>

      <footer className="py-6 mt-12 border-t bg-white">
        <div className="container mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <p>FlashLearn • A simple flashcard application with spaced repetition</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
