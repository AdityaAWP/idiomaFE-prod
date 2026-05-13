'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SupportedLocale, translations } from '../i18n/translations';

interface LanguageContextValue {
  language: SupportedLocale;
  setLanguage: (lang: SupportedLocale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'English',
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLocale>('English');

  // Load saved language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('idiomamate_language') as SupportedLocale | null;
    if (saved && saved in translations) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: SupportedLocale) => {
    setLanguageState(lang);
    localStorage.setItem('idiomamate_language', lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[language]?.[key] ?? translations['English'][key] ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
