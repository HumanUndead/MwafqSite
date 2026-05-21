import 'server-only';
import type { Dictionary } from '@/locales/types';
import type { Locale } from './config';
import en from '@/locales/en';

type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mergeDictionaries<T extends PlainObject>(
  base: T,
  override: PlainObject
): T {
  const result: PlainObject = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const baseValue = result[key];

    if (Array.isArray(value)) {
      result[key] = value;
      continue;
    }

    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      baseValue &&
      typeof baseValue === 'object' &&
      !Array.isArray(baseValue)
    ) {
      result[key] = mergeDictionaries(
        baseValue as PlainObject,
        value as PlainObject
      );
      continue;
    }

    result[key] = value;
  }

  return result as T;
}

// Adding a new language = add one line here + create src/locales/<code>.ts
const dictionaries: Record<Locale, () => Promise<unknown>> = {
  en: () => import('@/locales/en').then((m) => m.default),
  ar: () => import('@/locales/ar').then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const dictionary = await dictionaries[locale]();

  if (!isPlainObject(dictionary)) {
    return en as Dictionary;
  }

  if (locale === 'en') {
    return dictionary as unknown as Dictionary;
  }

  return mergeDictionaries(
    en as unknown as PlainObject,
    dictionary
  ) as unknown as Dictionary;
}
