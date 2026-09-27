import 'server-only';

import { cookies } from 'next/headers';
import type { Locale } from '@/i18n/config';
import {
  ACADEMY_LANGUAGE_COOKIE,
  resolveAcademyLanguage,
  type AcademyLanguage,
} from '../academyLanguage.shared';

export async function getAcademyLanguage(
  siteLocale: Locale
): Promise<AcademyLanguage> {
  const cookieStore = await cookies();
  return resolveAcademyLanguage(
    cookieStore.get(ACADEMY_LANGUAGE_COOKIE)?.value,
    siteLocale
  );
}

/**
 * `culture` for academy upstream calls: the academy language cookie, else
 * the given site locale (route `?locale=`), else English.
 */
export async function getAcademyCulture(
  fallback: string | null | undefined
): Promise<AcademyLanguage> {
  const siteLocale: Locale = fallback === 'ar' ? 'ar' : 'en';
  return getAcademyLanguage(siteLocale);
}
