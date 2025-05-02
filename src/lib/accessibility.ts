import { useEffect, useState } from 'react';

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: number;
  reducedMotion: boolean;
  screenReader: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  fontSize: 16,
  reducedMotion: false,
  screenReader: false,
};

class AccessibilityManager {
  private settings: AccessibilitySettings;
  private listeners: Set<(settings: AccessibilitySettings) => void>;

  constructor() {
    this.settings = this.loadSettings();
    this.listeners = new Set();
    this.applySettings();
  }

  private loadSettings(): AccessibilitySettings {
    const saved = localStorage.getItem('accessibilitySettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  }

  private saveSettings() {
    localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
    this.applySettings();
    this.notifyListeners();
  }

  private applySettings() {
    // Apply high contrast
    document.documentElement.classList.toggle('high-contrast', this.settings.highContrast);
    
    // Apply font size
    document.documentElement.style.fontSize = `${this.settings.fontSize}px`;
    
    // Apply reduced motion
    document.documentElement.classList.toggle('reduced-motion', this.settings.reducedMotion);
    
    // Apply screen reader optimizations
    document.documentElement.setAttribute('aria-live', this.settings.screenReader ? 'polite' : 'off');
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.settings));
  }

  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  updateSettings(updates: Partial<AccessibilitySettings>) {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  subscribe(listener: (settings: AccessibilitySettings) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Keyboard navigation helpers
  static handleKeyNavigation(
    event: KeyboardEvent,
    options: {
      onEnter?: () => void;
      onEscape?: () => void;
      onArrowUp?: () => void;
      onArrowDown?: () => void;
      onArrowLeft?: () => void;
      onArrowRight?: () => void;
      onTab?: () => void;
    }
  ) {
    switch (event.key) {
      case 'Enter':
        options.onEnter?.();
        break;
      case 'Escape':
        options.onEscape?.();
        break;
      case 'ArrowUp':
        options.onArrowUp?.();
        break;
      case 'ArrowDown':
        options.onArrowDown?.();
        break;
      case 'ArrowLeft':
        options.onArrowLeft?.();
        break;
      case 'ArrowRight':
        options.onArrowRight?.();
        break;
      case 'Tab':
        options.onTab?.();
        break;
    }
  }

  // Screen reader announcement
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }
}

export const accessibilityManager = new AccessibilityManager();

// React hook for accessibility settings
export function useAccessibility() {
  const [settings, setSettings] = useState(accessibilityManager.getSettings());

  useEffect(() => {
    const unsubscribe = accessibilityManager.subscribe(setSettings);
    return () => {
      unsubscribe();
    };
  }, []);

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    accessibilityManager.updateSettings(updates);
  };

  return { settings, updateSettings };
} 