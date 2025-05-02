import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { useAccessibility } from '../lib/accessibility';
import { animations } from '../lib/animations';
import { useBreakpoint } from '../lib/responsive';

interface UISettingsProps {
  onClose: () => void;
}

export const UISettings: React.FC<UISettingsProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const { settings, updateSettings } = useAccessibility();
  const breakpoint = useBreakpoint();

  const [animationSettings, setAnimationSettings] = useState({
    enabled: true,
    speed: 1,
    hoverEffects: true,
    pageTransitions: true
  });

  const [responsiveSettings, setResponsiveSettings] = useState({
    fontSize: 16,
    spacing: 1,
    gridColumns: {
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4
    }
  });

  const handleAnimationChange = (key: keyof typeof animationSettings, value: any) => {
    setAnimationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResponsiveChange = (key: keyof typeof responsiveSettings, value: any) => {
    setResponsiveSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGridColumnsChange = (breakpoint: keyof typeof responsiveSettings.gridColumns, value: number) => {
    setResponsiveSettings(prev => ({
      ...prev,
      gridColumns: {
        ...prev.gridColumns,
        [breakpoint]: value
      }
    }));
  };

  return (
    <div className="ui-settings">
      <h2>{t('ui.animations.title')}</h2>
      
      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={animationSettings.enabled}
            onChange={e => handleAnimationChange('enabled', e.target.checked)}
          />
          {t('ui.animations.enableAnimations')}
        </label>
        <p className="description">{t('ui.animations.enableAnimationsDesc')}</p>
      </div>

      <div className="setting-group">
        <label>
          {t('ui.animations.animationSpeed')}
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={animationSettings.speed}
            onChange={e => handleAnimationChange('speed', parseFloat(e.target.value))}
          />
        </label>
        <p className="description">{t('ui.animations.animationSpeedDesc')}</p>
      </div>

      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={animationSettings.hoverEffects}
            onChange={e => handleAnimationChange('hoverEffects', e.target.checked)}
          />
          {t('ui.animations.hoverEffects')}
        </label>
        <p className="description">{t('ui.animations.hoverEffectsDesc')}</p>
      </div>

      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={animationSettings.pageTransitions}
            onChange={e => handleAnimationChange('pageTransitions', e.target.checked)}
          />
          {t('ui.animations.pageTransitions')}
        </label>
        <p className="description">{t('ui.animations.pageTransitionsDesc')}</p>
      </div>

      <h2>{t('ui.responsive.title')}</h2>

      <div className="setting-group">
        <label>
          {t('ui.responsive.fontSize')}
          <input
            type="range"
            min="12"
            max="24"
            step="1"
            value={responsiveSettings.fontSize}
            onChange={e => handleResponsiveChange('fontSize', parseInt(e.target.value))}
          />
        </label>
        <p className="description">{t('ui.responsive.fontSizeDesc')}</p>
      </div>

      <div className="setting-group">
        <label>
          {t('ui.responsive.spacing')}
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={responsiveSettings.spacing}
            onChange={e => handleResponsiveChange('spacing', parseFloat(e.target.value))}
          />
        </label>
        <p className="description">{t('ui.responsive.spacingDesc')}</p>
      </div>

      <div className="setting-group">
        <label>
          {t('ui.responsive.gridColumns')}
          <div className="grid-columns-settings">
            {Object.entries(responsiveSettings.gridColumns).map(([bp, value]) => (
              <div key={bp} className="grid-column-setting">
                <span>{bp.toUpperCase()}</span>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={value}
                  onChange={e => handleGridColumnsChange(bp as keyof typeof responsiveSettings.gridColumns, parseInt(e.target.value))}
                />
              </div>
            ))}
          </div>
        </label>
        <p className="description">{t('ui.responsive.gridColumnsDesc')}</p>
      </div>

      <div className="actions">
        <button onClick={onClose}>{t('common.close')}</button>
      </div>
    </div>
  );
}; 