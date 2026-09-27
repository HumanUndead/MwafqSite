import type { Locale } from '@/i18n/config';

/** Academy content languages (independent of the site's en/ar UI). */
export const ACADEMY_LANGUAGES = ['en', 'ar', 'ur', 'ne', 'bn', 'hi'] as const;
export type AcademyLanguage = (typeof ACADEMY_LANGUAGES)[number];

export const ACADEMY_LANGUAGE_LABELS: Record<AcademyLanguage, string> = {
  en: 'English',
  ar: 'العربية',
  ur: 'اردو',
  ne: 'नेपाली',
  bn: 'বাংলা',
  hi: 'हिन्दी',
};

/** Cookie so server-rendered academy pages load content in this language. */
export const ACADEMY_LANGUAGE_COOKIE = 'mwafq-academy-lang';

const RTL_LANGUAGES: ReadonlySet<AcademyLanguage> = new Set(['ar', 'ur']);

export function isAcademyLanguage(value: unknown): value is AcademyLanguage {
  return (
    typeof value === 'string' &&
    (ACADEMY_LANGUAGES as readonly string[]).includes(value)
  );
}

export function academyDir(language: AcademyLanguage): 'rtl' | 'ltr' {
  return RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr';
}

/** Stored choice, else the site locale. */
export function resolveAcademyLanguage(
  stored: string | null | undefined,
  siteLocale: Locale
): AcademyLanguage {
  return isAcademyLanguage(stored) ? stored : siteLocale;
}

/** Client-side setter (1 year, whole site). */
export function writeAcademyLanguageCookie(language: AcademyLanguage) {
  document.cookie = `${ACADEMY_LANGUAGE_COOKIE}=${language}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}
