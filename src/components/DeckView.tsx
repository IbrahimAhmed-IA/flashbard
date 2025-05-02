import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from './ui/card';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import type { Deck, CardData } from '../types';
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Pencil,
  Trash2
} from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { CSVUtils } from '../lib/csvUtils';

interface DeckViewProps {
  deck: Deck;
  onUpdateDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
  onAddCard: (deckId: string, front: string, back: string) => void;
  onUpdateCard: (deckId: string, card: CardData) => void;
  onDeleteCard: (deckId: string, cardId: string) => void;
  onStudyDeck: (deck: Deck) => void;
  onBack: () => void;
}

export const DeckView: React.FC<DeckViewProps> = ({
  deck,
  onUpdateDeck,
  onDeleteDeck,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onStudyDeck,
  onBack
}) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  // State for UI
  const [isEditDeckOpen, setIsEditDeckOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isEditCardOpen, setIsEditCardOpen] = useState(false);
  const [editedDeckName, setEditedDeckName] = useState(deck.name);
  const [editedDeckDescription, setEditedDeckDescription] = useState(deck.description);
  const [currentCardFront, setCurrentCardFront] = useState('');
  const [currentCardBack, setCurrentCardBack] = useState('');
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDeck, setEditedDeck] = useState<Deck>(deck);
  const [newCard, setNewCard] = useState<Partial<CardData>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

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
    const confirmMessage = t('deckview.deleteDeckConfirm').replace('{{deckName}}', deck.name);
    if (window.confirm(confirmMessage)) {
      onDeleteDeck(deck.id);
      onBack();
    }
  };

  const handleAddCard = () => {
    if (!newCard.front || !newCard.back) return;

    const card: CardData = {
      id: `${deck.id}-${deck.cards.length + 1}`,
      front: newCard.front,
      back: newCard.back,
      created: new Date().toISOString(),
      lastReviewed: null,
      lastReview: null,
      interval: 0,
      ease: 2.5,
      repetitions: 0,
      nextReview: null,
      difficulty: 0.5,
      category: newCard.category,
      tags: newCard.tags,
      media: newCard.media,
      reviewHistory: []
    };

    const updatedDeck = {
      ...deck,
      cards: [...deck.cards, card]
    };
    onUpdateDeck(updatedDeck);
    setNewCard({});
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
    if (window.confirm(t('deckview.deleteCardConfirm'))) {
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
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onStudyDeck(deck)}
            disabled={deck.cards.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <BookOpen className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
            {t('deckview.studyNow')}
          </Button>
        </div>
      </div>

      {deck.description && (
        <p className="text-muted-foreground italic">{deck.description}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setIsAddCardOpen(true)}
          variant="outline"
        >
          <Plus className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
          {t('deckview.addCard')}
        </Button>
        <Button
          onClick={() => setIsEditDeckOpen(true)}
          variant="outline"
        >
          <Pencil className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
          {t('deckview.editDeck')}
        </Button>
        <Button
          onClick={handleDeleteDeck}
          variant="destructive"
        >
          <Trash2 className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
          {t('deckview.deleteDeck')}
        </Button>
      </div>

      <Separator className="my-2" />

      <h3 className="text-xl font-semibold mt-6 flex items-center justify-between">
        <span>{t('deckview.cards')} ({localCards.length})</span>
        {localCards.length > 0 && (
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsAddCardOpen(true)}>
            <Plus className={`${isRTL ? 'ml-1' : 'mr-1'} h-3 w-3`} />
            {t('deckview.addAnother')}
          </Button>
        )}
      </h3>

      {localCards.length === 0 ? (
        <div className="text-center p-10 border-2 border-dashed rounded-xl bg-muted/30">
          <p className="text-muted-foreground mb-4">{t('deckview.noCards')}</p>
          <Button onClick={() => setIsAddCardOpen(true)} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            <Plus className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
            {t('deckview.addFirstCard')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {localCards.map((card) => (
            <Card key={card.id} className="hover:shadow-md transition-all duration-200 overflow-hidden border-2">
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b">
                <CardTitle className="text-base">{t('deckview.front')}</CardTitle>
                <CardDescription className="whitespace-pre-wrap text-foreground dark:text-foreground font-medium">
                  {card.front}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2 pt-4 bg-background border-b">
                <h4 className="text-base font-medium mb-1">{t('deckview.back')}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {card.back}
                </p>
              </CardContent>
              <CardFooter className={`flex justify-end ${isRTL ? 'space-x-reverse' : ''} space-x-2 py-2 bg-muted/30`}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEditCard(card)}
                  className="hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCard(card.id)}
                  className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300"
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
            <DialogTitle>{t('deckview.editDeckTitle')}</DialogTitle>
            <DialogDescription>
              {t('deckview.editDeckDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">{t('deckview.nameLabel')}</label>
              <Input
                id="edit-name"
                value={editedDeckName}
                onChange={(e) => setEditedDeckName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">{t('deckview.descriptionLabel')}</label>
              <Textarea
                id="edit-description"
                value={editedDeckDescription}
                onChange={(e) => setEditedDeckDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDeckOpen(false)}>{t('deckview.cancelButton')}</Button>
            <Button onClick={handleSaveDeck}>{t('deckview.saveChanges')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Card Dialog */}
      <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deckview.addCardTitle')}</DialogTitle>
            <DialogDescription>
              {t('deckview.addCardDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="card-front" className="text-sm font-medium">{t('deckview.frontLabel')}</label>
              <Textarea
                id="card-front"
                value={currentCardFront}
                onChange={(e) => setCurrentCardFront(e.target.value)}
                placeholder={t('deckview.frontPlaceholder')}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="card-back" className="text-sm font-medium">{t('deckview.backLabel')}</label>
              <Textarea
                id="card-back"
                value={currentCardBack}
                onChange={(e) => setCurrentCardBack(e.target.value)}
                placeholder={t('deckview.backPlaceholder')}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCardOpen(false)}>{t('deckview.cancelButton')}</Button>
            <Button onClick={handleAddCard}>{t('deckview.addCardButton')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Card Dialog */}
      <Dialog open={isEditCardOpen} onOpenChange={setIsEditCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deckview.editCardTitle')}</DialogTitle>
            <DialogDescription>
              {t('deckview.editCardDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-front" className="text-sm font-medium">{t('deckview.frontLabel')}</label>
              <Textarea
                id="edit-front"
                value={currentCardFront}
                onChange={(e) => setCurrentCardFront(e.target.value)}
                placeholder={t('deckview.frontPlaceholder')}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-back" className="text-sm font-medium">{t('deckview.backLabel')}</label>
              <Textarea
                id="edit-back"
                value={currentCardBack}
                onChange={(e) => setCurrentCardBack(e.target.value)}
                placeholder={t('deckview.backPlaceholder')}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCardOpen(false)}>{t('deckview.cancelButton')}</Button>
            <Button onClick={handleEditCard}>{t('deckview.saveCard')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeckView;
