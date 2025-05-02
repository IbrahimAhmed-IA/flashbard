import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Import, Trash2, HelpCircle } from 'lucide-react';
import type { Deck } from '@/types';

interface SettingsProps {
  onImportDeck: (file: File) => Promise<Deck>;
  onClearAllData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onImportDeck, onClearAllData }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/json') {
      setImportError('Only JSON files are supported');
      setImportSuccess(null);
      return;
    }

    try {
      setIsImporting(true);
      setImportError(null);
      setImportSuccess(null);

      const importedDeck = await onImportDeck(file);
      setImportSuccess(`Successfully imported "${importedDeck.name}" with ${importedDeck.cards.length} cards`);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setImportError('Failed to import deck. Please check the file format and try again.');
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>

      <Card className="overflow-hidden border-2 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-blue-700">Import & Export</CardTitle>
          <CardDescription>
            Import decks from JSON files or export your decks to share with others
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-base font-medium mb-2 text-blue-800">Import Deck</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Import a deck from a JSON file. The file should contain a valid deck structure.
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".json"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <Button
                onClick={handleImportClick}
                variant="outline"
                disabled={isImporting}
                className="border-blue-300 hover:bg-blue-50"
              >
                <Import className="mr-2 h-4 w-4 text-blue-600" />
                {isImporting ? 'Importing...' : 'Import Deck'}
              </Button>
            </div>

            {importError && (
              <p className="mt-2 text-sm text-red-500">{importError}</p>
            )}

            {importSuccess && (
              <p className="mt-2 text-sm text-green-600">{importSuccess}</p>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-base font-medium mb-2 text-blue-800">Export Deck</h3>
            <p className="text-sm text-muted-foreground">
              You can export individual decks from the Decks tab by selecting a deck and clicking the Export button.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-2 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
          <CardTitle className="text-red-700">Data Management</CardTitle>
          <CardDescription>
            Manage your application data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-base font-medium mb-2 text-red-800">Clear All Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Delete all decks and cards. This action cannot be undone.
            </p>
            <Button
              variant="destructive"
              onClick={onClearAllData}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Data
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
            <h3 className="text-base font-medium mb-2 text-blue-800">About FlashLearn</h3>
            <p className="text-sm text-muted-foreground">
              FlashLearn is a simple flashcard application that helps you study and memorize information effectively
              using spaced repetition. All data is stored locally in your browser.
            </p>

            <div className="mt-4 p-4 bg-white rounded-md flex items-start space-x-3 border shadow-sm">
              <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1 text-blue-800">How it works</p>
                <p className="text-muted-foreground">
                  When studying, rate your recall from "Again" (didn't remember) to "Easy" (perfectly recalled).
                  The application will use spaced repetition to optimize when you should review each card again.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
