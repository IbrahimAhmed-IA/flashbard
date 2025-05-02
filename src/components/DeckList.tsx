import { useState } from 'react';
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
import DeckView from './DeckView';
import { BookOpen, Plus, Download, Clock, Layers } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

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
  const { t, isRTL } = useLanguage();
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
          <h2 className="text-2xl font-bold mb-1">{t('decklist.title')}</h2>
          <p className="text-muted-foreground text-sm">
            {t('decklist.subtitle')}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md">
              <Plus className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
              {t('decklist.newDeck')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('deck.create')}</DialogTitle>
              <DialogDescription>
                {t('decklist.enterDetails')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">{t('decklist.nameField')}</label>
                <Input
                  id="name"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder={t('decklist.namePlaceholder')}
                  className="border-2 focus-visible:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">{t('decklist.descriptionField')}</label>
                <Textarea
                  id="description"
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  placeholder={t('decklist.descriptionPlaceholder')}
                  rows={3}
                  className="border-2 focus-visible:ring-blue-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>{t('decklist.cancelButton')}</Button>
              <Button
                onClick={handleCreateDeck}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {t('decklist.createButton')}
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
          <h3 className="text-xl font-medium mb-3">{t('decklist.noDecks')}</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {t('decklist.createFirstPrompt')}
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md"
            size="lg"
          >
            <Plus className={`${isRTL ? 'ml-2' : 'mr-2'} h-5 w-5`} />
            {t('decklist.createFirstButton')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <Card
              key={deck.id}
              className="hover:shadow-lg transition-all duration-200 border-2 overflow-hidden card-hover"
            >
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b">
                <CardTitle className="truncate text-blue-800 dark:text-blue-300">{deck.name}</CardTitle>
                <CardDescription className="truncate">{deck.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-muted-foreground">
                      <Layers className={`h-4 w-4 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                      <span>{t('deck.cards')}</span>
                    </div>
                    <span className="font-medium text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                      {deck.cards.length}
                    </span>
                  </div>
                  {deck.lastStudied && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className={`h-4 w-4 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                        <span>{t('deck.lastStudied')}</span>
                      </div>
                      <span className="font-medium text-green-800 dark:text-green-300 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-md">
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
                  className="flex-1 border-blue-200 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:hover:bg-blue-900/20"
                  onClick={() => handleSelectDeck(deck)}
                >
                  {t('deck.cards')}
                </Button>
                <Button
                  variant="default"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  onClick={() => onStudyDeck(deck)}
                  disabled={deck.cards.length === 0}
                >
                  {deck.cards.length === 0 ? t('deck.addCard') : t('deck.study')}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onExportDeck(deck.id)}
                  title={t('deck.export')}
                  className="border-blue-200 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:hover:bg-blue-900/20"
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
