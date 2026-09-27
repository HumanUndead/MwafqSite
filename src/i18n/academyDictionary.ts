import 'server-only';

import { cache } from 'react';
import type { Dictionary } from '@/locales/types';
import {
  isAcademyLanguage,
  type AcademyLanguage,
} from '@/modules/academy/academyLanguage.shared';
import { getAcademyLanguage } from '@/modules/academy/server/academyLanguage';
import type { Locale } from './config';
import { getDictionary } from './dictionaries';

/** Namespaces that follow the academy language instead of the site locale. */
export const ACADEMY_NAMESPACES = [
  'academyCourseDetails',
  'academyCourses',
  'academyEnroll',
  'academyPayment',
  'academyPlayer',
  'academyLecture',
  'academyQuiz',
  'profileAcademy',
] as const;

type AcademyNamespace = (typeof ACADEMY_NAMESPACES)[number];
type AcademyCopy = Pick<Dictionary, AcademyNamespace>;
type PlainObject = Record<string, unknown>;

function merge(base: PlainObject, override: PlainObject): PlainObject {
  const result: PlainObject = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = result[key];
    result[key] =
      value && typeof value === 'object' && !Array.isArray(value) && current && typeof current === 'object'
        ? merge(current as PlainObject, value as PlainObject)
        : value;
  }
  return result;
}

const EXTRA_LANGUAGES: Record<
  Exclude<AcademyLanguage, Locale>,
  () => Promise<{ default: unknown }>
> = {
  ur: () => import('@/locales/academy/ur'),
  ne: () => import('@/locales/academy/ne'),
  bn: () => import('@/locales/academy/bn'),
  hi: () => import('@/locales/academy/hi'),
};

function pick(dict: Dictionary): AcademyCopy {
  return Object.fromEntries(ACADEMY_NAMESPACES.map((ns) => [ns, dict[ns]])) as AcademyCopy;
}

async function academyCopy(language: AcademyLanguage): Promise<AcademyCopy> {
  if (language === 'en' || language === 'ar') return pick(await getDictionary(language));
  const english = pick(await getDictionary('en'));
  const extra = (await EXTRA_LANGUAGES[language]()).default as PlainObject;
  return merge(english as unknown as PlainObject, extra) as unknown as AcademyCopy;
}

/**
 * Site dictionary for `locale` with the academy namespaces in the academy
 * language (cookie; defaults to the site locale).
 */
export const getAcademyDictionary = cache(
  async (locale: Locale): Promise<{ dict: Dictionary; language: AcademyLanguage }> => {
    const language = await getAcademyLanguage(locale);
    const [site, academy] = await Promise.all([getDictionary(locale), academyCopy(language)]);
    return { dict: { ...site, ...academy }, language };
  }
);

export async function getAcademyTranslations<K extends AcademyNamespace>(
  locale: Locale,
  namespace: K
): Promise<Dictionary[K]> {
  return (await getAcademyDictionary(locale)).dict[namespace];
}

export { isAcademyLanguage };
