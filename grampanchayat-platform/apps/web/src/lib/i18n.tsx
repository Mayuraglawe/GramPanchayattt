'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../translations/en.json';
import mr from '../translations/mr.json';

type Language = 'en' | 'mr';
type TranslationDict = typeof en;

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const dictionaries: Record<Language, TranslationDict> = { en, mr };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('mr'); // default to Marathi First!

  useEffect(() => {
    const saved = localStorage.getItem('gp_lang') as Language;
    if (saved && (saved === 'en' || saved === 'mr')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('gp_lang', lang);
    document.cookie = `gp_lang=${lang}; path=/; max-age=31536000`; // 1 year expiry
  };

  const t = (path: string): string => {
    const dict = dictionaries[language];
    const keys = path.split('.');
    let result: unknown = dict;

    for (const key of keys) {
      if (result && typeof result === 'object' && result !== null && key in (result as Record<string, unknown>)) {
        result = (result as Record<string, unknown>)[key];
      } else {
        return path;
      }
    }

    return typeof result === 'string' ? result : path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
