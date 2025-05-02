import { useState, useEffect } from 'react';
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
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Pencil,
  Trash2,
  Download
} from 'lucide-react';

interface DeckViewProps {
  deck: Deck;
  onUpdateDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
  onAddCard: (deckId: string, front: string, back: string) => void;
  onUpdateCard: (deckId: string, card: CardData) => void;
  onDeleteCard: (deckId: string, cardId: string) => void;
  onStudyDeck: (deck: Deck) => void;
  onExportDeck: (deckId: string) => void;
  onBack: () => void;
}

const DeckView: React.FC<DeckViewProps> = ({
  deck,
  onUpdateDeck,
  onDeleteDeck,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onStudyDeck,
  onExportDeck,
  onBack
}) => {
  // State for UI
  const [isEditDeckOpen, setIsEditDeckOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isEditCardOpen, setIsEditCardOpen] = useState(false);
  const [editedDeckName, setEditedDeckName] = useState(deck.name);
  const [editedDeckDescription, setEditedDeckDescription] = useState(deck.description);
  const [currentCardFront, setCurrentCardFront] = useState('');
  const [currentCardBack, setCurrentCardBack] = useState('');
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  // Local state to track cards for immediate UI updates
  const [localCards, setLocalCards] = useState<CardData[]>(deck.cards);

  // Update local cards when deck prop changes
  useEffect(() => {
    setLocalCards(deck.cards);
  }, [deck.cards]);

  const handleSaveDeck = () => {
    if (editedDeckName.trim()) {
      onUpdateDeck({
        ...deck,
        name: editedDeckName.trim(),
        description: editedDeckDescription.trim()
      });
      setIsEditDeckOpen(false);
    }
  };

  const handleDeleteDeck = () => {
    if (window.confirm(`Are you sure you want to delete "${deck.name}" and all its cards?`)) {
      onDeleteDeck(deck.id);
      onBack();
    }
  };

  const handleAddCard = () => {
    if (currentCardFront.trim() && currentCardBack.trim()) {
      // Create a temporary new card with a temporary ID for immediate UI update
      const tempCard: CardData = {
        id: `temp-${Date.now()}`,
        front: currentCardFront.trim(),
        back: currentCardBack.trim(),
        created: new Date().toISOString(),
        lastReviewed: null,
        interval: 0,
        ease: 2.5
      };

      // Update local cards immediately for UI
      setLocalCards(prevCards => [...prevCards, tempCard]);

      // Call the actual add function
      onAddCard(deck.id, currentCardFront.trim(), currentCardBack.trim());

      // Reset form
      setCurrentCardFront('');
      setCurrentCardBack('');
      setIsAddCardOpen(false);
    }
  };

  const handleEditCard = () => {
    if (selectedCard && currentCardFront.trim() && currentCardBack.trim()) {
      const updatedCard = {
        ...selectedCard,
        front: currentCardFront.trim(),
        back: currentCardBack.trim()
      };

      // Update local cards immediately
      setLocalCards(prevCards =>
        prevCards.map(card => card.id === selectedCard.id ? updatedCard : card)
      );

      // Call the actual update function
      onUpdateCard(deck.id, updatedCard);

      // Reset form
      setSelectedCard(null);
      setCurrentCardFront('');
      setCurrentCardBack('');
      setIsEditCardOpen(false);
    }
  };

  const handleOpenEditCard = (card: CardData) => {
    setSelectedCard(card);
    setCurrentCardFront(card.front);
    setCurrentCardBack(card.back);
    setIsEditCardOpen(true);
  };

  const handleDeleteCard = (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      // Update local cards immediately
      setLocalCards(prevCards => prevCards.filter(card => card.id !== cardId));

      // Call the actual delete function
      onDeleteCard(deck.id, cardId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-muted p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="hover:bg-background/60"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">{deck.name}</h2>
        </div>
        <Button
          onClick={() => onStudyDeck(deck)}
          disabled={deck.cards.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Study Now
        </Button>
      </div>

      {deck.description && (
        <p className="text-muted-foreground italic">{deck.description}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setIsAddCardOpen(true)}
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Card
        </Button>
        <Button
          onClick={() => setIsEditDeckOpen(true)}
          variant="outline"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Deck
        </Button>
        <Button
          onClick={() => onExportDeck(deck.id)}
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button
          onClick={handleDeleteDeck}
          variant="destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Deck
        </Button>
      </div>

      <Separator className="my-2" />

      <h3 className="text-xl font-semibold mt-6 flex items-center justify-between">
        <span>Cards ({localCards.length})</span>
        {localCards.length > 0 && (
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsAddCardOpen(true)}>
            <Plus className="mr-1 h-3 w-3" />
            Add Another
          </Button>
        )}
      </h3>

      {localCards.length === 0 ? (
        <div className="text-center p-10 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground mb-4">This deck has no cards yet</p>
          <Button onClick={() => setIsAddCardOpen(true)} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Card
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {localCards.map((card) => (
            <Card key={card.id} className="hover:shadow-md transition-all duration-200 overflow-hidden">
              <CardHeader className="pb-2 bg-muted/50">
                <CardTitle className="text-base">Front</CardTitle>
                <CardDescription className="whitespace-pre-wrap text-black font-medium">
                  {card.front}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2 pt-4 bg-white">
                <h4 className="text-base font-medium mb-1">Back</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {card.back}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 py-2 bg-muted/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEditCard(card)}
                  className="hover:bg-blue-100 hover:text-blue-700"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCard(card.id)}
                  className="hover:bg-red-100 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Deck Dialog */}
      <Dialog open={isEditDeckOpen} onOpenChange={setIsEditDeckOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Deck</DialogTitle>
            <DialogDescription>
              Update the name and description of your deck.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
              <Input
                id="edit-name"
                value={editedDeckName}
                onChange={(e) => setEditedDeckName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
              <Textarea
                id="edit-description"
                value={editedDeckDescription}
                onChange={(e) => setEditedDeckDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDeckOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDeck}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Card Dialog */}
      <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Card</DialogTitle>
            <DialogDescription>
              Create a new flashcard with front and back content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="card-front" className="text-sm font-medium">Front</label>
              <Textarea
                id="card-front"
                value={currentCardFront}
                onChange={(e) => setCurrentCardFront(e.target.value)}
                placeholder="Question or term"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="card-back" className="text-sm font-medium">Back</label>
              <Textarea
                id="card-back"
                value={currentCardBack}
                onChange={(e) => setCurrentCardBack(e.target.value)}
                placeholder="Answer or definition"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCardOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCard}>Add Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Card Dialog */}
      <Dialog open={isEditCardOpen} onOpenChange={setIsEditCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Update the content of this flashcard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-card-front" className="text-sm font-medium">Front</label>
              <Textarea
                id="edit-card-front"
                value={currentCardFront}
                onChange={(e) => setCurrentCardFront(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-card-back" className="text-sm font-medium">Back</label>
              <Textarea
                id="edit-card-back"
                value={currentCardBack}
                onChange={(e) => setCurrentCardBack(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCardOpen(false)}>Cancel</Button>
            <Button onClick={handleEditCard}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeckView;
