'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from './translations';

type TranslationType = typeof translations.de;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('de');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_language') as Language;
      if (saved === 'de' || saved === 'en') {
        setLanguageState(saved);
      }
    } catch {
      // localStorage may fail in restricted sandbox/iframe
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('app_language', lang);
    } catch {
      // ignore storage error
    }
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
