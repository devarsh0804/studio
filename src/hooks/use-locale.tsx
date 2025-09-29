
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '@/lib/locales/en.json';
import hi from '@/lib/locales/hi.json';
import or from '@/lib/locales/or.json';

type Locale = 'en' | 'hi' | 'or';

const translations = { en, hi, or };

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('en');
  
  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'hi' || browserLang === 'or') {
        setLocaleState(browserLang as Locale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const t = useCallback((key: string, values?: Record<string, string | number>): string => {
    const keys = key.split('.');
    
    const findTranslation = (localeToTry: Locale): string | undefined => {
        let result: any = translations[localeToTry];
        for (const k of keys) {
            result = result?.[k];
            if (result === undefined) return undefined;
        }
        return typeof result === 'string' ? result : undefined;
    };

    let translation = findTranslation(locale);

    if (translation === undefined) {
        translation = findTranslation('en');
    }
    
    if (translation === undefined) {
        return key;
    }

    if (values) {
        return translation.replace(/\{(\w+)\}/g, (placeholder, placeholderKey) => {
            return values[placeholderKey] !== undefined ? String(values[placeholderKey]) : placeholder;
        });
    }

    return translation;
}, [locale]);


  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
