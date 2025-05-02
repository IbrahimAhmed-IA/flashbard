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
import { BookOpen, Plus, Clock, Layers, BarChart2 } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { AnalyticsDashboard } from './AnalyticsDashboard';

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
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedDeckForAnalytics, setSelectedDeckForAnalytics] = useState<Deck | null>(null);

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

  const handleShowAnalytics = (deck: Deck) => {
    setSelectedDeckForAnalytics(deck);
    setShowAnalytics(true);
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
            <div className="space-y-4">
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
        <div className="text-center p-12 border-2 border-dashed rounded-xl bg-gradient-to-b from-muted/50 to-muted/30 shadow-inner hover:shadow-lg transition-all duration-300">
          <div className="mb-4">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground opacity-70 animate-bounce" />
          </div>
          <h3 className="text-xl font-medium mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('decklist.noDecks')}</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {t('decklist.createFirstPrompt')}
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
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
              className="group hover:shadow-xl transition-all duration-300 border-2 overflow-hidden bg-gradient-to-b from-background to-background/80 hover:border-blue-500/50 dark:hover:border-blue-400/50"
            >
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-b">
                <CardTitle className="truncate text-blue-800 dark:text-blue-300 group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors duration-300">{deck.name}</CardTitle>
                <CardDescription className="truncate text-blue-600/70 dark:text-blue-400/70">{deck.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Layers className="h-4 w-4" />
                    <span>{deck.cards.length} {t('deck.cards')}</span>
                  </div>
                  {deck.lastStudied && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(deck.lastStudied).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-4 pb-4 gap-2 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1 border-blue-200 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:hover:bg-blue-900/20 transition-all duration-300"
                  onClick={() => handleSelectDeck(deck)}
                >
                  {t('deck.cards')}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-purple-200 hover:bg-purple-50 hover:text-purple-800 dark:border-purple-800 dark:hover:bg-purple-900/20 transition-all duration-300"
                  onClick={() => handleShowAnalytics(deck)}
                >
                  <BarChart2 className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                  {t('analytics.title')}
                </Button>
                <Button
                  variant="default"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  onClick={() => onStudyDeck(deck)}
                  disabled={deck.cards.length === 0}
                >
                  {deck.cards.length === 0 ? t('deck.addCard') : t('deck.study')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('analytics.title')}</DialogTitle>
            <DialogDescription>
              {selectedDeckForAnalytics?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedDeckForAnalytics && (
            <AnalyticsDashboard deck={selectedDeckForAnalytics} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeckList;
