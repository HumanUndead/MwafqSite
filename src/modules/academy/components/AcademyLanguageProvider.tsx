'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import {
  writeAcademyLanguageCookie,
  type AcademyLanguage,
} from '../academyLanguage.shared';

interface AcademyLanguageContext {
  language: AcademyLanguage;
  setLanguage: (language: AcademyLanguage) => void;
}

const Context = createContext<AcademyLanguageContext | null>(null);

/** Current academy language; `null` outside an academy page. */
export function useAcademyLanguage(): AcademyLanguageContext | null {
  return useContext(Context);
}

export function AcademyLanguageProvider({
  language,
  children,
}: {
  language: AcademyLanguage;
  children: ReactNode;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const setLanguage = useCallback(
    (next: AcademyLanguage) => {
      writeAcademyLanguageCookie(next);
      // Academy API routes read the cookie: refetch everything academy.
      void queryClient.invalidateQueries({
        predicate: (query) => String(query.queryKey[0]).startsWith('academy'),
      });
      router.refresh();
    },
    [queryClient, router]
  );

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
