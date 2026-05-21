'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Dictionary } from '@/locales/types';
import type { Locale } from './config';

interface I18nContext {
  dict: Dictionary;
  locale: Locale;
}

const Context = createContext<I18nContext | null>(null);

export function DictionaryProvider({
  dict,
  locale,
  children,
}: {
  dict: Dictionary;
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <Context.Provider value={{ dict, locale }}>{children}</Context.Provider>
  );
}

function useI18n(): I18nContext {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useI18n must be used within DictionaryProvider');
  return ctx;
}

export function useTranslations<K extends keyof Dictionary>(
  namespace: K
): Dictionary[K] {
  return useI18n().dict[namespace];
}

export function useLocale(): Locale {
  return useI18n().locale;
}
