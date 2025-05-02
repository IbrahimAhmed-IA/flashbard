import React, { createContext, useContext, useEffect, useState } from "react";
import { en } from '../lib/translations/en';
import { ar } from '../lib/translations/ar';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

type TranslationValue = string | { [key: string]: TranslationValue };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translations = language === 'ar' ? ar : en;
    const keys = key.split('.');
    let value: TranslationValue = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }

    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return params[key]?.toString() || match;
      });
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
