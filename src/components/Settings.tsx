import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Import, Trash2, HelpCircle, Sun, Moon, Monitor, Globe } from 'lucide-react';
import type { Deck } from '../types';
import { useTheme } from './ThemeProvider';
import { useLanguage } from './LanguageProvider';

interface SettingsProps {
  onImportDeck: (file: File) => Promise<Deck>;
  onClearAllData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onImportDeck, onClearAllData }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t, isRTL } = useLanguage();

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
      <h2 className="text-2xl font-bold mb-4">{t('settings.title')}</h2>

      {/* Theme Settings */}
      <Card className="overflow-hidden border-2 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-b">
          <CardTitle className="text-violet-700 dark:text-violet-300">{t('settings.theme')}</CardTitle>
          <CardDescription>
            {t('settings.themeDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="bg-background rounded-lg border shadow-sm p-4">
            <h3 className="text-base font-medium mb-4 text-violet-800 dark:text-violet-300">{t('settings.theme')}</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className={`${theme === 'light' ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
              >
                <Sun className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                {t('settings.lightTheme')}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className={`${theme === 'dark' ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
              >
                <Moon className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                {t('settings.darkTheme')}
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
                className={`${theme === 'system' ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
              >
                <Monitor className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                {t('settings.systemTheme')}
              </Button>
            </div>
          </div>

          <div className="bg-background rounded-lg border shadow-sm p-4">
            <h3 className="text-base font-medium mb-4 text-violet-800 dark:text-violet-300">{t('settings.language')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('settings.languageDesc')}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                onClick={() => setLanguage('en')}
                className={`${language === 'en' ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
              >
                <Globe className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                {t('settings.english')}
              </Button>
              <Button
                variant={language === 'ar' ? 'default' : 'outline'}
                onClick={() => setLanguage('ar')}
                className={`${language === 'ar' ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
              >
                <Globe className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                {t('settings.arabic')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-2 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
          <CardTitle className="text-blue-700 dark:text-blue-300">{t('settings.importExport')}</CardTitle>
          <CardDescription>
            {t('settings.importExportDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="bg-background p-4 rounded-lg border shadow-sm">
            <h3 className="text-base font-medium mb-2 text-blue-800 dark:text-blue-300">{t('settings.importDeck')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('settings.importDeckDesc')}
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
                className="border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-950/50"
              >
                <Import className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4 text-blue-600 dark:text-blue-400`} />
                {isImporting ? t('settings.importing') : t('settings.importButton')}
              </Button>
            </div>

            {importError && (
              <p className="mt-2 text-sm text-red-500">{importError}</p>
            )}

            {importSuccess && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">{importSuccess}</p>
            )}
          </div>

          <div className="bg-background p-4 rounded-lg border shadow-sm">
            <h3 className="text-base font-medium mb-2 text-blue-800 dark:text-blue-300">{t('settings.exportDeck')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('settings.exportDeckDesc')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-2 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-b">
          <CardTitle className="text-red-700 dark:text-red-300">{t('settings.dataManagement')}</CardTitle>
          <CardDescription>
            {t('settings.dataManagementDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="bg-background p-4 rounded-lg border shadow-sm">
            <h3 className="text-base font-medium mb-2 text-red-800 dark:text-red-300">{t('settings.clearData')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('settings.clearDataDesc')}
            </p>
            <Button
              variant="destructive"
              onClick={onClearAllData}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
              {t('settings.clearDataButton')}
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-lg border">
            <h3 className="text-base font-medium mb-2 text-blue-800 dark:text-blue-300">{t('settings.about')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('settings.aboutDesc')}
            </p>

            <div className="mt-4 p-4 bg-background rounded-md flex items-start space-x-3 border shadow-sm">
              <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1 text-blue-800 dark:text-blue-300">{t('settings.howItWorks')}</p>
                <p className="text-muted-foreground">
                  {t('settings.howItWorksDesc')}
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
