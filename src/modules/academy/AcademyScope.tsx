import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import { getAcademyDictionary } from '@/i18n/academyDictionary';
import { DictionaryProvider } from '@/i18n/DictionaryProvider';
import { academyDir } from './academyLanguage.shared';
import { AcademyLanguageProvider } from './components/AcademyLanguageProvider';

/**
 * Academy pages: the `academy*` copy follows the academy language
 * (en, ar, ur, ne, bn, hi) and so does the text direction.
 */
export async function AcademyScope({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const { dict, language } = await getAcademyDictionary(locale);
  return (
    <DictionaryProvider dict={dict} locale={locale}>
      <AcademyLanguageProvider language={language}>
        <div dir={academyDir(language)} lang={language}>
          {children}
        </div>
      </AcademyLanguageProvider>
    </DictionaryProvider>
  );
}
