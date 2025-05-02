import React, { useState } from 'react';
import { Deck } from '../types';
import { ExportOptions, ImportOptions, exportImportManager } from '../lib/exportImport';
import { useLanguage } from './LanguageProvider';

interface ExportImportProps {
  deck: Deck;
  onImport: (deck: Deck) => void;
}

export function ExportImport({ deck, onImport }: ExportImportProps) {
  const { t } = useLanguage();
  const [exportFormat, setExportFormat] = useState<ExportOptions['format']>('json');
  const [includeStats, setIncludeStats] = useState(true);
  const [includeMedia, setIncludeMedia] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);
  const [importFormat, setImportFormat] = useState<ImportOptions['format']>('json');
  const [mergeStrategy, setMergeStrategy] = useState<ImportOptions['mergeStrategy']>('merge');
  const [importData, setImportData] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleExport = async () => {
    try {
      const options: ExportOptions = {
        format: exportFormat,
        includeStats,
        includeMedia,
        includeTags,
      };

      const data = await exportImportManager.exportDeck(deck, options);
      
      // Create and download file
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deck.name.toLowerCase().replace(/\s+/g, '-')}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(t('exportImport.export.error', { error: (err as Error).message }));
    }
  };

  const handleImport = async () => {
    try {
      if (!importData.trim()) {
        setError(t('exportImport.import.emptyData'));
        return;
      }

      const options: ImportOptions = {
        format: importFormat,
        mergeStrategy,
      };

      const importedDeck = await exportImportManager.importDeck(importData, options);
      onImport(importedDeck);
      setImportData('');
      setError('');
    } catch (err) {
      setError(t('exportImport.import.error', { error: (err as Error).message }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Export Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{t('exportImport.export.title')}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('exportImport.export.format')}</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportOptions['format'])}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="txt">TXT</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeStats}
                onChange={(e) => setIncludeStats(e.target.checked)}
                className="rounded"
              />
              <span>{t('exportImport.export.includeStats')}</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeMedia}
                onChange={(e) => setIncludeMedia(e.target.checked)}
                className="rounded"
              />
              <span>{t('exportImport.export.includeMedia')}</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeTags}
                onChange={(e) => setIncludeTags(e.target.checked)}
                className="rounded"
              />
              <span>{t('exportImport.export.includeTags')}</span>
            </label>
          </div>

          <button
            onClick={handleExport}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            {t('exportImport.export.exportButton')}
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{t('exportImport.import.title')}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('exportImport.import.format')}</label>
            <select
              value={importFormat}
              onChange={(e) => setImportFormat(e.target.value as ImportOptions['format'])}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="txt">TXT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('exportImport.import.mergeStrategy')}</label>
            <select
              value={mergeStrategy}
              onChange={(e) => setMergeStrategy(e.target.value as ImportOptions['mergeStrategy'])}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="replace">{t('exportImport.import.replaceExisting')}</option>
              <option value="merge">{t('exportImport.import.mergeWithExisting')}</option>
              <option value="skip">{t('exportImport.import.skipDuplicates')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('exportImport.import.deckData')}</label>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="w-full h-32 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder={t('exportImport.import.pastePlaceholder')}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            onClick={handleImport}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            {t('exportImport.import.importButton')}
          </button>
        </div>
      </div>
    </div>
  );
} 