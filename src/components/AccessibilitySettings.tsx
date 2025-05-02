import React from 'react';
import { useAccessibility } from '../lib/accessibility';
import type { AccessibilitySettings } from '../lib/accessibility';
import { useLanguage } from './LanguageProvider';

export function AccessibilitySettings() {
  const { t } = useLanguage();
  const { settings, updateSettings } = useAccessibility();

  const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">{t('accessibility.title')}</h2>
        
        <div className="space-y-6">
          {/* High Contrast Mode */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{t('accessibility.highContrast')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('accessibility.highContrastDesc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Font Size */}
          <div>
            <h3 className="text-lg font-medium mb-2">{t('accessibility.fontSize')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('accessibility.fontSizeDesc')}
            </p>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="12"
                max="24"
                value={settings.fontSize}
                onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="text-sm">{settings.fontSize}px</span>
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{t('accessibility.reducedMotion')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('accessibility.reducedMotionDesc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Screen Reader Optimizations */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{t('accessibility.screenReader')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('accessibility.screenReaderDesc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.screenReader}
                onChange={(e) => handleSettingChange('screenReader', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 