import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import type { Deck, CardData } from '@/types';
import DeckView from './DeckView';
import { BookOpen, Plus, Download, Clock, Layers } from 'lucide-react';

interface DeckListProps {
  decks: Deck[];
  onCreateDeck: (name: string, description: string) => Deck;
  onUpdateDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
  onAddCard: (deckId: string, front: string, back: string) => void;
  onUpdateCard: (deckId: string, card: CardData) => void;
  onDeleteCard: (deckId: string, cardId: string) => void;
  onStudyDeck: (deck: Deck) => void;
  onExportDeck: (deckId: string) => void;
}

const DeckList: React.FC<DeckListProps> = ({
  decks,
  onCreateDeck,
  onUpdateDeck,
  onDeleteDeck,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onStudyDeck,
  onExportDeck
}) => {
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateDeck = () => {
    if (newDeckName.trim()) {
      onCreateDeck(newDeckName.trim(), newDeckDescription.trim());
      setNewDeckName('');
      setNewDeckDescription('');
      setIsCreateDialogOpen(false);
    }
  };

  const handleSelectDeck = (deck: Deck) => {
    setSelectedDeck(deck);
  };

  const handleBackToDecks = () => {
    setSelectedDeck(null);
  };

  if (selectedDeck) {
    return (
      <DeckView
        deck={selectedDeck}
        onUpdateDeck={onUpdateDeck}
        onDeleteDeck={onDeleteDeck}
        onAddCard={onAddCard}
        onUpdateCard={onUpdateCard}
        onDeleteCard={onDeleteCard}
        onStudyDeck={onStudyDeck}
        onExportDeck={onExportDeck}
        onBack={handleBackToDecks}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1">Your Flashcard Decks</h2>
          <p className="text-muted-foreground text-sm">
            Select a deck to study or create a new one
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              New Deck
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new deck</DialogTitle>
              <DialogDescription>
                Enter a name and description for your new flashcard deck.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input
                  id="name"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="e.g., Spanish Vocabulary"
                  className="border-2 focus-visible:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description (optional)</label>
                <Textarea
                  id="description"
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  placeholder="What is this deck about?"
                  rows={3}
                  className="border-2 focus-visible:ring-blue-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleCreateDeck}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Deck
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {decks.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed rounded-xl bg-gradient-to-b from-muted/50 to-muted/30 shadow-inner">
          <div className="mb-4">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground opacity-70" />
          </div>
          <h3 className="text-xl font-medium mb-3">No decks yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first flashcard deck to start learning. Add questions on the front and answers on the back.
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Your First Deck
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <Card
              key={deck.id}
              className="hover:shadow-lg transition-all duration-200 border-2 overflow-hidden"
            >
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="truncate text-blue-800">{deck.name}</CardTitle>
                <CardDescription className="truncate">{deck.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-muted-foreground">
                      <Layers className="h-4 w-4 mr-1.5" />
                      <span>Cards</span>
                    </div>
                    <span className="font-medium text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">
                      {deck.cards.length}
                    </span>
                  </div>
                  {deck.lastStudied && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1.5" />
                        <span>Last studied</span>
                      </div>
                      <span className="font-medium text-green-800 bg-green-50 px-2 py-0.5 rounded-md">
                        {new Date(deck.lastStudied).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <Separator />
              <CardFooter className="pt-4 pb-4 gap-2 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1 border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                  onClick={() => handleSelectDeck(deck)}
                >
                  View Cards
                </Button>
                <Button
                  variant="default"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  onClick={() => onStudyDeck(deck)}
                  disabled={deck.cards.length === 0}
                >
                  {deck.cards.length === 0 ? 'Add Cards First' : 'Study Now'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onExportDeck(deck.id)}
                  title="Export Deck"
                  className="border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeckList;
